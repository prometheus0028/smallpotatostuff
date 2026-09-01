from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    openai_api_key: Optional[str] = None
    supabase_url: Optional[str] = None
    supabase_service_role_key: Optional[str] = None

    app_host: str = "0.0.0.0"
    app_port: int = 8000
    debug: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()