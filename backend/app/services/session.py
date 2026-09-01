"""Session management service.

Stores analysis sessions for retrieval and demo continuity.
In production, this would use a persistent store (Redis, database).
"""

from typing import Dict, Optional, Any
from datetime import datetime
import uuid
from ..models.analysis import AnalysisResponse


class SessionStore:
    """In-memory session store with optional persistence."""

    def __init__(self):
        self._sessions: Dict[str, AnalysisResponse] = {}

    def create_session(self, response: AnalysisResponse) -> str:
        """Store a session and return its ID."""
        session_id = response.session_id or str(uuid.uuid4())[:8]
        response.session_id = session_id
        self._sessions[session_id] = response
        return session_id

    def get_session(self, session_id: str) -> Optional[AnalysisResponse]:
        """Retrieve a session by ID."""
        return self._sessions.get(session_id)

    def list_sessions(self) -> list[str]:
        """List all session IDs."""
        return list(self._sessions.keys())

    def clear(self) -> None:
        """Clear all sessions (for testing)."""
        self._sessions.clear()


# Global session store instance
session_store = SessionStore()