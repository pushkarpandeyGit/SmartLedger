from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.ledger import Account
from app.schemas.ledger import AccountCreate, AccountResponse
from app.services.ledger_service import calculate_account_balance

router = APIRouter(prefix="/accounts", tags=["Accounts"])

@router.get("", response_model=List[AccountResponse])
def get_accounts(db: Session = Depends(get_db)):
    """Retrieve all accounts in the general ledger along with real-time reconciled balances."""
    accounts = db.query(Account).order_by(Account.code.asc()).all()
    results = []
    for acc in accounts:
        bal = calculate_account_balance(db, acc)
        results.append(AccountResponse(
            id=acc.id,
            code=acc.code,
            name=acc.name,
            account_type=acc.account_type,
            description=acc.description,
            currency=acc.currency,
            created_at=acc.created_at,
            balance=bal
        ))
    return results

@router.post("", response_model=AccountResponse, status_code=201)
def create_account(account_in: AccountCreate, db: Session = Depends(get_db)):
    """Create a new general ledger account."""
    existing = db.query(Account).filter(Account.code == account_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Account code {account_in.code} already exists.")

    acc = Account(
        code=account_in.code,
        name=account_in.name,
        account_type=account_in.account_type,
        description=account_in.description,
        currency=account_in.currency
    )
    db.add(acc)
    db.commit()
    db.refresh(acc)

    return AccountResponse(
        id=acc.id,
        code=acc.code,
        name=acc.name,
        account_type=acc.account_type,
        description=acc.description,
        currency=acc.currency,
        created_at=acc.created_at,
        balance=0.0
    )