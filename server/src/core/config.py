from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "School P2 Backend"
    API_V1_STR: str = "/api/v1"
    
    # Environment: "development" or "production"
    ENVIRONMENT: str = "development"
    
    # CORS Origins: List of allowed origins. 
    # In production, replace '*' with specific domains.
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # Render / Deployment
    PORT: int = 8000
    RENDER_EXTERNAL_URL: str | None = None
    
    # Database (Neon / Postgres)
    # Default to a placeholder to prevent startup crashes if .env is missing
    DATABASE_URL: str = "postgresql://neondb_owner:npg_ZJHrQ8gRn9lU@ep-tiny-term-a1vxtva2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

    # JWT Authentication
    SECRET_KEY: str = "change_this_to_a_secure_random_string_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 240 # 4 hours
    
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

settings = Settings()
