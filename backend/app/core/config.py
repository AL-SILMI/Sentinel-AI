import os

class Settings:
    PROJECT_NAME: str = "SentinelAI"
    VERSION: str = "2.0.0"
    API_PREFIX: str = "/api"
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    PORT: int = int(os.getenv("PORT", "8000"))

settings = Settings()
