from typing import Dict, Optional
from ..models.market import MarketData
from datetime import datetime


# Simulated market data for demo stocks
SIMULATED_MARKET_DATA: Dict[str, MarketData] = {
    "RELIANCE": MarketData(
        symbol="RELIANCE",
        price=1428.50,
        change_pct=1.84,
        volume=8420000,
        avg_volume=6200000,
        rsi=63.4,
        momentum=0.72,
        volatility=0.19,
        sector_change_pct=1.12,
        sentiment_score=0.68,
    ),
    "HDFCBANK": MarketData(
        symbol="HDFCBANK",
        price=1675.30,
        change_pct=0.92,
        volume=5200000,
        avg_volume=4800000,
        rsi=58.2,
        momentum=0.45,
        volatility=0.14,
        sector_change_pct=0.65,
        sentiment_score=0.55,
    ),
    "TATAMOTORS": MarketData(
        symbol="TATAMOTORS",
        price=892.15,
        change_pct=-0.67,
        volume=12500000,
        avg_volume=9800000,
        rsi=42.1,
        momentum=-0.32,
        volatility=0.28,
        sector_change_pct=-1.23,
        sentiment_score=0.38,
    ),
}


class MarketService:
    """Market data service with simulated data for demo purposes.

    In production, this would connect to a real market data provider.
    """

    def __init__(self):
        self._data = SIMULATED_MARKET_DATA.copy()

    async def get_market_data(self, symbol: str) -> Optional[MarketData]:
        """Get market data for a symbol."""
        symbol = symbol.upper()
        if symbol in self._data:
            # Return a copy with updated timestamp
            data = self._data[symbol].model_copy()
            data.timestamp = datetime.utcnow()
            return data
        return None

    async def get_available_symbols(self) -> list[str]:
        """Get list of available symbols."""
        return list(self._data.keys())