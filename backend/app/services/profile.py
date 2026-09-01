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


class ProfileService:
    """User profile service."""

    def __init__(self):
        self._profiles = DEMO_PROFILES.copy()

    async def get_profile(self, user_id: str) -> Optional[UserProfile]:
        """Get user profile by ID."""
        return self._profiles.get(user_id)

    async def get_available_profiles(self) -> list[str]:
        """Get list of available profile IDs."""
        return list(self._profiles.keys())