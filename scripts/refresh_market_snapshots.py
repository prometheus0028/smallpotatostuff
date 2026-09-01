#!/usr/bin/env python
"""Refresh market snapshots from Yahoo Finance.

Usage:
    python scripts/refresh_market_snapshots.py
    python scripts/refresh_market_snapshots.py --symbol RELIANCE
    python scripts/refresh_market_snapshots.py --dry-run

Fetches live data for supported symbols, calculates technical indicators,
and upserts into the existing Supabase market_snapshots table.
Symbols without a Yahoo Finance ticker mapping (e.g., TATAMOTORS) are
skipped gracefully; existing Supabase seed data remains available.
"""

import argparse
import logging
import sys
import os

# Make the workspace root importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(description="Refresh Supabase market snapshots from Yahoo Finance")
    parser.add_argument("--symbol", help="Single symbol to refresh (default: all supported)")
    parser.add_argument("--dry-run", action="store_true", help="Fetch data but do not write to Supabase")
    args = parser.parse_args()

    from backend.app.services.yahoo_market_provider import (
        upsert_market_snapshot,
        SUPPORTED_SYMBOLS,
    )

    symbols = [args.symbol.upper()] if args.symbol else SUPPORTED_SYMBOLS
    dry_run = args.dry_run

    if dry_run:
        logger.info("DRY RUN — no writes to Supabase")

    results = {}
    for sym in symbols:
        logger.info("Fetching %s ...", sym)
        snapshot = upsert_market_snapshot(sym, dry_run=dry_run)
        if snapshot:
            results[sym] = snapshot
            logger.info(
                "  %-12s  price=%.2f  change_pct=%.2f%%  rsi=%.1f  mom=%.4f  vol=%.4f  avg_vol=%d",
                sym,
                snapshot["price"],
                snapshot["change_pct"],
                snapshot["rsi"],
                snapshot["momentum"],
                snapshot["volatility"],
                snapshot["avg_volume"],
            )
        else:
            logger.warning("  %-12s  No live data — existing Supabase row preserved", sym)

    print("\n=== Summary ===")
    for sym, snap in results.items():
        print(f"  {sym}: price={snap['price']:.2f}, change_pct={snap['change_pct']:.2f}%, "
              f"rsi={snap['rsi']:.1f}, momentum={snap['momentum']:.4f}, "
              f"volatility={snap['volatility']:.4f}, avg_vol={int(snap['avg_volume'])}")
    skipped = [s for s in symbols if s not in results]
    if skipped:
        print(f"  Skipped (no Yahoo ticker or fetch failed): {', '.join(skipped)}")

    print("\nDone.")


if __name__ == "__main__":
    main()
