from fastapi import APIRouter
from datetime import datetime

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "SmartLedger FinTech Core API",
        "timestamp": datetime.utcnow().isoformat()
    }