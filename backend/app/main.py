from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy import text
from .core.config import settings
from .core.database import engine, Base
from .api import auth, users, resumes, ai, ml, ats


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events"""
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield
    
    # Shutdown
    await engine.dispose()


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="AI-powered resume builder with ML and AI features",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(resumes.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(ml.router, prefix="/api")
app.include_router(ats.router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Resume Builder API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check database
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "disconnected"
    
    # Check ML model
    try:
        from .ml import get_predictor
        predictor = get_predictor()
        ml_status = "loaded"
    except Exception:
        ml_status = "not_loaded"
    
    # Check AI configuration
    ai_status = "configured" if settings.AI_API_KEY else "not_configured"
    
    return {
        "status": "healthy",
        "database": db_status,
        "ml_model": ml_status,
        "ai_provider": ai_status,
        "provider": settings.AI_PROVIDER if settings.AI_API_KEY else None
    }


@app.get("/api/templates")
async def get_templates():
    """Get available resume templates"""
    templates = [
        {
            "id": "modern",
            "name": "Modern",
            "description": "Clean and contemporary design",
            "preview": "/templates/modern.png"
        },
        {
            "id": "professional",
            "name": "Professional",
            "description": "Traditional and business-focused",
            "preview": "/templates/professional.png"
        },
        {
            "id": "minimal",
            "name": "Minimal",
            "description": "Simple and elegant",
            "preview": "/templates/minimal.png"
        },
        {
            "id": "executive",
            "name": "Executive",
            "description": "For senior leadership roles",
            "preview": "/templates/executive.png"
        },
        {
            "id": "ats",
            "name": "ATS Friendly",
            "description": "Optimized for applicant tracking systems",
            "preview": "/templates/ats.png"
        },
        {
            "id": "creative",
            "name": "Creative",
            "description": "For design and creative roles",
            "preview": "/templates/creative.png"
        },
        {
            "id": "academic",
            "name": "Academic",
            "description": "For academic and research positions",
            "preview": "/templates/academic.png"
        }
    ]
    return templates


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Handle all unhandled exceptions"""
    if settings.DEBUG:
        raise exc
    
    return HTTPException(
        status_code=500,
        detail="An internal error occurred"
    )
