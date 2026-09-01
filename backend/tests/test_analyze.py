"""Tests for the analysis pipeline."""

import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.services.market import MarketService
from app.services.profile import ProfileService
from app.services.portfolio import PortfolioService
from app.services.synthesis import SynthesisEngine
from app.agents.technical import TechnicalAgent
from app.agents.sentiment import SentimentAgent
from app.agents.fundamental import FundamentalAgent
from app.models.analysis import AnalysisRequest
from app.models.agent import AgentResult


client = TestClient(app)


class TestHealthEndpoint:
    def test_health_check(self):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "financial-intelligence-backend"


class TestMarketEndpoint:
    def test_get_reliance_market_data(self):
        response = client.get("/api/market/RELIANCE")
        assert response.status_code == 200
        data = response.json()
        assert data["symbol"] == "RELIANCE"
        assert data["price"] == 1428.50
        assert "rsi" in data
        assert "momentum" in data

    def test_get_unknown_symbol(self):
        response = client.get("/api/market/UNKNOWN")
        assert response.status_code == 404


class TestProfileEndpoint:
    def test_get_conservative_profile(self):
        response = client.get("/api/profile/demo-conservative")
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == "demo-conservative"
        assert data["risk_profile"]["risk_profile"] == "conservative"
        assert data["risk_profile"]["volatility_tolerance"] == 0.15

    def test_get_aggressive_profile(self):
        response = client.get("/api/profile/demo-aggressive")
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == "demo-aggressive"
        assert data["risk_profile"]["risk_profile"] == "aggressive"
        assert data["risk_profile"]["volatility_tolerance"] == 0.30

    def test_get_unknown_profile(self):
        response = client.get("/api/profile/unknown")
        assert response.status_code == 404


class TestPortfolioEndpoint:
    def test_get_conservative_portfolio(self):
        response = client.get("/api/portfolio/demo-conservative")
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == "demo-conservative"
        assert len(data["holdings"]) > 0
        assert data["holdings"][0]["symbol"] == "RELIANCE"

    def test_get_aggressive_portfolio(self):
        response = client.get("/api/portfolio/demo-aggressive")
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == "demo-aggressive"
        assert len(data["holdings"]) == 3


class TestAnalyzeEndpoint:
    @pytest.mark.asyncio
    async def test_analyze_conservative_reliance(self):
        """Test full analysis pipeline for conservative profile."""
        request = {"user_id": "demo-conservative", "symbol": "RELIANCE"}
        response = client.post("/api/analyze", json=request)
        assert response.status_code == 200

        data = response.json()
        assert "session_id" in data
        assert data["symbol"] == "RELIANCE"
        assert "market" in data
        assert "profile" in data
        assert "portfolio" in data
        assert "agents" in data
        assert "synthesis" in data
        assert "reasoning_trace" in data
        assert "metrics" in data

        # Check agents
        agents = data["agents"]
        assert "technical" in agents
        assert "sentiment" in agents
        assert "fundamental" in agents

        # Check synthesis
        synthesis = data["synthesis"]
        assert synthesis["action"] in ["BUY", "HOLD", "REDUCE", "INSUFFICIENT_EVIDENCE"]
        assert 0 <= synthesis["confidence"] <= 1

        # Check reasoning trace
        trace = data["reasoning_trace"]
        events = [e["event"] for e in trace]
        assert "market_data_received" in events
        assert "technical_started" in events
        assert "sentiment_started" in events
        assert "fundamental_started" in events
        assert "technical_completed" in events
        assert "sentiment_completed" in events
        assert "fundamental_completed" in events
        assert "synthesis_started" in events
        assert "synthesis_completed" in events
        assert "recommendation_generated" in events

        # Check metrics
        metrics = data["metrics"]
        assert "total_latency_ms" in metrics
        assert "parallel_execution_ms" in metrics
        assert "technical_latency_ms" in metrics
        assert "sentiment_latency_ms" in metrics
        assert "fundamental_latency_ms" in metrics
        assert "portfolio_concentration_score" in metrics

    @pytest.mark.asyncio
    async def test_analyze_aggressive_reliance(self):
        """Test analysis with aggressive profile - should potentially give different result."""
        request = {"user_id": "demo-aggressive", "symbol": "RELIANCE"}
        response = client.post("/api/analyze", json=request)
        assert response.status_code == 200

        data = response.json()
        assert data["profile"]["user_id"] == "demo-aggressive"
        assert data["profile"]["risk_profile"]["risk_profile"] == "aggressive"

    @pytest.mark.asyncio
    async def test_parallel_execution(self):
        """Verify agents run in parallel by checking timing."""
        request = {"user_id": "demo-conservative", "symbol": "RELIANCE"}
        response = client.post("/api/analyze", json=request)
        assert response.status_code == 200

        data = response.json()
        metrics = data["metrics"]

        # Parallel execution should be less than sequential estimate
        assert metrics["parallel_execution_ms"] <= metrics["sequential_estimated_ms"]
        assert metrics["parallelism_saved_ms"] >= 0

        # Individual agent latencies should be recorded
        assert metrics["technical_latency_ms"] > 0
        assert metrics["sentiment_latency_ms"] > 0
        assert metrics["fundamental_latency_ms"] > 0

    @pytest.mark.asyncio
    async def test_source_propagation(self):
        """Verify fundamental sources propagate to synthesis."""
        request = {"user_id": "demo-conservative", "symbol": "RELIANCE"}
        response = client.post("/api/analyze", json=request)
        assert response.status_code == 200

        data = response.json()
        fundamental = data["agents"]["fundamental"]
        synthesis = data["synthesis"]

        # Fundamental agent should have sources
        assert "sources" in fundamental
        # Synthesis should include sources
        assert "sources" in synthesis


