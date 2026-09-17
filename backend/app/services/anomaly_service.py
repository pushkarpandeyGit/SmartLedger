import math
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.ledger import Account, AccountType, TransactionLeg, EntryType, JournalEntry

def detect_outlier_transactions(db: Session, z_threshold: float = 1.8) -> List[Dict[str, Any]]:
    """
    Statistical Outlier Detection for Unusual Financial Debit Transactions.
    
    Why this matters for banking (NatWest):
    Banks continuously run real-time anomaly engines on outgoing disbursements to
    detect fraudulent activity, duplicate invoices, or inadvertent operational errors.
    
    Method:
    Computes sample mean (mu) and standard deviation (sigma) of debit amounts.
    Flags any transaction where:
        Z = (amount - mu) / sigma > threshold
    """
    # Fetch all debit legs belonging to expense accounts
    records = (
        db.query(TransactionLeg, JournalEntry, Account)
        .join(JournalEntry, TransactionLeg.journal_entry_id == JournalEntry.id)
        .join(Account, TransactionLeg.account_id == Account.id)
        .filter(TransactionLeg.entry_type == EntryType.DEBIT, Account.account_type == AccountType.EXPENSE)
        .all()
    )

    if len(records) < 3:
        return []

    amounts = [rec[0].amount for rec in records]
    n = len(amounts)
    mean_amount = sum(amounts) / n
    variance = sum((x - mean_amount) ** 2 for x in amounts) / (n - 1) if n > 1 else 0
    std_dev = math.sqrt(variance)

    if std_dev == 0:
        return []

    flagged_anomalies = []

    for leg, journal, account in records:
        z_score = (leg.amount - mean_amount) / std_dev
        if z_score >= z_threshold:
            flagged_anomalies.append({
                "journal_id": journal.id,
                "reference_id": journal.reference_id,
                "description": journal.description,
                "account_name": account.name,
                "amount": leg.amount,
                "z_score": round(z_score, 2),
                "historical_mean": round(mean_amount, 2),
                "posted_at": journal.posted_at.isoformat(),
                "reason": f"Outlier debit: Â₹{leg.amount:,.2f} is {z_score:.1f}x standard deviations above average (Â₹{mean_amount:,.2f})"
            })

    flagged_anomalies.sort(key=lambda x: x["z_score"], reverse=True)
    return flagged_anomalies