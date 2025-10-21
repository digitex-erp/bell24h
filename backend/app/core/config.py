from typing import List
import os


class _Settings:
    """Lightweight settings holder.

    For secrets/config in development, set environment variables or a `.env` file
    and avoid committing credentials to source control.
    """
    OPENAI_API_KEY: str = os.environ.get("OPENAI_API_KEY", "")
    ALPHA_VANTAGE_API_KEY: str = os.environ.get("ALPHA_VANTAGE_API_KEY", "")
    # Database connection URL for Neon/Postgres (e.g. postgresql://user:pass@host:5432/db)
    # Set this in your environment or in backend/.env (not committed).
    DATABASE_URL: str = os.environ.get("DATABASE_URL", "")
    MAIL_USERNAME: str = os.environ.get("MAIL_USERNAME", "")
    MAIL_PASSWORD: str = os.environ.get("MAIL_PASSWORD", "")
    MAIL_FROM: str = os.environ.get("MAIL_FROM", "noreply@bell24h.local")
    MAIL_PORT: int = int(os.environ.get("MAIL_PORT", 587))
    MAIL_SERVER: str = os.environ.get("MAIL_SERVER", "smtp.example.local")
    MAIL_FROM_NAME: str = os.environ.get("MAIL_FROM_NAME", "Bell24h")
    CORS_ORIGINS: List[str] = os.environ.get("CORS_ORIGINS", "*").split(',')
    SUPABASE_URL: str = os.environ.get("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.environ.get("SUPABASE_KEY", "")


settings = _Settings()
