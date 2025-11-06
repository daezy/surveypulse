from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""

    # Project
    PROJECT_NAME: str = "SurveyPulse API"
    VERSION: str = "1.0.0"
    DEBUG: bool = False

    # API
    API_V1_STR: str = "/api/v1"

    # CORS - Support both list and comma-separated string from env
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
    ]

    # Database
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "survey_analysis"

    # OpenAI
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4o-mini"  # Better for large context (128k tokens)
    OPENAI_MAX_TOKENS: int = 4096  # Completion tokens
    OPENAI_TEMPERATURE: float = 0.7

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # File Upload
    MAX_UPLOAD_SIZE: int = 250 * 1024 * 1024  # 250MB (increased for large survey files)
    ALLOWED_EXTENSIONS: List[str] = [".csv", ".txt", ".json"]

    # Analysis
    MAX_RESPONSES_PER_BATCH: int = 50
    SENTIMENT_THRESHOLD: float = 0.1

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore",  # Allow extra fields in .env
    }

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Parse ALLOWED_ORIGINS from comma-separated string if provided as env var
        if os.getenv("ALLOWED_ORIGINS"):
            origins = os.getenv("ALLOWED_ORIGINS").split(",")
            self.ALLOWED_ORIGINS = [origin.strip() for origin in origins]


settings = Settings()
