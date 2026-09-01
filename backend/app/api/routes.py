"""API Routes for the Financial Intelligence Backend."""

import time
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from ..core.config import settings
from ..models.market import MarketData
from ..models.profile import UserProfile
from ..models.portfolio import Portfolio
from ..models.agent import AgentResult
from ..models.analysis import (
    AnalysisRequest,
    AnalysisResponse,
    ReasoningEvent,
    SessionMetrics,
)
from ..services.market import MarketService
from ..services.profile import ProfileService
from ..services.portfolio import PortfolioService
from ..services.rag import set_degraded_mode, is_degraded_mode
from ..services.synthesis import SynthesisEngine
from ..services.session import session_store
from ..agents.technical import TechnicalAgent
from ..agents.sentiment import SentimentAgent
from ..agents.fundamental import FundamentalAgent
from ..agents.base import AgentContext


router = APIRouter()

# Initialize services
market_service = MarketService()
profile_service = ProfileService()
portfolio_service = PortfolioService()
synthesis_engine = SynthesisEngine()

# Initialize agents
technical_agent = TechnicalAgent()
sentiment_agent = SentimentAgent()
fundamental_agent = FundamentalAgent()

# Try to initialize OpenAI client for fundamental agent
try:
    from openai import AsyncOpenAI
    if settings.openai_api_key:
        openai_client = AsyncOpenAI(api_key=settings.openai_api_key)
        fundamental_agent = FundamentalAgent(openai_client=openai_client)
except Exception:
    openai_client = None
    fundamental_agent = FundamentalAgent(openai_client=None)


class DegradedDataRequest(BaseModel):
    enabled: bool


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "financial-intelligence-backend",
        "version": "1.0.0",
        "openai_configured": bool(settings.openai_api_key),
        "supabase_configured": bool(settings.supabase_url),
    }


@router.get("/api/market/{symbol}")
async def get_market_data(symbol: str):
    """Get market data for a symbol."""
    data = await market_service.get_market_data(symbol.upper())
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Market data not found for symbol: {symbol}",
        )
    return data


@router.get("/api/profile/{user_id}")
async def get_profile(user_id: str):
    """Get user profile."""
    profile = await profile_service.get_profile(user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile not found for user: {user_id}",
        )
    return profile


@router.get("/api/portfolio/{user_id}")
async def get_portfolio(user_id: str):
    """Get user portfolio."""
    portfolio = await portfolio_service.get_portfolio(user_id)
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Portfolio not found for user: {user_id}",
        )
    return portfolio


