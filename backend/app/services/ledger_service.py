import uuid
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException

from app.models.ledger import Account, AccountType, EntryType, JournalEntry, TransactionLeg
from app.schemas.ledger import AccountCreate, JournalEntryCreate
from app.core.redis_client import get_cached_json, set_cached_json, invalidate_cache

def calculate_account_balance(db: Session, account: Account) -> float:
    """
    Computes real-time account balance based on GAAP / IFRS accounting equation.
    
    Rule:
    - ASSET & EXPENSE: Normal balance is DEBIT -> balance = sum(DEBIT) - sum(CREDIT)
    - LIABILITY, EQUITY & REVENUE: Normal balance is CREDIT -> balance = sum(CREDIT) - sum(DEBIT)
    
    Redis Cache:
    Caches balance per account ID for high-speed sub-millisecond retrieval.
    """
    cache_key = f"smartledger:balance:{account.id}"
    cached_balance = get_cached_json(cache_key)
    if cached_balance is not None:
        return cached_balance

    total_debits = (
        db.query(func.coalesce(func.sum(TransactionLeg.amount), 0.0))
        .filter(TransactionLeg.account_id == account.id, TransactionLeg.entry_type == EntryType.DEBIT)
        .scalar()
    )

    total_credits = (
        db.query(func.coalesce(func.sum(TransactionLeg.amount), 0.0))
        .filter(TransactionLeg.account_id == account.id, TransactionLeg.entry_type == EntryType.CREDIT)
        .scalar()
    )

    if account.account_type in [AccountType.ASSET, AccountType.EXPENSE]:
        balance = round(float(total_debits - total_credits), 2)
    else:
        balance = round(float(total_credits - total_debits), 2)

    # Store in cache with 60s TTL
    set_cached_json(cache_key, balance, ttl=60)
    return balance


def post_journal_entry(db: Session, entry_in: JournalEntryCreate) -> JournalEntry:
    """
    Atomically posts a double-entry transaction.
    If any leg fails or account does not exist, transaction is rolled back cleanly.
    """
    # 1. Verify all target accounts exist
    account_ids = {leg.account_id for leg in entry_in.legs}
    existing_accounts = db.query(Account.id).filter(Account.id.in_(account_ids)).all()
    found_ids = {acc[0] for acc in existing_accounts}

    missing_ids = account_ids - found_ids
    if missing_ids:
        raise HTTPException(status_code=404, detail=f"Target account ID(s) not found: {list(missing_ids)}")

    # 2. Create Journal Container
    ref = entry_in.reference_id or f"TXN-{uuid.uuid4().hex[:8].upper()}"
    
    # Check reference uniqueness
    if db.query(JournalEntry).filter(JournalEntry.reference_id == ref).first():
        ref = f"TXN-{uuid.uuid4().hex[:8].upper()}"

    journal = JournalEntry(
        reference_id=ref,
        description=entry_in.description
    )
    db.add(journal)
    db.flush() # Populate journal.id

    # 3. Create Transaction Legs
    for leg_in in entry_in.legs:
        leg = TransactionLeg(
            journal_entry_id=journal.id,
            account_id=leg_in.account_id,
            amount=round(leg_in.amount, 2),
            entry_type=leg_in.entry_type
        )
        db.add(leg)

    db.commit()
    db.refresh(journal)

    # 4. Invalidate Redis Caches
    invalidate_cache("smartledger:balance:")
    invalidate_cache("smartledger:analytics:")

    return journal


def seed_default_chart_of_accounts(db: Session) -> None:
    """Seeds industry-standard chart of accounts if database is fresh."""
    if db.query(Account).first() is not None:
        return

    defaults = [
        # Assets (1000s)
        {"code": "1010", "name": "Primary Operating Cash (NatWest Reserve)", "account_type": AccountType.ASSET, "description": "Liquid cash reserves for operations"},
        {"code": "1020", "name": "Accounts Receivable", "account_type": AccountType.ASSET, "description": "Pending payments from enterprise clients"},
        {"code": "1030", "name": "Short-Term Treasury Bills", "account_type": AccountType.ASSET, "description": "Liquid risk-free yields"},
        # Liabilities (2000s)
        {"code": "2010", "name": "Commercial Credit Facility", "account_type": AccountType.LIABILITY, "description": "Revolving credit line"},
        {"code": "2020", "name": "Accounts Payable", "account_type": AccountType.LIABILITY, "description": "Pending vendor invoices"},
        # Equity (3000s)
        {"code": "3010", "name": "Owner Retained Capital", "account_type": AccountType.EQUITY, "description": "Foundational capital investment"},
        # Revenue (4000s)
        {"code": "4010", "name": "SaaS Subscription Revenue", "account_type": AccountType.REVENUE, "description": "Monthly recurring client subscriptions"},
        {"code": "4020", "name": "Treasury Interest Income", "account_type": AccountType.REVENUE, "description": "Interest yield from bank deposits"},
        # Expenses (5000s)
        {"code": "5010", "name": "Cloud Infrastructure & AWS Costs", "account_type": AccountType.EXPENSE, "description": "Server hosting and compute"},
        {"code": "5020", "name": "Engineering & Talent Payroll", "account_type": AccountType.EXPENSE, "description": "Staff and contractor compensation"},
        {"code": "5030", "name": "Office Facilities & Operations", "account_type": AccountType.EXPENSE, "description": "Lease and utilities"},
        {"code": "5040", "name": "Software Tooling & Licenses", "account_type": AccountType.EXPENSE, "description": "GitHub, JetBrains, Slack licenses"}
    ]

    for item in defaults:
        acc = Account(**item)
        db.add(acc)
    db.commit()