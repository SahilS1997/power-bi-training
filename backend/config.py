from pydantic_settings import BaseSettings
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Power BI Training Portal API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Microsoft Fabric
    FABRIC_WORKSPACE_ID: str = os.getenv("FABRIC_WORKSPACE_ID", "")
    FABRIC_LAKEHOUSE_ID: str = os.getenv("FABRIC_LAKEHOUSE_ID", "")
    FABRIC_TENANT_ID: str = os.getenv("FABRIC_TENANT_ID", "")
    FABRIC_CLIENT_ID: str = os.getenv("FABRIC_CLIENT_ID", "")
    FABRIC_CLIENT_SECRET: str = os.getenv("FABRIC_CLIENT_SECRET", "")
    
    # Database
    FABRIC_SQL_ENDPOINT: str = ""  # Will be constructed from workspace/lakehouse IDs
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "https://sahils1997.github.io",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000"
    ]
    
    # Admin Credentials (Default)
    DEFAULT_ADMIN_EMAIL: str = "admin@powerbi.training"
    DEFAULT_ADMIN_PASSWORD: str = "PowerBI2026Admin!"
    
    # Video Platforms
    SUPPORTED_VIDEO_PLATFORMS: List[str] = ["youtube", "vimeo", "azure", "direct"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
