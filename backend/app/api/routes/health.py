from fastapi import APIRouter, Depends
from datetime import datetime
from app.core.database import get_database

router = APIRouter()


@router.get("/health")
async def health_check():
    """Simple health check endpoint - must respond quickly for Render"""
    return {"status": "healthy"}


@router.get("/health/detailed")
async def detailed_health_check(db=Depends(get_database)):
    """Detailed health check with database status"""
    try:
        # Quick ping to verify database connection
        await db.command("ping")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "LLM Survey Analysis API",
        "database": db_status,
    }


@router.get("/status")
async def get_status():
    """Get system status"""
    return {
        "api_status": "operational",
        "database_status": "connected",
        "llm_status": "available",
        "version": "1.0.0",
    }
