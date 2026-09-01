from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
from ..models.agent import AgentResult, AgentSource


@dataclass
class AgentContext:
    """Context passed to agents during execution."""
    symbol: str
    market_data: Any  # MarketData
    user_profile: Any  # UserProfile
    portfolio: Any  # Portfolio


class BaseAgent:
    """Base class for specialist agents."""

    agent_name: str = "base"

    async def analyze(self, context: AgentContext) -> AgentResult:
        """Analyze and return structured result.

        Override in subclasses.
        """
        raise NotImplementedError

    def _create_result(
        self,
        signal: str,
        confidence: float,
        reasoning: List[str],
        risk_flags: List[str],
        sources: List[Dict[str, Any]],
        latency_ms: int,
        started_at: datetime,
        completed_at: datetime,
    ) -> AgentResult:
        """Create a standardized AgentResult."""
        return AgentResult(
            agent=self.agent_name,
            signal=signal,
            confidence=confidence,
            reasoning=reasoning,
            risk_flags=risk_flags,
            sources=[AgentSource(**s) for s in sources],
            latency_ms=latency_ms,
            started_at=started_at,
            completed_at=completed_at,
        )

    def _create_failure_result(
        self,
        error_message: str,
        started_at: datetime,
        completed_at: datetime,
    ) -> AgentResult:
        """Create a failure result for error handling."""
        return AgentResult(
            agent=self.agent_name,
            signal="NEUTRAL",
            confidence=0.0,
            reasoning=[f"{self.agent_name.capitalize()} agent unavailable: {error_message}"],
            risk_flags=[f"Missing {self.agent_name} evidence"],
            sources=[],
            latency_ms=int((completed_at - started_at).total_seconds() * 1000),
            started_at=started_at,
            completed_at=completed_at,
        )