from typing import Dict, Optional
from ..models.portfolio import Portfolio, Holding, Watchlist


# Demo portfolios
DEMO_PORTFOLIOS: Dict[str, Portfolio] = {
    "demo-conservative": Portfolio(
        user_id="demo-conservative",
        holdings=[Holding(symbol="RELIANCE", quantity=20, allocation=0.18)],
        watchlist=Watchlist(symbols=["RELIANCE", "HDFCBANK"]),
    ),
    "demo-aggressive": Portfolio(
        user_id="demo-aggressive",
        holdings=[
            Holding(symbol="RELIANCE", quantity=50, allocation=0.35),
            Holding(symbol="HDFCBANK", quantity=30, allocation=0.25),
            Holding(symbol="TATAMOTORS", quantity=40, allocation=0.20),
        ],
        watchlist=Watchlist(symbols=["RELIANCE", "HDFCBANK", "TATAMOTORS"]),
    ),
    "demo-moderate": Portfolio(
        user_id="demo-moderate",
        holdings=[
            Holding(symbol="RELIANCE", quantity=30, allocation=0.25),
            Holding(symbol="HDFCBANK", quantity=20, allocation=0.15),
        ],
        watchlist=Watchlist(symbols=["RELIANCE", "HDFCBANK", "TATAMOTORS"]),
    ),
}


ALIAS_MAP = {
    "demo-conservative": "11111111-1111-1111-1111-111111111111",
    "demo-aggressive": "22222222-2222-2222-2222-222222222222",
}


class PortfolioService:
    """Portfolio service."""

    def __init__(self):
        self._portfolios = DEMO_PORTFOLIOS.copy()

    async def get_portfolio(self, user_id: str) -> Optional[Portfolio]:
        """Get portfolio by user ID."""
        actual_id = ALIAS_MAP.get(user_id, user_id)

        try:
            from ..db.supabase import get_supabase_client
            client = get_supabase_client()
            if client:
                res_port = client.table("portfolio").select("*").eq("user_id", actual_id).execute()
                if not res_port.data and user_id != actual_id:
                    res_port = client.table("portfolio").select("*").eq("user_id", user_id).execute()

                res_watch = client.table("watchlist").select("*").eq("user_id", actual_id).execute()
                if not res_watch.data and user_id != actual_id:
                    res_watch = client.table("watchlist").select("*").eq("user_id", user_id).execute()

                if res_port.data or res_watch.data:
                    holdings_list = []
                    total_val = sum(float(r.get("quantity", 0)) * float(r.get("avg_buy_price", 1)) for r in res_port.data)
                    for r in res_port.data:
                        val = float(r.get("quantity", 0)) * float(r.get("avg_buy_price", 1))
                        alloc = val / total_val if total_val > 0 else 0.2
                        holdings_list.append(Holding(
                            symbol=str(r.get("symbol", "")),
                            quantity=float(r.get("quantity", 0)),
                            allocation=round(alloc, 4)
                        ))

                    watch_symbols = [str(r.get("symbol", "")) for r in res_watch.data]

                    return Portfolio(
                        user_id=user_id,
                        holdings=holdings_list,
                        watchlist=Watchlist(symbols=watch_symbols)
                    )
        except Exception:
            pass

        return self._portfolios.get(user_id)

    async def get_available_portfolios(self) -> list[str]:
        """Get list of available portfolio user IDs."""
        return list(self._portfolios.keys())

    def calculate_concentration(self, portfolio: Portfolio) -> float:
        """Calculate portfolio concentration using Herfindahl-Hirschman Index (sum of squared weights)."""
        return sum(h.allocation ** 2 for h in portfolio.holdings)