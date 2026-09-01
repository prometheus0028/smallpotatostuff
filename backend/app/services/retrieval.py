import os
import hashlib
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

from backend.app.db.supabase import get_supabase_client

EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIM = 1536


def _generate_query_embedding(query: str) -> List[float] | None:
    """Generates 1536-dim embedding using OpenAI text-embedding-3-small or returns None on failure."""
    openai_key = os.environ.get("OPENAI_API_KEY")
    if openai_key and openai_key != "your_openai_api_key_here":
        try:
            from openai import OpenAI
            client = OpenAI(api_key=openai_key)
            response = client.embeddings.create(model=EMBEDDING_MODEL, input=query)
            return response.data[0].embedding
        except Exception:
            return None

    return None


def retrieve_documents(symbol: str, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
    """
    Semantic retrieval interface for Person 1 / agent orchestration.
    
    Returns a list of dicts containing:
      - document_id
      - title
      - source
      - chunk_text
      - similarity
      
    Returns [] if no matching documents exist, or if embedding generation fails.
    Does NOT throw application errors for missing fundamental data.
    """
    if not symbol or not query:
        return []

    query_embedding = _generate_query_embedding(query)
    if query_embedding is None:
        return []

    client = get_supabase_client()
    if client is not None:
        try:
            rpc_params = {
                "query_embedding": query_embedding,
                "match_symbol": symbol.upper(),
                "match_threshold": 0.0,
                "match_count": top_k
            }
            response = client.rpc("match_document_chunks", rpc_params).execute()
            rows = response.data if response.data else []

            results = []
            for row in rows:
                results.append({
                    "document_id": str(row.get("document_id", "")),
                    "title": str(row.get("title", "")),
                    "source": str(row.get("source", "")),
                    "chunk_text": str(row.get("chunk_text", "")),
                    "similarity": float(row.get("similarity", 0.0))
                })
            return results
        except Exception:
            return []

    return []

