from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.analytics_service import get_financial_summary
from app.services.anomaly_service import detect_outlier_transactions

router = APIRouter(prefix="/analytics", tags=["Analytics & Risk Intelligence"])

@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    """Get aggregated balance sheet, profit/loss, and expense breakdowns (Redis cached)."""
    return get_financial_summary(db)

@router.get("/anomalies")
def get_anomalies(threshold: float = 1.8, db: Session = Depends(get_db)):
    """Detect unusual or outlier debit disbursements using statistical Z-score dispersion."""
    return detect_outlier_transactions(db, z_threshold=threshold)