@router.post("/api/analyze", response_model=AnalysisResponse)
async def analyze(request: AnalysisRequest):
    """Run complete multi-agent analysis for a user and symbol.

    This is the main endpoint that:
    1. Loads market data, user profile, and portfolio
    2. Runs three specialist agents in PARALLEL
    3. Synthesizes results with risk personalization
    4. Returns complete analysis with reasoning trace and metrics
    """
    start_time = time.perf_counter()
    parallel_start = time.perf_counter()
    reasoning_trace: list[ReasoningEvent] = []

    def add_event(event: str, details: Dict[str, Any] = None):
        reasoning_trace.append(ReasoningEvent(
            event=event,
            timestamp=datetime.utcnow(),
            details=details or {}
        ))

    # 1. Load market data
    market = await market_service.get_market_data(request.symbol.upper())
    if not market:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Market data not found for symbol: {request.symbol}",
        )
    add_event("market_data_received", {"symbol": request.symbol})

    # 2. Load user profile
    profile = await profile_service.get_profile(request.user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile not found for user: {request.user_id}",
        )

    # 3. Load portfolio
    portfolio = await portfolio_service.get_portfolio(request.user_id)
    if not portfolio:
        # Create empty portfolio if not found
        portfolio = Portfolio(user_id=request.user_id, holdings=[], watchlist={"symbols": []})

    # 4. Create agent context
    context = AgentContext(
        symbol=request.symbol.upper(),
        market_data=market,
        user_profile=profile,
        portfolio=portfolio,
    )

    # 5. Run three specialist agents IN PARALLEL
    add_event("technical_started")
    add_event("sentiment_started")
    add_event("fundamental_started")

    # Execute agents concurrently using asyncio.gather
    results = await asyncio.gather(
        technical_agent.analyze(context),
        sentiment_agent.analyze(context),
        fundamental_agent.analyze(context),
        return_exceptions=True,
    )

    parallel_end = time.perf_counter()
    parallel_execution_ms = int((parallel_end - parallel_start) * 1000)

    # Process results and handle failures
    agent_results: Dict[str, AgentResult] = {}
    agent_names = ["technical", "sentiment", "fundamental"]
    individual_latencies = {}

    for i, (name, result) in enumerate(zip(agent_names, results)):
        if isinstance(result, Exception):
            # Agent failed - create failure result
            completed_at = datetime.utcnow()
            agent_results[name] = AgentResult(
                agent=name,
                signal="NEUTRAL",
                confidence=0.0,
                reasoning=[f"{name.capitalize()} agent error: {str(result)}"],
                risk_flags=[f"Missing {name} evidence due to error"],
                sources=[],
                latency_ms=0,
                started_at=datetime.utcnow(),
                completed_at=completed_at,
            )
            individual_latencies[f"{name}_latency_ms"] = 0
            add_event(f"{name}_completed", {"error": str(result), "latency_ms": 0})
        else:
            agent_results[name] = result
            individual_latencies[f"{name}_latency_ms"] = result.latency_ms
            add_event(f"{name}_completed", {"latency_ms": result.latency_ms})

    add_event("synthesis_started")

    # 6. Run synthesis
    synthesis = synthesis_engine.synthesize(
        agents=agent_results,
        market=market,
        profile=profile,
        portfolio=portfolio,
    )

    add_event("synthesis_completed")

    # 7. Generate final recommendation event
    add_event("recommendation_generated", {
        "action": synthesis.action,
        "confidence": synthesis.confidence,
    })

    # 8. Calculate metrics
    total_latency_ms = int((time.perf_counter() - start_time) * 1000)
    sequential_estimated_ms = sum(individual_latencies.values())
    parallelism_saved_ms = max(0, sequential_estimated_ms - parallel_execution_ms)

    # Portfolio concentration
    concentration_score = portfolio_service.calculate_concentration(portfolio)

    # Simulated forward return (explicitly labeled as simulated)
    simulated_forward_return = None
    if synthesis.action == "BUY":
        simulated_forward_return = 0.02 + (synthesis.confidence * 0.03)
    elif synthesis.action == "REDUCE":
        simulated_forward_return = -0.015 - (synthesis.confidence * 0.02)

    metrics = SessionMetrics(
        total_latency_ms=total_latency_ms,
        parallel_execution_ms=parallel_execution_ms,
        sequential_estimated_ms=sequential_estimated_ms,
        parallelism_saved_ms=parallelism_saved_ms,
        technical_latency_ms=individual_latencies.get("technical_latency_ms", 0),
        sentiment_latency_ms=individual_latencies.get("sentiment_latency_ms", 0),
        fundamental_latency_ms=individual_latencies.get("fundamental_latency_ms", 0),
        portfolio_concentration_score=concentration_score,
        simulated_forward_return=simulated_forward_return,
    )

    # 9. Build response
    degraded = is_degraded_mode()
    warnings = []
    if degraded:
        warnings.append("Fundamental document retrieval unavailable (degraded mode)")

    # Check for any agent failures
    for name, result in agent_results.items():
        if result.confidence == 0 and "error" in str(result.reasoning).lower():
            warnings.append(f"{name.capitalize()} agent unavailable")

    response = AnalysisResponse(
        session_id="",  # Will be set by session store
        symbol=request.symbol.upper(),
        market=market,
        profile=profile,
        portfolio=portfolio,
        agents=agent_results,
        synthesis=synthesis,
        reasoning_trace=reasoning_trace,
        metrics=metrics,
        degraded=degraded,
        warnings=warnings,
    )

    # 10. Store session
    session_id = session_store.create_session(response)
    response.session_id = session_id

    return response


@router.get("/api/session/{session_id}")
async def get_session(session_id: str):
    """Retrieve a stored analysis session."""
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session not found: {session_id}",
        )
    return session


@router.post("/api/demo/degraded-data")
async def toggle_degraded_mode(request: DegradedDataRequest):
    """Toggle degraded data mode for demo purposes.

    When enabled, fundamental document retrieval returns empty results
    to simulate unavailable fundamental evidence.
    """
    set_degraded_mode(request.enabled)
    return {
        "degraded_mode": request.enabled,
        "message": "Degraded mode enabled - fundamental evidence will be unavailable" if request.enabled else "Degraded mode disabled - normal operation restored",
    }


@router.get("/api/demo/degraded-data")
async def get_degraded_mode_status():
    """Get current degraded mode status."""
    return {
        "degraded_mode": is_degraded_mode(),
    }