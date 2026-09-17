from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.ledger import JournalEntry
from app.schemas.ledger import JournalEntryCreate, JournalEntryResponse
from app.services.ledger_service import post_journal_entry

router = APIRouter(prefix="/ledger", tags=["General Ledger"])

@router.get("", response_model=List[JournalEntryResponse])
def get_journal_entries(limit: int = 50, db: Session = Depends(get_db)):
    """Retrieve chronologically ordered double-entry journal transactions with all legs."""
    entries = (
        db.query(JournalEntry)
        .order_by(JournalEntry.posted_at.desc())
        .limit(limit)
        .all()
    )
    return entries

@router.post("", response_model=JournalEntryResponse, status_code=201)
def record_transaction(entry_in: JournalEntryCreate, db: Session = Depends(get_db)):
    """
    Atomically records a verified double-entry transaction.
    Guarantees sum(Debits) == sum(Credits) or rejects with 422 Unprocessable Entity.
    """
    return post_journal_entry(db, entry_in)