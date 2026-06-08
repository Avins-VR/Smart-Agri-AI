# backend/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration loaded from environment variables."""

    SECRET_KEY: str = os.getenv("SECRET_KEY", "fallback-secret-key")
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017/smart_agri_ai")
    DB_NAME: str = os.getenv("DB_NAME", "smart_agri_ai")
    FLASK_ENV: str = os.getenv("FLASK_ENV", "production")
    DEBUG: bool = os.getenv("FLASK_DEBUG", "False").lower() == "true"
    ALLOWED_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    ]


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config_map = {
    "development": DevelopmentConfig,
    "production":  ProductionConfig,
}

def get_config() -> Config:
    """Return the appropriate config class based on FLASK_ENV."""
    env = os.getenv("FLASK_ENV", "production").lower()
    return config_map.get(env, ProductionConfig)