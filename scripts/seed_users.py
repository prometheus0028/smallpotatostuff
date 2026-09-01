import os
import sys
import json
from dotenv import load_dotenv

load_dotenv()

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.db.supabase import get_supabase_client

USER_SEEDS = [
    {
        "id": "11111111-1111-1111-1111-111111111111",
        "email": "conservative.investor@hackverse.io",
        "name": "Aarav Sharma (Conservative)",
        "risk_profile": "Conservative",
        "risk_score": 25,
        "portfolio": [
            {"symbol": "RELIANCE", "quantity": 50, "avg_buy_price": 2850.00},
            {"symbol": "HDFCBANK", "quantity": 100, "avg_buy_price": 1600.00}
        ],
        "watchlist": ["RELIANCE", "HDFCBANK"]
    },
    {
        "id": "22222222-2222-2222-2222-222222222222",
        "email": "aggressive.trader@hackverse.io",
        "name": "Riya Patel (Aggressive)",
        "risk_profile": "Aggressive",
        "risk_score": 80,
        "portfolio": [
            {"symbol": "RELIANCE", "quantity": 200, "avg_buy_price": 2910.50},
            {"symbol": "TATAMOTORS", "quantity": 500, "avg_buy_price": 980.25}
        ],
        "watchlist": ["RELIANCE", "TATAMOTORS"]
    }
]

LOCAL_USER_STORE_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "seeds", "user_profiles.json")


def seed_users():
    """Seeds user profiles, portfolios, and watchlists into Supabase or local store."""
    client = get_supabase_client()
    if client:
        try:
            print("[User Seed] Seeding users into Supabase...")
            for user in USER_SEEDS:
                client.table("users").upsert({
                    "id": user["id"],
                    "email": user["email"],
                    "name": user["name"],
                    "risk_profile": user["risk_profile"],
                    "risk_score": user["risk_score"]
                }).execute()

                for p in user["portfolio"]:
                    client.table("portfolio").insert({
                        "user_id": user["id"],
                        "symbol": p["symbol"],
                        "quantity": p["quantity"],
                        "avg_buy_price": p["avg_buy_price"]
                    }).execute()

                for symbol in user["watchlist"]:
                    client.table("watchlist").insert({
                        "user_id": user["id"],
                        "symbol": symbol
                    }).execute()

            print("[User Seed] Supabase user seeding complete.")
        except Exception as e:
            print(f"[User Seed] Supabase user seeding warning: {e}")

    # Always persist locally for offline/standalone execution
    os.makedirs(os.path.dirname(LOCAL_USER_STORE_PATH), exist_ok=True)
    with open(LOCAL_USER_STORE_PATH, "w", encoding="utf-8") as f:
        json.dump(USER_SEEDS, f, indent=2)
    print(f"[User Seed] Local user seed file created at {LOCAL_USER_STORE_PATH}")


if __name__ == "__main__":
    seed_users()
