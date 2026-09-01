"""Technical Analysis Agent.

Analyzes price action, volume, momentum, and volatility indicators
to generate a technical trading signal.
"""

import time
from datetime import datetime
from typing import List, Dict, Any
from .base import BaseAgent, AgentContext
from ..models.agent import AgentResult


class TechnicalAgent(BaseAgent):
    """Technical analysis specialist agent."""

    agent_name = "technical"

    async def analyze(self, context: AgentContext) -> AgentResult:
        started_at = datetime.utcnow()
        start_time = time.perf_counter()

        market = context.market_data
        reasoning: List[str] = []
        risk_flags: List[str] = []

        # RSI Analysis
        if market.rsi >= 70:
            reasoning.append(f"RSI at {market.rsi:.1f} indicates overbought conditions")
            risk_flags.append("Overbought RSI")
        elif market.rsi <= 30:
            reasoning.append(f"RSI at {market.rsi:.1f} indicates oversold conditions")
        else:
            reasoning.append(f"RSI at {market.rsi:.1f} indicates positive momentum")

        # Momentum Analysis
        if market.momentum > 0.5:
            reasoning.append("Strong positive price momentum")
        elif market.momentum > 0:
            reasoning.append("Positive price momentum")
        elif market.momentum > -0.5:
            reasoning.append("Weak negative momentum")
        else:
            reasoning.append("Strong negative price momentum")

        # Volume Analysis
        volume_ratio = market.volume / market.avg_volume if market.avg_volume > 0 else 1.0
        if volume_ratio > 1.5:
            reasoning.append(f"Trading volume {volume_ratio:.1f}x above average - strong conviction")
        elif volume_ratio > 1.0:
            reasoning.append(f"Trading volume {volume_ratio:.1f}x above average")
        else:
            reasoning.append(f"Trading volume below average ({volume_ratio:.1f}x) - weak conviction")
            risk_flags.append("Weak volume confirmation")

        # Volatility Analysis
        if market.volatility > 0.25:
            risk_flags.append("Elevated volatility")
        elif market.volatility > 0.15:
            risk_flags.append("Moderate volatility")

        # Price Change Analysis
        if market.change_pct > 2.0:
            reasoning.append(f"Strong daily gain of {market.change_pct:.2f}%")
        elif market.change_pct > 0:
            reasoning.append(f"Positive daily change of {market.change_pct:.2f}%")
        elif market.change_pct > -2.0:
            reasoning.append(f"Modest daily decline of {abs(market.change_pct):.2f}%")
        else:
            reasoning.append(f"Significant daily decline of {abs(market.change_pct):.2f}%")

        # Determine signal and confidence
        signal, confidence = self._calculate_signal(market, volume_ratio)

        completed_at = datetime.utcnow()
        latency_ms = int((time.perf_counter() - start_time) * 1000)

        return self._create_result(
            signal=signal,
            confidence=confidence,
            reasoning=reasoning,
            risk_flags=risk_flags,
            sources=[],
            latency_ms=latency_ms,
            started_at=started_at,
            completed_at=completed_at,
        )

    def _calculate_signal(self, market, volume_ratio: float) -> tuple[str, float]:
        """Calculate technical signal and confidence based on indicators."""
        score = 0.0
        factors = 0

        # RSI contribution (30% weight)
        if market.rsi >= 70:
            score -= 0.3
        elif market.rsi <= 30:
            score += 0.3
        elif market.rsi > 50:
            score += 0.15
        else:
            score -= 0.15
        factors += 1

        # Momentum contribution (25% weight)
        score += market.momentum * 0.25
        factors += 1

        # Volume contribution (20% weight)
        if volume_ratio > 1.5:
            score += 0.2
        elif volume_ratio > 1.0:
            score += 0.1
        else:
            score -= 0.1
        factors += 1

        # Price change contribution (15% weight)
        score += (market.change_pct / 100) * 0.15 * 5  # normalize
        factors += 1

        # Volatility penalty (10% weight)
        if market.volatility > 0.25:
            score -= 0.1
        factors += 1

        # Normalize confidence
        confidence = min(abs(score) + 0.3, 0.95)

        if score > 0.2:
            return "BULLISH", confidence
        elif score < -0.2:
            return "BEARISH", confidence
        else:
            return "NEUTRAL", max(confidence - 0.15, 0.4)