class TestDegradedMode:
    @pytest.mark.asyncio
    async def test_degraded_mode_enable(self):
        """Test enabling degraded mode."""
        response = client.post("/api/demo/degraded-data", json={"enabled": True})
        assert response.status_code == 200
        assert response.json()["degraded_mode"] is True

    @pytest.mark.asyncio
    async def test_degraded_mode_analysis(self):
        """Test analysis in degraded mode returns INSUFFICIENT_EVIDENCE."""
        # Enable degraded mode
        client.post("/api/demo/degraded-data", json={"enabled": True})

        request = {"user_id": "demo-conservative", "symbol": "RELIANCE"}
        response = client.post("/api/analyze", json=request)
        assert response.status_code == 200

        data = response.json()
        assert data["degraded"] is True
        assert "Fundamental document retrieval unavailable" in data["warnings"]

        # Fundamental agent should have confidence 0
        fundamental = data["agents"]["fundamental"]
        assert fundamental["confidence"] == 0.0
        assert "Insufficient fundamental evidence" in fundamental["risk_flags"]

        # Synthesis should return INSUFFICIENT_EVIDENCE or handle gracefully
        synthesis = data["synthesis"]
        assert synthesis["action"] in ["INSUFFICIENT_EVIDENCE", "HOLD"]

        # Disable degraded mode for other tests
        client.post("/api/demo/degraded-data", json={"enabled": False})


class TestSessionEndpoint:
    @pytest.mark.asyncio
    async def test_session_storage_and_retrieval(self):
        """Test session storage and retrieval."""
        request = {"user_id": "demo-conservative", "symbol": "RELIANCE"}
        response = client.post("/api/analyze", json=request)
        assert response.status_code == 200

        data = response.json()
        session_id = data["session_id"]

        # Retrieve session
        session_response = client.get(f"/api/session/{session_id}")
        assert session_response.status_code == 200
        session_data = session_response.json()
        assert session_data["session_id"] == session_id
        assert session_data["symbol"] == "RELIANCE"

    @pytest.mark.asyncio
    async def test_unknown_session(self):
        response = client.get("/api/session/unknown-session-id")
        assert response.status_code == 404


