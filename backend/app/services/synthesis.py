"""Synthesis Layer.

Combines outputs from all three specialist agents, applies risk personalization
based on user profile, and generates the final recommendation with reasoning.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from ..models.analysis import SynthesisResult, SessionMetrics
from ..models.agent import AgentResult
from ..models.market import MarketData
from ..models.profile import UserProfile
from ..models.portfolio import Portfolio
from ..services.portfolio import PortfolioService


class SynthesisEngine:
    """Synthesis and decision engine."""

    # Agent weights for base score calculation
    WEIGHTS = {
        "technical": 0.30,
        "sentiment": 0.25,
        "fundamental": 0.30,
        "risk_adjustment": 0.15,
    }

    # Signal to numeric mapping
    SIGNAL_MAP = {
        "BULLISH": 1.0,
        "NEUTRAL": 0.0,
        "BEARISH": -1.0,
    }

    # Action thresholds
    BUY_THRESHOLD = 0.45
    REDUCE_THRESHOLD = -0.45

    def __init__(self):
        self.portfolio_service = PortfolioService()

    def synthesize(
        self,
        agents: Dict[str, AgentResult],
        market: MarketData,
        profile: UserProfile,
        portfolio: Portfolio,
    ) -> SynthesisResult:
        """Run synthesis and return final recommendation."""
        # Calculate base score from agent signals
        base_score = self._calculate_base_score(agents)

        # Calculate risk adjustment
        risk_adjustment, risk_explanation = self._calculate_risk_adjustment(
            agents, market, profile, portfolio
        )

        # Final risk-adjusted score
        risk_adjusted_score = base_score + risk_adjustment

        # Determine action
        action = self._determine_action(risk_adjusted_score, agents)

        # Generate reasoning
        reasons = self._generate_reasons(agents, market, profile, risk_adjusted_score, risk_adjustment)

        # Collect all sources
        sources = self._collect_sources(agents)

        # Calculate confidence
        confidence = self._calculate_confidence(agents, risk_adjusted_score)

        # Generate summary
        summary = self._generate_summary(action, agents, risk_adjusted_score, profile)

        return SynthesisResult(
            action=action,
            confidence=confidence,
            summary=summary,
            reasons=reasons,
            risk_adjustment=risk_explanation,
            sources=sources,
            base_score=base_score,
            risk_adjusted_score=risk_adjusted_score,
        )

    def _calculate_base_score(self, agents: Dict[str, AgentResult]) -> float:
        """Calculate weighted base score from agent signals."""
        score = 0.0
        total_weight = 0.0

        for agent_name, weight in [("technical", 0.30), ("sentiment", 0.25), ("fundamental", 0.30)]:
            agent = agents.get(agent_name)
            if agent and agent.confidence > 0:
                signal_value = self.SIGNAL_MAP.get(agent.signal, 0.0)
                # Weight by both agent weight and agent confidence
                score += signal_value * agent.confidence * weight
                total_weight += weight
            elif agent and agent.confidence == 0:
                # Agent has no evidence - don't count its weight
                pass

        # Normalize by actual weights used
        if total_weight > 0:
            score = score / total_weight * (0.30 + 0.25 + 0.30)

        return score

    def _calculate_risk_adjustment(
        self,
        agents: Dict[str, AgentResult],
        market: MarketData,
        profile: UserProfile,
        portfolio: Portfolio,
    ) -> tuple[float, str]:
        """Calculate risk adjustment based on user profile and portfolio."""
        risk_profile = profile.risk_profile
        volatility_tolerance = risk_profile.volatility_tolerance
        position_tolerance = risk_profile.position_size_tolerance

        adjustment = 0.0
        explanations: List[str] = []

        # Volatility adjustment
        if market.volatility > volatility_tolerance:
            vol_penalty = (market.volatility - volatility_tolerance) * 0.5
            adjustment -= min(vol_penalty, 0.3)
            explanations.append(
                f"Volatility ({market.volatility:.2f}) exceeds profile tolerance ({volatility_tolerance:.2f})"
            )

        # Portfolio concentration adjustment
        concentration = self.portfolio_service.calculate_concentration(portfolio)
        if concentration > position_tolerance:
            conc_penalty = (concentration - position_tolerance) * 0.3
            adjustment -= min(conc_penalty, 0.2)
            explanations.append(
                f"Portfolio concentration ({concentration:.3f}) exceeds tolerance ({position_tolerance:.2f})"
            )

        # Existing position adjustment
        existing_holding = next((h for h in portfolio.holdings if h.symbol == market.symbol), None)
        if existing_holding:
            if existing_holding.allocation > position_tolerance * 0.5:
                adjustment -= 0.1
                explanations.append(f"Existing position ({existing_holding.allocation:.1%}) limits additional allocation")

        # Fundamental evidence penalty
        fundamental = agents.get("fundamental")
        if fundamental and fundamental.confidence == 0:
            adjustment -= 0.2
            explanations.append("Fundamental evidence unavailable - reducing conviction")

        # Risk flags from agents
        all_risk_flags = []
        for agent in agents.values():
            all_risk_flags.extend(agent.risk_flags)

        if "Overbought RSI" in all_risk_flags:
            adjustment -= 0.05
            explanations.append("Technical overbought condition")
        if "Elevated volatility" in all_risk_flags:
            adjustment -= 0.05
            explanations.append("Elevated volatility flagged by technical agent")
        if "Distribution pattern detected" in all_risk_flags:
            adjustment -= 0.1
            explanations.append("Distribution pattern detected by sentiment agent")

        explanation = "; ".join(explanations) if explanations else "No significant risk adjustments"
        return adjustment, explanation

    def _determine_action(self, risk_adjusted_score: float, agents: Dict[str, AgentResult]) -> str:
        """Determine final action from risk-adjusted score."""
        # Check for insufficient evidence
        fundamental = agents.get("fundamental")
        if fundamental and fundamental.confidence == 0:
            technical = agents.get("technical")
            sentiment = agents.get("sentiment")
            # If both technical and sentiment are also low confidence, insufficient evidence
            if (not technical or technical.confidence < 0.4) and (not sentiment or sentiment.confidence < 0.4):
                return "INSUFFICIENT_EVIDENCE"

        if risk_adjusted_score >= self.BUY_THRESHOLD:
            return "BUY"
        elif risk_adjusted_score <= self.REDUCE_THRESHOLD:
            return "REDUCE"
        else:
            return "HOLD"

    def _generate_reasons(
        self,
        agents: Dict[str, AgentResult],
        market: MarketData,
        profile: UserProfile,
        risk_adjusted_score: float,
        risk_adjustment: float,
    ) -> List[str]:
        """Generate human-readable reasons for the recommendation."""
        reasons: List[str] = []

        # Agent-level reasons
        for agent_name in ["technical", "sentiment", "fundamental"]:
            agent = agents.get(agent_name)
            if agent and agent.confidence > 0:
                if agent.signal == "BULLISH":
                    reasons.append(f"{agent_name.capitalize()}: {agent.reasoning[0] if agent.reasoning else 'Positive signal'}")
                elif agent.signal == "BEARISH":
                    reasons.append(f"{agent_name.capitalize()}: {agent.reasoning[0] if agent.reasoning else 'Negative signal'}")

        # Risk adjustment reason
        if risk_adjustment < -0.05:
            reasons.append(f"Risk adjustment: {abs(risk_adjustment):.2f} penalty applied ({profile.risk_profile.risk_profile} profile)")

        # Portfolio context
        existing = next((h for h in portfolio.holdings if h.symbol == market.symbol), None)
        if existing:
            reasons.append(f"Current holding: {existing.quantity} shares ({existing.allocation:.1%} of portfolio)")

        return reasons

    def _collect_sources(self, agents: Dict[str, AgentResult]) -> List[Dict[str, Any]]:
        """Collect all sources from agents."""
        sources = []
        for agent in agents.values():
            for source in agent.sources:
                sources.append({
                    "agent": agent.agent,
                    "document_id": source.document_id,
                    "title": source.title,
                    "source": source.source,
                    "similarity": source.similarity,
                })
        return sources

    def _calculate_confidence(self, agents: Dict[str, AgentResult], risk_adjusted_score: float) -> float:
        """Calculate overall confidence in the recommendation."""
        # Average agent confidence (weighted by their weights)
        confidences = []
        weights = []

        for agent_name, weight in [("technical", 0.30), ("sentiment", 0.25), ("fundamental", 0.30)]:
            agent = agents.get(agent_name)
            if agent:
                confidences.append(agent.confidence)
                weights.append(weight)

        if not confidences:
            return 0.0

        avg_confidence = sum(c * w for c, w in zip(confidences, weights)) / sum(weights)

        # Adjust by score magnitude (higher magnitude = higher confidence)
        score_confidence = min(abs(risk_adjusted_score) * 1.5, 0.8)

        return min((avg_confidence + score_confidence) / 2, 0.95)

    def _generate_summary(
        self,
        action: str,
        agents: Dict[str, AgentResult],
        risk_adjusted_score: float,
        profile: UserProfile,
    ) -> str:
        """Generate a human-readable summary."""
        signals = [agents.get(a, {}).signal for a in ["technical", "sentiment", "fundamental"] if a in agents]
        bullish_count = signals.count("BULLISH")
        bearish_count = signals.count("BEARISH")

        profile_desc = profile.risk_profile.risk_profile

        if action == "BUY":
            return f"{bullish_count}/3 agents bullish. Risk-adjusted score {risk_adjusted_score:.2f} supports BUY for {profile_desc} profile."
        elif action == "REDUCE":
            return f"{bearish_count}/3 agents bearish. Risk-adjusted score {risk_adjusted_score:.2f} suggests REDUCE for {profile_desc} profile."
        elif action == "INSUFFICIENT_EVIDENCE":
            return "Fundamental evidence unavailable. Cannot generate fully supported recommendation."
        else:
            return f"Mixed signals ({bullish_count} bullish, {bearish_count} bearish). Risk-adjusted score {risk_adjusted_score:.2f} supports HOLD for {profile_desc} profile."