"""Supabase client wrapper.

This module provides a lazy-initialized Supabase client.
Person 2 owns the actual database infrastructure.
This is an adapter boundary - the rest of the backend doesn't depend on Supabase directly.
"""

from typing import Optional, Any
from ..core.config import settings


_supabase_client: Optional[Any] = None


def get_supabase_client() -> Optional[Any]:
    """Get or create Supabase client.

    Returns None if Supabase is not configured or client creation fails.
    This allows the backend to run without Supabase for demo purposes.
    """
    global _supabase_client

    if _supabase_client is not None:
        return _supabase_client

    if not settings.supabase_url or not settings.supabase_service_role_key:
        return None

    try:
        from supabase import create_client
        _supabase_client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key,
        )
        return _supabase_client
    except Exception as e:
        print(f"Failed to create Supabase client: {e}")
        return None


def reset_supabase_client() -> None:
    """Reset the client (useful for testing)."""
    global _supabase_client
    _supabase_client = None