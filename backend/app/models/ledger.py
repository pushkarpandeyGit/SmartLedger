import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base

class AccountType(str, enum.Enum):
    ASSET = "ASSET"           # Normal balance: Debit (Cash, Bank, Accounts Receivable)
    LIABILITY = "LIABILITY"   # Normal balance: Credit (Loans, Credit Cards, Accounts Payable)
    EQUITY = "EQUITY"         # Normal balance: Credit (Owner Equity, Retained Earnings)
    REVENUE = "REVENUE"       # Normal balance: Credit (Sales, Interest Earned)
    EXPENSE = "EXPENSE"       # Normal balance: Debit (Server Hosting, Office, Travel)

class EntryType(str, enum.Enum):
    DEBIT = "DEBIT"
    CREDIT = "CREDIT"

class Account(Base):
    """
    General Ledger Account.
    Follows banking chart of accounts standard.
    """
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True, nullable=False) # e.g. "1010"
    name = Column(String(100), nullable=False)                         # e.g. "Operational Cash Reserve"
    account_type = Column(Enum(AccountType), nullable=False)
    description = Column(String(255), nullable=True)
    currency = Column(String(3), default="INR")                       # NatWest default is GBP
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    legs = relationship("TransactionLeg", back_populates="account")

class JournalEntry(Base):
    """
    Atomic financial transaction container.
    Guarantees: sum(Debits) == sum(Credits)
    """
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    reference_id = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(String(255), nullable=False)
    posted_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    legs = relationship("TransactionLeg", back_populates="journal_entry", cascade="all, delete-orphan")

class TransactionLeg(Base):
    """
    Single leg of a double-entry transaction.
    Points to an account, specifies DEBIT or CREDIT, and amount.
    """
    __tablename__ = "transaction_legs"

    id = Column(Integer, primary_key=True, index=True)
    journal_entry_id = Column(Integer, ForeignKey("journal_entries.id", ondelete="CASCADE"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    amount = Column(Float, nullable=False)
    entry_type = Column(Enum(EntryType), nullable=False)

    # Relationships
    journal_entry = relationship("JournalEntry", back_populates="legs")
    account = relationship("Account", back_populates="legs")