class TestAgents:
    @pytest.mark.asyncio
    async def test_technical_agent(self):
        """Test technical agent produces valid output."""
        from app.services.market import MarketService
        from app.services.profile import ProfileService
        from app.services.portfolio import PortfolioService
        from app.agents.base import AgentContext

        market_service = MarketService()
        profile_service = ProfileService()
        portfolio_service = PortfolioService()

        market = await market_service.get_market_data("RELIANCE")
        profile = await profile_service.get_profile("demo-conservative")
        portfolio = await portfolio_service.get_portfolio("demo-conservative")

        context = AgentContext(
            symbol="RELIANCE",
            market_data=market,
            user_profile=profile,
            portfolio=portfolio,
        )

        agent = TechnicalAgent()
        result = await agent.analyze(context)

        assert isinstance(result, AgentResult)
        assert result.agent == "technical"
        assert result.signal in ["BULLISH", "BEARISH", "NEUTRAL"]
        assert 0 <= result.confidence <= 1
        assert isinstance(result.reasoning, list)
        assert isinstance(result.risk_flags, list)
        assert result.latency_ms >= 0

    @pytest.mark.asyncio
    async def test_sentiment_agent(self):
        """Test sentiment agent produces valid output."""
        from app.services.market import MarketService
        from app.services.profile import ProfileService
        from app.services.portfolio import PortfolioService
        from app.agents.base import AgentContext

        market_service = MarketService()
        profile_service = ProfileService()
        portfolio_service = PortfolioService()

        market = await market_service.get_market_data("RELIANCE")
        profile = await profile_service.get_profile("demo-conservative")
        portfolio = await portfolio_service.get_portfolio("demo-conservative")

        context = AgentContext(
            symbol="RELIANCE",
            market_data=market,
            user_profile=profile,
            portfolio=portfolio,
        )

        agent = SentimentAgent()
        result = await agent.analyze(context)

        assert isinstance(result, AgentResult)
        assert result.agent == "sentiment"
        assert result.signal in ["BULLISH", "BEARISH", "NEUTRAL"]
        assert 0 <= result.confidence <= 1

    @pytest.mark.asyncio
    async def test_fundamental_agent(self):
        """Test fundamental agent produces valid output."""
        from app.services.market import MarketService
        from app.services.profile import ProfileService
        from app.services.portfolio import PortfolioService
        from app.agents.base import AgentContext

        market_service = MarketService()
        profile_service = ProfileService()
        portfolio_service = PortfolioService()

        market = await market_service.get_market_data("RELIANCE")
        profile = await profile_service.get_profile("demo-conservative")
        portfolio = await portfolio_service.get_portfolio("demo-conservative")

        context = AgentContext(
            symbol="RELIANCE",
            market_data=market,
            user_profile=profile,
            portfolio=portfolio,
        )

        agent = FundamentalAgent()
        result = await agent.analyze(context)

        assert isinstance(result, AgentResult)
        assert result.agent == "fundamental"
        assert result.signal in ["BULLISH", "BEARISH", "NEUTRAL"]
        assert 0 <= result.confidence <= 1


