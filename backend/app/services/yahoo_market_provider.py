"""Yahoo Finance market data provider.

Fetches real OHLCV data from Yahoo Finance Chart API (no API key required).
Calculates derived technical indicators locally.
Upserts results into the existing Supabase market_snapshots table.

The existing MarketService reads from market_snapshots unchanged.

Fields obtained from Yahoo Finance:
  price, change_pct, volume, historical closes/volumes

Fields calculated locally from historical data:
  avg_volume (20-day SMA), RSI (14-period), momentum (10-period ROC), volatility (20-day annualized)

Fields preserved from existing seeded rows (not legitimately available from price API):
  sentiment_score, forward_return, sector_change_pct (not in DB schema)
"""

import math
import urllib.request
import json
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ── Ticker mapping: internal symbol → Yahoo Finance NSE ticker ──────────────
SYMBOL_TO_TICKER: dict[str, str] = {
    "RELIANCE":   "RELIANCE.NS",
    "HDFCBANK":   "HDFCBANK.NS",
    # TATAMOTORS.NS currently returns 404 on Yahoo Finance; fallback used.
    # "TATAMOTORS": "TATAMOTORS.NS",
}

YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?interval=1d&range=1mo"
REQUEST_TIMEOUT = 10


def _fetch_yahoo_chart(ticker: str) -> Optional[dict]:
    """Fetch Yahoo Finance v8 chart JSON for a ticker. Returns None on failure."""
    url = YAHOO_CHART_URL.format(ticker=ticker)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        results = data.get("chart", {}).get("result")
        if not results:
            logger.warning("Yahoo Finance returned no result for %s", ticker)
            return None
        return results[0]
    except Exception as exc:
        logger.warning("Yahoo Finance fetch failed for %s: %s", ticker, exc)
        return None


def _calculate_rsi(closes: list[float], period: int = 14) -> float:
    """Calculate RSI from a list of closing prices."""
    if len(closes) < period + 1:
        return 50.0
    diffs = [closes[i] - closes[i - 1] for i in range(1, len(closes))]
    recent = diffs[-period:]
    gains = [d for d in recent if d > 0]
    losses = [-d for d in recent if d < 0]
    avg_gain = sum(gains) / period
    avg_loss = sum(losses) / period
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return round(100.0 - 100.0 / (1.0 + rs), 2)


def _calculate_momentum(closes: list[float], period: int = 10) -> float:
    """Rate of change over `period` bars: (price_t - price_{t-n}) / price_{t-n}."""
    if len(closes) < period + 1:
        return 0.0
    return round((closes[-1] - closes[-(period + 1)]) / closes[-(period + 1)], 4)


def _calculate_volatility(closes: list[float], period: int = 20) -> float:
    """Annualised volatility from log returns over `period` bars."""
    if len(closes) < period + 1:
        return 0.15
    log_returns = [
        math.log(closes[i] / closes[i - 1])
        for i in range(len(closes) - period, len(closes))
    ]
    mean = sum(log_returns) / len(log_returns)
    variance = sum((r - mean) ** 2 for r in log_returns) / (len(log_returns) - 1)
    return round(math.sqrt(variance) * math.sqrt(252), 4)


def fetch_live_snapshot(symbol: str) -> Optional[dict]:
    """Fetch a live market snapshot for an internal symbol from Yahoo Finance.

    Returns a dict with keys matching market_snapshots columns, or None if
    the symbol is not mapped or Yahoo is unavailable.

    Fields returned:
        symbol, price, change_pct, volume, avg_volume, rsi, momentum, volatility

    Fields NOT returned (must be preserved from existing seed):
        sentiment_score, forward_return
    """
    ticker = SYMBOL_TO_TICKER.get(symbol.upper())
    if not ticker:
        logger.info("No Yahoo Finance ticker mapping for symbol %s — skipping live fetch", symbol)
        return None

    chart = _fetch_yahoo_chart(ticker)
    if chart is None:
        return None

    meta = chart.get("meta", {})
    quote = chart.get("indicators", {}).get("quote", [{}])[0]

    price = meta.get("regularMarketPrice")
    if price is None:
        logger.warning("regularMarketPrice is None for %s (%s)", symbol, ticker)
        return None
    price = float(price)

    prev_close = meta.get("chartPreviousClose")
    if prev_close and float(prev_close) > 0:
        change_pct = round((price - float(prev_close)) / float(prev_close) * 100.0, 2)
    else:
        change_pct = 0.0

    closes = [c for c in quote.get("close", []) if c is not None]
    volumes = [v for v in quote.get("volume", []) if v is not None]

    volume = float(volumes[-1]) if volumes else 0.0
    window = volumes[-20:] if len(volumes) >= 1 else volumes
    avg_volume = float(sum(window) / len(window)) if window else 0.0

    rsi = _calculate_rsi(closes)
    momentum = _calculate_momentum(closes)
    volatility = _calculate_volatility(closes)

    return {
        "symbol": symbol.upper(),
        # --- Live fields from Yahoo ---
        "price": price,
        "change_pct": change_pct,
        "volume": round(volume),
        "avg_volume": round(avg_volume),
        # --- Derived from historical OHLCV ---
        "rsi": rsi,
        "momentum": momentum,
        "volatility": volatility,
        # sentiment_score and forward_return are intentionally excluded;
        # they must be preserved from the existing seeded row in Supabase.
    }


def upsert_market_snapshot(symbol: str, dry_run: bool = False) -> Optional[dict]:
    """Fetch live data and upsert into Supabase market_snapshots.

    Preserves existing sentiment_score and forward_return from the seeded row.
    Inserts a new snapshot row; MarketService reads the latest row by created_at DESC.

    Returns the final snapshot dict written, or None on failure.
    """
    live = fetch_live_snapshot(symbol)
    if live is None:
        logger.info("No live snapshot available for %s — skipping upsert", symbol)
        return None

    # Retrieve seeded sentiment_score and forward_return to preserve them
    sentiment_score = 0.5
    forward_return = None
    try:
        from backend.app.db.supabase import get_supabase_client
        client = get_supabase_client()
        if client:
            existing = (
                client.table("market_snapshots")
                .select("sentiment_score, forward_return")
                .eq("symbol", symbol.upper())
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )
            if existing.data:
                row = existing.data[0]
                sentiment_score = float(row.get("sentiment_score") or 0.5)
                forward_return = row.get("forward_return")
    except Exception as exc:
        logger.warning("Could not read existing sentiment_score for %s: %s", symbol, exc)

    snapshot = {
        **live,
        "sentiment_score": sentiment_score,
    }
    if forward_return is not None:
        snapshot["forward_return"] = float(forward_return)

    if dry_run:
        logger.info("[DRY RUN] Would upsert for %s: %s", symbol, snapshot)
        return snapshot

    try:
        from backend.app.db.supabase import get_supabase_client
        client = get_supabase_client()
        if not client:
            logger.warning("Supabase client unavailable — cannot upsert market snapshot for %s", symbol)
            return None
        client.table("market_snapshots").insert(snapshot).execute()
        logger.info("Upserted market snapshot for %s: price=%.2f", symbol, live["price"])
    except Exception as exc:
        logger.error("Failed to upsert market snapshot for %s: %s", symbol, exc)
        return None

    return snapshot


SUPPORTED_SYMBOLS = list(SYMBOL_TO_TICKER.keys())
