"""
Application configuration settings
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # OpenAI
    OPENAI_MODEL: str = "gpt-5-mini"
    OPENAI_API_KEY: str = "your-openai-api-key"

    # Tavily
    TAVILY_API_KEY: str = "your-tavily-api-key"
    
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
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "console"  # "console" for pretty output, "json" for JSON output
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
