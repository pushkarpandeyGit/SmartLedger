import os

class Settings:
    PROJECT_NAME: str = "SmartLedger FinTech Engine"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smartledger.db")
    REDIS_HOST: str = os.getenv("REDIS_HOST", "127.0.0.1")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    CACHE_TTL_SECONDS: int = 60

settings = Settings()