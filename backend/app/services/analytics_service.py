from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.ledger import Account, AccountType, TransactionLeg, EntryType
from app.services.ledger_service import calculate_account_balance
from app.core.redis_client import get_cached_json, set_cached_json

def get_financial_summary(db: Session) -> Dict[str, Any]:
    """
    Computes real-time balance sheet metrics & income statement summaries.
    Caches results in Redis with a 60-second TTL.
    """
    cache_key = "smartledger:analytics:summary"
    cached = get_cached_json(cache_key)
    if cached is not None:
        return cached

    accounts = db.query(Account).all()
    
    total_assets = 0.0
    total_liabilities = 0.0
    total_equity = 0.0
    total_revenue = 0.0
    total_expenses = 0.0

    category_breakdown = []

    for acc in accounts:
        bal = calculate_account_balance(db, acc)
        
        if acc.account_type == AccountType.ASSET:
            total_assets += bal
        elif acc.account_type == AccountType.LIABILITY:
            total_liabilities += bal
        elif acc.account_type == AccountType.EQUITY:
            total_equity += bal
        elif acc.account_type == AccountType.REVENUE:
            total_revenue += bal
        elif acc.account_type == AccountType.EXPENSE:
            total_expenses += bal
            if bal > 0:
                category_breakdown.append({
                    "account_id": acc.id,
                    "code": acc.code,
                    "name": acc.name,
                    "amount": round(bal, 2)
                })

    net_worth = round(total_assets - total_liabilities, 2)
    net_income = round(total_revenue - total_expenses, 2)

    # Sort categories by descending expense
    category_breakdown.sort(key=lambda x: x["amount"], reverse=True)

    summary = {
        "total_assets": round(total_assets, 2),
        "total_liabilities": round(total_liabilities, 2),
        "total_equity": round(total_equity, 2),
        "net_worth": net_worth,
        "total_revenue": round(total_revenue, 2),
        "total_expenses": round(total_expenses, 2),
        "net_income": net_income,
        "expense_breakdown": category_breakdown,
        "currency": "GBP"
    }

    set_cached_json(cache_key, summary, ttl=60)
    return summary