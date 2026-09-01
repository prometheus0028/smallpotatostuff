import os
import glob
import json
import hashlib
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.db.supabase import get_supabase_client

EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIM = 1536
LOCAL_STORE_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "seeds", "local_vector_store.json")


def parse_frontmatter(content: str) -> tuple[dict, str]:
    """Simple parser for frontmatter metadata in markdown documents."""
    metadata = {}
    body = content
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            fm_text = parts[1]
            body = parts[2].strip()
            for line in fm_text.strip().split("\n"):
                if ":" in line:
                    key, val = line.split(":", 1)
                    metadata[key.strip()] = val.strip()
    return metadata, body


def generate_embedding(text: str) -> List[float]:
    """Generates embedding using OpenAI or deterministic fallback vector."""
    openai_key = os.environ.get("OPENAI_API_KEY")
    if openai_key and openai_key != "your_openai_api_key_here":
        try:
            from openai import OpenAI
            client = OpenAI(api_key=openai_key)
            res = client.embeddings.create(model=EMBEDDING_MODEL, input=text)
            return res.data[0].embedding
        except Exception as e:
            print(f"[Warning] OpenAI API call failed ({e}), using deterministic fallback vector.")

    # Deterministic fallback vector
    seed = hashlib.sha256(text.encode('utf-8')).digest()
    import random
    rng = random.Random(seed)
    raw = [rng.gauss(0, 1) for _ in range(EMBEDDING_DIM)]
    norm = sum(x * x for x in raw) ** 0.5
    return [x / norm for x in raw] if norm > 0 else [0.0] * EMBEDDING_DIM


def chunk_text(text: str, chunk_size: int = 600, overlap: int = 100) -> List[str]:
    """Splits text into chunks of specified approximate size."""
    paragraphs = text.split("\n\n")
    chunks = []
    current_chunk = ""

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        if len(current_chunk) + len(para) <= chunk_size:
            current_chunk += ("\n\n" if current_chunk else "") + para
        else:
            if current_chunk:
                chunks.append(current_chunk)
            current_chunk = para

    if current_chunk:
        chunks.append(current_chunk)

    return chunks if chunks else [text]


def get_local_retrieval_fallback(symbol: str, query_embedding: List[float], top_k: int = 3) -> List[Dict[str, Any]]:
    """Local fallback retrieval when Supabase connection is offline."""
    if not os.path.exists(LOCAL_STORE_PATH):
        return []

    try:
        with open(LOCAL_STORE_PATH, "r", encoding="utf-8") as f:
            local_db = json.load(f)

        candidates = []
        for doc in local_db.values():
            if doc.get("symbol", "").upper() != symbol.upper():
                continue

            for chunk in doc.get("chunks", []):
                chunk_emb = chunk.get("embedding", [])
                if not chunk_emb or len(chunk_emb) != len(query_embedding):
                    continue

                # Cosine similarity calculation
                dot = sum(a * b for a, b in zip(chunk_emb, query_embedding))
                similarity = max(0.0, min(1.0, dot))
                candidates.append({
                    "document_id": doc["id"],
                    "title": doc["title"],
                    "source": doc["source"],
                    "chunk_text": chunk["chunk_text"],
                    "similarity": round(float(similarity), 4)
                })

        candidates.sort(key=lambda x: x["similarity"], reverse=True)
        return candidates[:top_k]
    except Exception as e:
        print(f"[Error] Local fallback retrieval error: {e}")
        return []


def ingest_documents():
    """Scan data/documents and ingest into Supabase or local fallback store."""
    docs_dir = os.path.join(os.path.dirname(__file__), "..", "data", "documents")
    doc_files = glob.glob(os.path.join(docs_dir, "**", "*.md"), recursive=True)

    client = get_supabase_client()
    local_db = {}
    if os.path.exists(LOCAL_STORE_PATH):
        with open(LOCAL_STORE_PATH, "r", encoding="utf-8") as f:
            try:
                local_db = json.load(f)
            except Exception:
                local_db = {}

    ingested_count = 0
    skipped_count = 0

    for file_path in doc_files:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        meta, body = parse_frontmatter(content)
        title = meta.get("title", os.path.basename(file_path))
        source = meta.get("source", "Unknown")
        doc_type = meta.get("document_type", "General")
        published_at = meta.get("published_at", None)
        symbol = meta.get("symbol", "GENERAL").upper()

        doc_id_hash = hashlib.md5(f"{symbol}:{title}".encode("utf-8")).hexdigest()
        doc_uuid = f"{doc_id_hash[:8]}-{doc_id_hash[8:12]}-{doc_id_hash[12:16]}-{doc_id_hash[16:20]}-{doc_id_hash[20:32]}"

        # Check existing in Supabase if client is connected
        exists_in_supabase = False
        if client:
            try:
                existing = client.table("documents").select("id").eq("title", title).eq("symbol", symbol).execute()
                if existing.data:
                    exists_in_supabase = True
                    print(f"[Skipped] Document already exists in Supabase: '{title}' ({symbol})")
                    skipped_count += 1
                    continue
            except Exception as e:
                print(f"[Warning] Error checking Supabase: {e}")

        # If offline (no client), check existing in Local DB
        if not client and doc_uuid in local_db:
            print(f"[Skipped] Document already exists locally: '{title}' ({symbol})")
            skipped_count += 1
            continue

        print(f"[Ingesting] Ingesting document: '{title}' ({symbol})")

        text_chunks = chunk_text(body)
        chunks_data = []

        for idx, chunk in enumerate(text_chunks):
            embedding = generate_embedding(chunk)
            chunks_data.append({
                "chunk_index": idx,
                "chunk_text": chunk,
                "embedding": embedding
            })

        # Save to Supabase
        if client:
            try:
                doc_res = client.table("documents").insert({
                    "id": doc_uuid,
                    "title": title,
                    "source": source,
                    "document_type": doc_type,
                    "published_at": published_at,
                    "symbol": symbol,
                    "metadata": meta
                }).execute()

                for chunk_item in chunks_data:
                    client.table("document_chunks").insert({
                        "document_id": doc_uuid,
                        "chunk_index": chunk_item["chunk_index"],
                        "chunk_text": chunk_item["chunk_text"],
                        "embedding": chunk_item["embedding"]
                    }).execute()
            except Exception as e:
                print(f"[Warning] Failed to insert to Supabase: {e}")

        # Save to local cache
        local_db[doc_uuid] = {
            "id": doc_uuid,
            "title": title,
            "source": source,
            "document_type": doc_type,
            "published_at": published_at,
            "symbol": symbol,
            "metadata": meta,
            "chunks": chunks_data
        }
        ingested_count += 1

    os.makedirs(os.path.dirname(LOCAL_STORE_PATH), exist_ok=True)
    with open(LOCAL_STORE_PATH, "w", encoding="utf-8") as f:
        json.dump(local_db, f, indent=2)

    print(f"\nIngestion complete: {ingested_count} processed, {skipped_count} skipped.")


if __name__ == "__main__":
    ingest_documents()
