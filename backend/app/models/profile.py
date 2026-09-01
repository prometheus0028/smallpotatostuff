from pydantic import BaseModel, Field
from typing import Literal


class RiskProfile(BaseModel):
    risk_profile: Literal["conservative", "moderate", "aggressive"]
    volatility_tolerance: float = Field(ge=0.0, le=1.0)
    position_size_tolerance: float = Field(ge=0.0, le=1.0)


class UserProfile(BaseModel):
    user_id: str
    name: str
    risk_profile: RiskProfile
    created_at: str = "2024-01-01T00:00:00Z"

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "demo-conservative",
                "name": "Conservative Investor",
                "risk_profile": {
                    "risk_profile": "conservative",
                    "volatility_tolerance": 0.15,
                    "position_size_tolerance": 0.10,
                },
            }
        }