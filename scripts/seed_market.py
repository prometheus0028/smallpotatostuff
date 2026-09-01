import os
import sys
import json
from dotenv import load_dotenv

load_dotenv()

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.db.supabase import get_supabase_client

MARKET_SEEDS = [
    {
        "symbol": "RELIANCE",
        "price": 2950.75,
        "change_pct": 1.45,
        "volume": 8500000,
        "avg_volume": 7200000,
        "rsi": 58.4,
        "momentum": 12.3,
        "volatility": 0.18,
        "sentiment_score": 0.75,
        "forward_return": 0.085
    },
    {
        "symbol": "HDFCBANK",
        "price": 1655.30,
        "change_pct": -0.35,
        "volume": 12000000,
        "avg_volume": 11500000,
        "rsi": 47.8,
        "momentum": -3.1,
        "volatility": 0.14,
        "sentiment_score": 0.60,
        "forward_return": 0.042
    },
    {
        "symbol": "TATAMOTORS",
        "price": 1012.10,
        "change_pct": 2.80,
        "volume": 15400000,
        "avg_volume": 13000000,
        "rsi": 64.2,
        "momentum": 28.6,
        "volatility": 0.24,
        "sentiment_score": 0.82,
        "forward_return": 0.115
    }
]

LOCAL_MARKET_STORE_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "seeds", "market_snapshots.json")


def seed_market():
    """Seeds market snapshot data into Supabase or local file store."""
    client = get_supabase_client()
    if client:
        try:
            print("[Market Seed] Inserting market snapshots into Supabase...")
            for seed in MARKET_SEEDS:
                client.table("market_snapshots").insert(seed).execute()
            print("[Market Seed] Supabase market seeding complete.")
        except Exception as e:
            print(f"[Market Seed] Supabase insertion error: {e}")

    # Always persist locally for offline/standalone execution
    os.makedirs(os.path.dirname(LOCAL_MARKET_STORE_PATH), exist_ok=True)
    with open(LOCAL_MARKET_STORE_PATH, "w", encoding="utf-8") as f:
        json.dump(MARKET_SEEDS, f, indent=2)
    print(f"[Market Seed] Local seed file created at {LOCAL_MARKET_STORE_PATH}")


if __name__ == "__main__":
    seed_market()
