import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

_supabase_client: Client | None = None

def get_supabase_client() -> Client | None:
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_key:
        return None

    _supabase_client = create_client(supabase_url, supabase_key)
    return _supabase_client
