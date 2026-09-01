"""RAG (Retrieval-Augmented Generation) service.

This module provides an adapter interface for document retrieval.
Person 2 owns the actual retrieval infrastructure (Supabase pgvector).
This adapter allows the backend to work with any retrieval backend.

The interface is designed to be swapped with Person 2's implementation
without changing the rest of the backend code.
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import os


@dataclass
class RetrievedDocument:
    """Represents a retrieved document chunk."""
    document_id: str
    title: str
    source: str
    chunk_text: str
    similarity: float


# Global flag for degraded data mode (demo control)
_DEGRADED_MODE = False


def set_degraded_mode(enabled: bool) -> None:
    """Enable or disable degraded data mode for demo purposes."""
    global _DEGRADED_MODE
    _DEGRADED_MODE = enabled


def is_degraded_mode() -> bool:
    """Check if degraded mode is enabled."""
    return _DEGRADED_MODE


async def retrieve_documents(
    symbol: str,
    query: str,
    top_k: int = 5
) -> List[Dict[str, Any]]:
    """Retrieve relevant documents for a symbol and query.

    This is the main interface used by the Fundamental Agent.

    Args:
        symbol: Stock symbol (e.g., "RELIANCE")
        query: Search query
        top_k: Number of documents to retrieve

    Returns:
        List of document dictionaries with keys:
        - document_id
        - title
        - source
        - chunk_text
        - similarity

    Note:
        In degraded mode, returns empty list to simulate unavailable fundamental evidence.
        When Person 2's retrieval infrastructure is ready, replace this implementation
        with a call to their retrieval function.
    """
    # In degraded mode, simulate unavailable fundamental evidence
    if _DEGRADED_MODE:
        return []

    # Call Person 2's retrieval service directly
    try:
        from .retrieval import retrieve_documents as supabase_retrieve_documents
        return supabase_retrieve_documents(symbol=symbol, query=query, top_k=top_k)
    except Exception:
        return []


async def _retrieve_from_supabase(
    client: Any,
    symbol: str,
    query: str,
    top_k: int
) -> List[Dict[str, Any]]:
    """Retrieve documents from Supabase pgvector.

    This is a placeholder for Person 2's actual implementation.
    When their retrieval function is ready, this should call it directly.
    """
    # This would be replaced by Person 2's actual retrieval call
    # Example expected interface:
    # return await client.rpc('match_documents', {
    #     'query_embedding': embedding,
    #     'match_count': top_k,
    #     'filter': {'symbol': symbol}
    # }).execute()

    # For now, fall back to mock
    return _get_mock_documents(symbol, query, top_k)


def _get_mock_documents(symbol: str, query: str, top_k: int) -> List[Dict[str, Any]]:
    """Get mock documents for demo purposes.

    In production, this would be replaced by actual vector search.
    """
    mock_docs = {
        "RELIANCE": [
            {
                "document_id": "rel_annual_2024_001",
                "title": "Reliance Industries Annual Report 2024",
                "source": "BSE Filing",
                "chunk_text": "Revenue grew 12% YoY to ₹9.7 lakh crore. Net profit increased 9% to ₹73,670 crore. Debt-to-equity ratio improved to 0.42 from 0.48. Digital services and retail segments showed strong growth.",
                "similarity": 0.92,
            },
            {
                "document_id": "rel_q3_2024_002",
                "title": "Reliance Q3 2024 Results",
                "source": "SEBI Filing",
                "chunk_text": "Quarterly revenue ₹2.4 lakh crore, up 8% YoY. O2C segment margins expanded 120bps. Jio subscriber base reached 470M. Capex guidance maintained at ₹1.5 lakh crore for FY25.",
                "similarity": 0.87,
            },
            {
                "document_id": "rel_esg_2024_003",
                "title": "Reliance ESG Report 2024",
                "source": "Company Website",
                "chunk_text": "Committed to net carbon zero by 2035. Green energy investment of ₹75,000 crore over 3 years. Solar manufacturing capacity 20GW by 2026. Water positivity achieved across operations.",
                "similarity": 0.78,
            },
        ],
        "HDFCBANK": [
            {
                "document_id": "hdfc_annual_2024_001",
                "title": "HDFC Bank Annual Report 2024",
                "source": "BSE Filing",
                "chunk_text": "Net interest margin stable at 3.6%. Gross NPA ratio 1.1%, net NPA 0.3%. Loan book grew 18% YoY. Deposit growth at 21%. Merger with HDFC Ltd completed successfully.",
                "similarity": 0.91,
            },
            {
                "document_id": "hdfc_q3_2024_002",
                "title": "HDFC Bank Q3 2024 Results",
                "source": "SEBI Filing",
                "chunk_text": "Net profit ₹16,500 crore, up 33% YoY. NIM at 3.5%. Credit cost normalized. Strong retail loan growth. Digital transactions up 45% YoY.",
                "similarity": 0.85,
            },
        ],
        "TATAMOTORS": [
            {
                "document_id": "tata_annual_2024_001",
                "title": "Tata Motors Annual Report 2024",
                "source": "BSE Filing",
                "chunk_text": "JLR revenue up 22% to £29B. India PV market share 14.2%. EV penetration 12% of domestic PV sales. Free cash flow £2.8B. Net debt reduced to £1.2B.",
                "similarity": 0.89,
            },
            {
                "document_id": "tata_q3_2024_002",
                "title": "Tata Motors Q3 2024 Results",
                "source": "SEBI Filing",
                "chunk_text": "Consolidated revenue ₹1.1 lakh crore. JLR EBITDA margin 14.5%. India CV cycle recovery. EV sales 22,000 units in quarter. Chip supply improving.",
                "similarity": 0.83,
            },
        ],
    }

    docs = mock_docs.get(symbol.upper(), [])
    return docs[:top_k]


class RAGService:
    """RAG service wrapper for dependency injection."""

    async def retrieve(self, symbol: str, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        return await retrieve_documents(symbol, query, top_k)