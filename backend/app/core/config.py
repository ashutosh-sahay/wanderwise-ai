"""
Application configuration settings
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    APP_NAME: str = "WanderWise AI API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
