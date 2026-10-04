from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import router as api_router
from app.database.connection import init_db

init_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SentinelAI — Real-Time Defense Against Prompt Injection & Sensitive-Data Leakage in AI Chatbots"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "product": "SentinelAI",
        "description": "Real-Time AI Security Middleware Layer",
        "team": "Team MSEC (Meenakshi Sundararajan Engineering College)",
        "event": "AURA-7.2 — CRYPTAURA 2.0",
        "status": "OPERATIONAL"
    }
