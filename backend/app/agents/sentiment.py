"""Sentiment Analysis Agent.

Analyzes market sentiment, sector momentum, and behavioral signals
to generate a sentiment-based trading signal.
"""

import time
from datetime import datetime
from typing import List, Dict, Any
from .base import BaseAgent, AgentContext


class SentimentAgent(BaseAgent):
    """Sentiment analysis specialist agent."""

    agent_name = "sentiment"

    async def analyze(self, context: AgentContext) -> AgentResult:
        started_at = datetime.utcnow()
        start_time = time.perf_counter()

        market = context.market_data
        reasoning: List[str] = []
        risk_flags: List[str] = []

        # Sentiment Score Analysis
        if market.sentiment_score >= 0.7:
            reasoning.append(f"Strong positive sentiment score: {market.sentiment_score:.2f}")
        elif market.sentiment_score >= 0.5:
            reasoning.append(f"Moderately positive sentiment score: {market.sentiment_score:.2f}")
        elif market.sentiment_score >= 0.3:
            reasoning.append(f"Neutral sentiment score: {market.sentiment_score:.2f}")
        else:
            reasoning.append(f"Negative sentiment score: {market.sentiment_score:.2f}")
            risk_flags.append("Negative market sentiment")

        # Sector Momentum Analysis
        if market.sector_change_pct > 1.5:
            reasoning.append(f"Strong sector outperformance: {market.sector_change_pct:.2f}%")
        elif market.sector_change_pct > 0:
            reasoning.append(f"Positive sector momentum: {market.sector_change_pct:.2f}%")
        elif market.sector_change_pct > -1.5:
            reasoning.append(f"Sector underperformance: {market.sector_change_pct:.2f}%")
        else:
            reasoning.append(f"Significant sector weakness: {market.sector_change_pct:.2f}%")
            risk_flags.append("Sector headwinds")

        # Volume Behavior as Sentiment Proxy
        volume_ratio = market.volume / market.avg_volume if market.avg_volume > 0 else 1.0
        if volume_ratio > 1.5 and market.change_pct > 0:
            reasoning.append("High volume on up-move indicates accumulation")
        elif volume_ratio > 1.5 and market.change_pct < 0:
            reasoning.append("High volume on down-move indicates distribution")
            risk_flags.append("Distribution pattern detected")

        # Price vs Sentiment Alignment
        price_sentiment_aligned = (market.change_pct > 0 and market.sentiment_score > 0.5) or \
                                   (market.change_pct < 0 and market.sentiment_score < 0.5)
        if price_sentiment_aligned:
            reasoning.append("Price action aligned with sentiment")
        else:
            reasoning.append("Price-sentiment divergence detected")
            risk_flags.append("Price-sentiment divergence")

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
        """Calculate sentiment signal and confidence."""
        score = 0.0

        # Sentiment score contribution (40% weight)
        score += (market.sentiment_score - 0.5) * 0.8

        # Sector momentum contribution (30% weight)
        score += (market.sector_change_pct / 100) * 0.3 * 5

        # Volume confirmation (20% weight)
        if volume_ratio > 1.2 and market.change_pct > 0:
            score += 0.15
        elif volume_ratio > 1.2 and market.change_pct < 0:
            score -= 0.15

        # Price-sentiment alignment (10% weight)
        price_sentiment_aligned = (market.change_pct > 0 and market.sentiment_score > 0.5) or \
                                   (market.change_pct < 0 and market.sentiment_score < 0.5)
        if price_sentiment_aligned:
            score += 0.1
        else:
            score -= 0.1

        confidence = min(abs(score) + 0.35, 0.9)

        if score > 0.15:
            return "BULLISH", confidence
        elif score < -0.15:
            return "BEARISH", confidence
        else:
            return "NEUTRAL", max(confidence - 0.1, 0.35)