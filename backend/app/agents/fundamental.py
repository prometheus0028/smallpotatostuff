"""Fundamental / RAG Agent.

Retrieves and analyzes financial/regulatory documents to generate
a fundamental analysis signal. Uses RAG (Retrieval-Augmented Generation)
to ground conclusions in actual document evidence.
"""

import time
from datetime import datetime
from typing import List, Dict, Any, Optional
from .base import BaseAgent, AgentContext
from ..services.rag import retrieve_documents
from ..models.agent import AgentResult, AgentSource


class FundamentalAgent(BaseAgent):
    """Fundamental analysis specialist agent using RAG."""

    agent_name = "fundamental"

    def __init__(self, openai_client=None):
        self.openai_client = openai_client

    async def analyze(self, context: AgentContext) -> AgentResult:
        started_at = datetime.utcnow()
        start_time = time.perf_counter()

        symbol = context.symbol
        market = context.market_data
        reasoning: List[str] = []
        risk_flags: List[str] = []
        sources: List[Dict[str, Any]] = []

        # Retrieve relevant documents
        query = f"{symbol} financial performance revenue profit debt growth outlook"
        documents = await retrieve_documents(symbol, query, top_k=5)

        if not documents:
            # No fundamental evidence available
            reasoning.append("No fundamental documents retrieved")
            risk_flags.append("Insufficient fundamental evidence")
            signal = "NEUTRAL"
            confidence = 0.0
        else:
            # Process retrieved documents
            sources = [
                {
                    "document_id": d.get("document_id"),
                    "title": d.get("title"),
                    "source": d.get("source"),
                    "chunk_text": d.get("chunk_text", "")[:500],  # Truncate for response
                    "similarity": d.get("similarity"),
                }
                for d in documents
            ]

            # Analyze documents for fundamental signals
            signal, confidence, doc_reasoning, doc_risk_flags = await self._analyze_documents(
                documents, market
            )
            reasoning.extend(doc_reasoning)
            risk_flags.extend(doc_risk_flags)

            if not reasoning:
                reasoning.append("Fundamental documents retrieved but no clear signal extracted")

        completed_at = datetime.utcnow()
        latency_ms = int((time.perf_counter() - start_time) * 1000)

        return self._create_result(
            signal=signal,
            confidence=confidence,
            reasoning=reasoning,
            risk_flags=risk_flags,
            sources=sources,
            latency_ms=latency_ms,
            started_at=started_at,
            completed_at=completed_at,
        )

    async def _analyze_documents(
        self,
        documents: List[Dict[str, Any]],
        market
    ) -> tuple[str, float, List[str], List[str]]:
        """Analyze retrieved documents for fundamental signals.

        Uses deterministic keyword-based analysis as primary method,
        with optional LLM enhancement for interpretation.
        """
        reasoning: List[str] = []
        risk_flags: List[str] = []

        # Combine all document text for analysis
        combined_text = " ".join(d.get("chunk_text", "") for d in documents).lower()

        # Keyword-based fundamental analysis (deterministic, no LLM required)
        positive_keywords = {
            "revenue grew": 0.15,
            "revenue growth": 0.15,
            "profit increased": 0.15,
            "net profit": 0.1,
            "margin expanded": 0.12,
            "debt reduced": 0.1,
            "debt-to-equity improved": 0.12,
            "strong growth": 0.1,
            "capex": 0.08,
            "investment": 0.08,
            "subscriber growth": 0.1,
            "market share": 0.08,
            "free cash flow": 0.12,
            "dividend": 0.05,
        }

        negative_keywords = {
            "revenue fell": -0.15,
            "revenue decline": -0.15,
            "profit fell": -0.15,
            "loss": -0.12,
            "margin contracted": -0.12,
            "debt increased": -0.1,
            "impairment": -0.15,
            "write-down": -0.15,
            "headwinds": -0.08,
            "slowdown": -0.1,
            "weak demand": -0.1,
        }

        risk_keywords = {
            "risk": "Risk factors mentioned in filings",
            "uncertainty": "Uncertainty highlighted in documents",
            "volatile": "Volatility noted in operations",
            "regulatory": "Regulatory risks identified",
            "competition": "Competitive pressures noted",
        }

        score = 0.0
        matched_positive = []
        matched_negative = []

        for keyword, weight in positive_keywords.items():
            if keyword in combined_text:
                score += weight
                matched_positive.append(keyword)

        for keyword, weight in negative_keywords.items():
            if keyword in combined_text:
                score += weight  # weight is negative
                matched_negative.append(keyword)

        for keyword, flag in risk_keywords.items():
            if keyword in combined_text:
                risk_flags.append(flag)

        # Generate reasoning from matched keywords
        if matched_positive:
            reasoning.append(f"Positive fundamentals: {', '.join(matched_positive[:3])}")
        if matched_negative:
            reasoning.append(f"Negative fundamentals: {', '.join(matched_negative[:3])}")

        # Add document source references to reasoning
        doc_titles = [d.get("title", "Unknown") for d in documents[:2]]
        reasoning.append(f"Based on: {', '.join(doc_titles)}")

        # Optional: Use LLM for enhanced interpretation if available
        if self.openai_client and documents:
            try:
                llm_reasoning = await self._llm_interpret(documents, market)
                if llm_reasoning:
                    reasoning.append(f"LLM insight: {llm_reasoning}")
            except Exception:
                pass  # Silently fail, use deterministic analysis

        # Normalize confidence based on document quality and quantity
        avg_similarity = sum(d.get("similarity", 0) for d in documents) / len(documents) if documents else 0
        doc_count_factor = min(len(documents) / 3, 1.0)  # Max confidence at 3+ docs
        confidence = min((abs(score) + 0.2) * avg_similarity * doc_count_factor + 0.15, 0.85)

        if score > 0.15:
            return "BULLISH", confidence, reasoning, risk_flags
        elif score < -0.15:
            return "BEARISH", confidence, reasoning, risk_flags
        else:
            return "NEUTRAL", max(confidence - 0.1, 0.3), reasoning, risk_flags

    async def _llm_interpret(
        self,
        documents: List[Dict[str, Any]],
        market
    ) -> Optional[str]:
        """Use LLM to interpret documents (optional enhancement)."""
        if not self.openai_client:
            return None

        try:
            # Prepare context for LLM
            context = "\n\n".join([
                f"Document: {d.get('title', 'Unknown')}\nSource: {d.get('source', 'Unknown')}\nContent: {d.get('chunk_text', '')[:1000]}"
                for d in documents[:3]
            ])

            prompt = f"""Analyze these financial documents for {market.symbol} and provide a ONE-SENTENCE fundamental assessment.
Focus on: revenue trends, profitability, debt levels, growth outlook.
Be concise and evidence-based. Do not make up information not in the documents.

Documents:
{context}

Assessment:"""

            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=100,
                temperature=0.1,
            )
            return response.choices[0].message.content.strip()
        except Exception:
            return None