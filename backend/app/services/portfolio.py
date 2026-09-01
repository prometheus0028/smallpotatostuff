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


class PortfolioService:
    """Portfolio service."""

    def __init__(self):
        self._portfolios = DEMO_PORTFOLIOS.copy()

    async def get_portfolio(self, user_id: str) -> Optional[Portfolio]:
        """Get portfolio by user ID."""
        return self._portfolios.get(user_id)

    async def get_available_portfolios(self) -> list[str]:
        """Get list of available portfolio user IDs."""
        return list(self._portfolios.keys())

    def calculate_concentration(self, portfolio: Portfolio) -> float:
        """Calculate portfolio concentration using Herfindahl-Hirschman Index (sum of squared weights)."""
        return sum(h.allocation ** 2 for h in portfolio.holdings)