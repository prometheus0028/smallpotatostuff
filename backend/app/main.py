"""Main FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .core.config import settings
from .api.routes import router
from .services.session import session_store


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    print("Starting Financial Intelligence Backend...")
    print(f"OpenAI configured: {bool(settings.openai_api_key)}")
    print(f"Supabase configured: {bool(settings.supabase_url)}")
    yield
    # Shutdown
    print("Shutting down...")
    session_store.clear()


app = FastAPI(
    title="Financial Intelligence API",
    description="Multi-agent financial analysis backend for HACKVERSE: INTO THE WEB",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration - permissive for hackathon demo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Financial Intelligence API",
        "version": "1.0.0",
        "description": "Multi-agent financial analysis backend",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "market": "/api/market/{symbol}",
            "profile": "/api/profile/{user_id}",
            "portfolio": "/api/portfolio/{user_id}",
            "analyze": "/api/analyze (POST)",
            "session": "/api/session/{session_id}",
            "degraded_mode": "/api/demo/degraded-data (POST/GET)",
        },
        "demo_profiles": ["demo-conservative", "demo-aggressive", "demo-moderate"],
        "demo_symbols": ["RELIANCE", "HDFCBANK", "TATAMOTORS"],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=settings.debug,
    )