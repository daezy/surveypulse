from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union
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
    ALLOWED_ORIGINS: Union[List[str], str] = [
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

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse ALLOWED_ORIGINS from comma-separated string or list"""
        if isinstance(v, str):
            # Split comma-separated string into list
            return [origin.strip() for origin in v.split(",")]
        return v


settings = Settings()
