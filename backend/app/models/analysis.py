from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
from .market import MarketData
from .profile import UserProfile
from .portfolio import Portfolio
from .agent import AgentResult


class AnalysisRequest(BaseModel):
    user_id: str
    symbol: str


class ReasoningEvent(BaseModel):
    event: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    details: Dict[str, Any] = Field(default_factory=dict)


class SessionMetrics(BaseModel):
    total_latency_ms: int
    parallel_execution_ms: int
    sequential_estimated_ms: int
    parallelism_saved_ms: int
    technical_latency_ms: int
    sentiment_latency_ms: int
    fundamental_latency_ms: int
    portfolio_concentration_score: float
    simulated_forward_return: Optional[float] = None


class SynthesisResult(BaseModel):
    action: Literal["BUY", "HOLD", "REDUCE", "INSUFFICIENT_EVIDENCE"]
    confidence: float = Field(ge=0.0, le=1.0)
    summary: str
    reasons: List[str] = Field(default_factory=list)
    risk_adjustment: str
    sources: List[Dict[str, Any]] = Field(default_factory=list)
    base_score: float = 0.0
    risk_adjusted_score: float = 0.0


class AnalysisResponse(BaseModel):
    session_id: str
    symbol: str
    market: MarketData
    profile: UserProfile
    portfolio: Portfolio
    agents: Dict[str, AgentResult]
    synthesis: SynthesisResult
    reasoning_trace: List[ReasoningEvent]
    metrics: SessionMetrics
    degraded: bool = False
    warnings: List[str] = Field(default_factory=list)

    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "abc123",
                "symbol": "RELIANCE",
                "market": {
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
                },
                "profile": {
                    "user_id": "demo-conservative",
                    "name": "Conservative Investor",
                    "risk_profile": {
                        "risk_profile": "conservative",
                        "volatility_tolerance": 0.15,
                        "position_size_tolerance": 0.10,
                    },
                },
                "portfolio": {
                    "user_id": "demo-conservative",
                    "holdings": [{"symbol": "RELIANCE", "quantity": 20, "allocation": 0.18}],
                    "watchlist": {"symbols": ["RELIANCE", "HDFCBANK"]},
                },
                "agents": {
                    "technical": {
                        "agent": "technical",
                        "signal": "BULLISH",
                        "confidence": 0.78,
                        "reasoning": ["Positive price momentum", "RSI indicates positive momentum"],
                        "risk_flags": ["Elevated volatility"],
                        "sources": [],
                        "latency_ms": 45,
                    },
                    "sentiment": {
                        "agent": "sentiment",
                        "signal": "BULLISH",
                        "confidence": 0.72,
                        "reasoning": ["Positive sector momentum", "Strong sentiment score"],
                        "risk_flags": [],
                        "sources": [],
                        "latency_ms": 38,
                    },
                    "fundamental": {
                        "agent": "fundamental",
                        "signal": "NEUTRAL",
                        "confidence": 0.65,
                        "reasoning": ["Revenue growth stable", "Debt levels manageable"],
                        "risk_flags": [],
                        "sources": [{"document_id": "doc1", "title": "Annual Report"}],
                        "latency_ms": 120,
                    },
                },
                "synthesis": {
                    "action": "BUY",
                    "confidence": 0.71,
                    "summary": "Technical and sentiment signals support upside, fundamental evidence neutral",
                    "reasons": ["Strong technical momentum", "Positive sentiment"],
                    "risk_adjustment": "Conservative profile reduces position size due to volatility",
                    "sources": [{"document_id": "doc1", "title": "Annual Report"}],
                },
                "reasoning_trace": [
                    {"event": "market_data_received", "timestamp": "2024-01-01T00:00:00Z", "details": {}},
                    {"event": "technical_started", "timestamp": "2024-01-01T00:00:00Z", "details": {}},
                    {"event": "sentiment_started", "timestamp": "2024-01-01T00:00:00Z", "details": {}},
                    {"event": "fundamental_started", "timestamp": "2024-01-01T00:00:00Z", "details": {}},
                    {"event": "technical_completed", "timestamp": "2024-01-01T00:00:00Z", "details": {"latency_ms": 45}},
                    {"event": "sentiment_completed", "timestamp": "2024-01-01T00:00:00Z", "details": {"latency_ms": 38}},
                    {"event": "fundamental_completed", "timestamp": "2024-01-01T00:01:00Z", "details": {"latency_ms": 120}},
                    {"event": "synthesis_started", "timestamp": "2024-01-01T00:01:00Z", "details": {}},
                    {"event": "synthesis_completed", "timestamp": "2024-01-01T00:01:00Z", "details": {}},
                    {"event": "recommendation_generated", "timestamp": "2024-01-01T00:01:00Z", "details": {}},
                ],
                "metrics": {
                    "total_latency_ms": 203,
                    "parallel_execution_ms": 120,
                    "sequential_estimated_ms": 203,
                    "parallelism_saved_ms": 83,
                    "technical_latency_ms": 45,
                    "sentiment_latency_ms": 38,
                    "fundamental_latency_ms": 120,
                    "portfolio_concentration_score": 0.0324,
                    "simulated_forward_return": 0.02,
                },
                "degraded": False,
                "warnings": [],
            }
        }