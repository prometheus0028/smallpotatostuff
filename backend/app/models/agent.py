from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from datetime import datetime


class AgentSignal(str):
    BULLISH = "BULLISH"
    BEARISH = "BEARISH"
    NEUTRAL = "NEUTRAL"


class AgentSource(BaseModel):
    document_id: Optional[str] = None
    title: Optional[str] = None
    source: Optional[str] = None
    chunk_text: Optional[str] = None
    similarity: Optional[float] = None


class AgentResult(BaseModel):
    agent: Literal["technical", "sentiment", "fundamental"]
    signal: Literal["BULLISH", "BEARISH", "NEUTRAL"]
    confidence: float = Field(ge=0.0, le=1.0)
    reasoning: List[str] = Field(default_factory=list)
    risk_flags: List[str] = Field(default_factory=list)
    sources: List[AgentSource] = Field(default_factory=list)
    latency_ms: int = 0
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "agent": "technical",
                "signal": "BULLISH",
                "confidence": 0.78,
                "reasoning": [
                    "Positive price momentum",
                    "RSI indicates positive momentum",
                    "Trading volume is above average",
                ],
                "risk_flags": ["Elevated volatility"],
                "sources": [],
                "latency_ms": 45,
            }
        }