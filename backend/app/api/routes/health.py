from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "LLM Survey Analysis API",
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
