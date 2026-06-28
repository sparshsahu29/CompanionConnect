from pydantic_settings import BaseSettings
from typing import List, Optional
import json


class Settings(BaseSettings):
    # App
    APP_NAME: str = "CompanionConnect"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    ALGORITHM: str = "HS256"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/companionconnect"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    FRONTEND_URL: Optional[str] = None

    # Upload
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 5

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    def get_cors_origins(self) -> List[str]:
        origins = []

        if isinstance(self.CORS_ORIGINS, str):
            try:
                origins = json.loads(self.CORS_ORIGINS)
            except json.JSONDecodeError:
                origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
        else:
            origins = list(self.CORS_ORIGINS)

        if self.FRONTEND_URL:
            origins.append(self.FRONTEND_URL.rstrip("/"))

        return list(set(origin.rstrip("/") for origin in origins if origin))


settings = Settings()