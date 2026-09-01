from pydantic import BaseModel, Field
from typing import List


class Holding(BaseModel):
    symbol: str
    quantity: int
    allocation: float = Field(ge=0.0, le=1.0)


class Watchlist(BaseModel):
    symbols: List[str]


class Portfolio(BaseModel):
    user_id: str
    holdings: List[Holding]
    watchlist: Watchlist

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "demo-conservative",
                "holdings": [
                    {"symbol": "RELIANCE", "quantity": 20, "allocation": 0.18}
                ],
                "watchlist": {"symbols": ["RELIANCE", "HDFCBANK"]},
            }
        }