class TestSynthesis:
    def test_synthesis_with_bullish_agents(self):
        """Test synthesis with all bullish agents."""
        from app.models.market import MarketData
        from app.models.profile import UserProfile, RiskProfile
        from app.models.portfolio import Portfolio, Holding, Watchlist
        from app.models.agent import AgentResult
        from datetime import datetime

        market = MarketData(
            symbol="RELIANCE", price=1428.50, change_pct=1.84, volume=8420000,
            avg_volume=6200000, rsi=63.4, momentum=0.72, volatility=0.19,
            sector_change_pct=1.12, sentiment_score=0.68
        )

        profile = UserProfile(
            user_id="demo-aggressive",
            name="Aggressive",
            risk_profile=RiskProfile(risk_profile="aggressive", volatility_tolerance=0.30, position_size_tolerance=0.30)
        )

        portfolio = Portfolio(
            user_id="demo-aggressive",
            holdings=[],
            watchlist=Watchlist(symbols=[])
        )

        agents = {
            "technical": AgentResult(agent="technical", signal="BULLISH", confidence=0.8, reasoning=[], risk_flags=[], sources=[], latency_ms=10, started_at=datetime.utcnow(), completed_at=datetime.utcnow()),
            "sentiment": AgentResult(agent="sentiment", signal="BULLISH", confidence=0.75, reasoning=[], risk_flags=[], sources=[], latency_ms=10, started_at=datetime.utcnow(), completed_at=datetime.utcnow()),
            "fundamental": AgentResult(agent="fundamental", signal="BULLISH", confidence=0.7, reasoning=[], risk_flags=[], sources=[], latency_ms=10, started_at=datetime.utcnow(), completed_at=datetime.utcnow()),
        }

        engine = SynthesisEngine()
        result = engine.synthesize(agents, market, profile, portfolio)

        assert result.action == "BUY"
        assert result.confidence > 0.5

    def test_synthesis_with_no_fundamental_evidence(self):
        """Test synthesis handles missing fundamental evidence."""
        from app.models.market import MarketData
        from app.models.profile import UserProfile, RiskProfile
        from app.models.portfolio import Portfolio, Watchlist
        from app.models.agent import AgentResult
        from datetime import datetime

        market = MarketData(
            symbol="RELIANCE", price=1428.50, change_pct=1.84, volume=8420000,
            avg_volume=6200000, rsi=63.4, momentum=0.72, volatility=0.19,
            sector_change_pct=1.12, sentiment_score=0.68
        )

        profile = UserProfile(
            user_id="demo-conservative",
            name="Conservative",
            risk_profile=RiskProfile(risk_profile="conservative", volatility_tolerance=0.15, position_size_tolerance=0.10)
        )

        portfolio = Portfolio(
            user_id="demo-conservative",
            holdings=[],
            watchlist=Watchlist(symbols=[])
        )

        agents = {
            "technical": AgentResult(agent="technical", signal="BULLISH", confidence=0.8, reasoning=[], risk_flags=[], sources=[], latency_ms=10, started_at=datetime.utcnow(), completed_at=datetime.utcnow()),
            "sentiment": AgentResult(agent="sentiment", signal="BULLISH", confidence=0.75, reasoning=[], risk_flags=[], sources=[], latency_ms=10, started_at=datetime.utcnow(), completed_at=datetime.utcnow()),
            "fundamental": AgentResult(agent="fundamental", signal="NEUTRAL", confidence=0.0, reasoning=["No evidence"], risk_flags=["Insufficient fundamental evidence"], sources=[], latency_ms=10, started_at=datetime.utcnow(), completed_at=datetime.utcnow()),
        }

        engine = SynthesisEngine()
        result = engine.synthesize(agents, market, profile, portfolio)

        # With conservative profile and no fundamental evidence, should be INSUFFICIENT_EVIDENCE or HOLD
        assert result.action in ["INSUFFICIENT_EVIDENCE", "HOLD"]
        assert "Fundamental evidence unavailable" in result.risk_adjustment


class TestPortfolioConcentration:
    def test_concentration_calculation(self):
        """Test portfolio concentration (Herfindahl-Hirschman Index)."""
        from app.models.portfolio import Portfolio, Holding, Watchlist

        portfolio = Portfolio(
            user_id="test",
            holdings=[
                Holding(symbol="A", quantity=10, allocation=0.5),
                Holding(symbol="B", quantity=10, allocation=0.3),
                Holding(symbol="C", quantity=10, allocation=0.2),
            ],
            watchlist=Watchlist(symbols=[])
        )

        service = PortfolioService()
        concentration = service.calculate_concentration(portfolio)

        # 0.5^2 + 0.3^2 + 0.2^2 = 0.25 + 0.09 + 0.04 = 0.38
        assert abs(concentration - 0.38) < 0.001

    def test_concentration_single_holding(self):
        """Test concentration with single holding."""
        from app.models.portfolio import Portfolio, Holding, Watchlist

        portfolio = Portfolio(
            user_id="test",
            holdings=[Holding(symbol="A", quantity=100, allocation=1.0)],
            watchlist=Watchlist(symbols=[])
        )

        service = PortfolioService()
        concentration = service.calculate_concentration(portfolio)

        assert concentration == 1.0