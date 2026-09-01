from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class MarketData(BaseModel):
    symbol: str
    price: float
    change_pct: float
    volume: int
    avg_volume: int
    rsi: float
    momentum: float
    volatility: float
    sector_change_pct: float
    sentiment_score: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "symbol": "RELIANCE",
                "price": 1428.50,
                "change_pct": 1.84,
                "volume": 8420000,
                "avg_volume": 6200000,
                "rsi": 63.4,
                "momentum": 0.72,
                "volatility": 0.19,
                "sector_change_pct": 1.12,
                "sentiment_score": 0.68,
            }
        }