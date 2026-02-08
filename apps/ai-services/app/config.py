"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Application
    debug: bool = True
    api_port: int = 8000
    web_url: str = "http://localhost:4200"
    api_url: str = "http://localhost:3000"

    # AI Models
    gemini_api_key: str = ""
    openai_api_key: str = ""
    default_model: str = "gemini-2.0-flash"

    # Voice
    deepgram_api_key: str = ""
    elevenlabs_api_key: str = ""

    # Database
    database_url: str = "postgresql+asyncpg://apex_admin:apex_dev_password_2024@localhost:5432/apex_health"

    # Redis
    redis_url: str = "redis://:apex_redis_dev@localhost:6379/0"

    # Security
    jwt_secret: str = "dev-secret-change-in-production"
    phi_encryption_key: str = ""

    # LangSmith (Observability)
    langsmith_api_key: str = ""
    langsmith_project: str = "apex-health-ai"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
