from typing import Dict, Optional
from ..models.profile import UserProfile, RiskProfile


# Demo user profiles
DEMO_PROFILES: Dict[str, UserProfile] = {
    "demo-conservative": UserProfile(
        user_id="demo-conservative",
        name="Conservative Investor",
        risk_profile=RiskProfile(
            risk_profile="conservative",
            volatility_tolerance=0.15,
            position_size_tolerance=0.10,
        ),
    ),
    "demo-aggressive": UserProfile(
        user_id="demo-aggressive",
        name="Aggressive Investor",
        risk_profile=RiskProfile(
            risk_profile="aggressive",
            volatility_tolerance=0.30,
            position_size_tolerance=0.30,
        ),
    ),
    "demo-moderate": UserProfile(
        user_id="demo-moderate",
        name="Moderate Investor",
        risk_profile=RiskProfile(
            risk_profile="moderate",
            volatility_tolerance=0.20,
            position_size_tolerance=0.20,
        ),
    ),
}


ALIAS_MAP = {
    "demo-conservative": "11111111-1111-1111-1111-111111111111",
    "demo-aggressive": "22222222-2222-2222-2222-222222222222",
}


class ProfileService:
    """User profile service."""

    def __init__(self):
        self._profiles = DEMO_PROFILES.copy()

    async def get_profile(self, user_id: str) -> Optional[UserProfile]:
        """Get user profile by ID."""
        actual_id = ALIAS_MAP.get(user_id, user_id)

        try:
            from ..db.supabase import get_supabase_client
            client = get_supabase_client()
            if client:
                res = client.table("users").select("*").eq("id", actual_id).execute()
                if not res.data and user_id != actual_id:
                    res = client.table("users").select("*").eq("id", user_id).execute()

                if res.data:
                    row = res.data[0]
                    risk_profile_str = str(row.get("risk_profile", "conservative")).lower()
                    risk_score = int(row.get("risk_score", 50))
                    vol_tol = 0.15 if risk_score <= 35 else (0.30 if risk_score >= 70 else 0.20)
                    pos_tol = 0.10 if risk_score <= 35 else (0.30 if risk_score >= 70 else 0.20)

                    return UserProfile(
                        user_id=user_id,
                        name=str(row.get("name", "User")),
                        risk_profile=RiskProfile(
                            risk_profile=risk_profile_str,
                            volatility_tolerance=vol_tol,
                            position_size_tolerance=pos_tol,
                        )
                    )
        except Exception:
            pass

        return self._profiles.get(user_id)

    async def get_available_profiles(self) -> list[str]:
        """Get list of available profile IDs."""
        return list(self._profiles.keys())