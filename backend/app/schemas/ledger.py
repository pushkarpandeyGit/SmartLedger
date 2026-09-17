from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, model_validator
from app.models.ledger import AccountType, EntryType

# --- Account Schemas ---
class AccountBase(BaseModel):
    code: str = Field(..., example="1010", description="Chart of accounts code")
    name: str = Field(..., example="Primary Checking Account")
    account_type: AccountType
    description: Optional[str] = None
    currency: str = Field(default="INR", example="GBP")

class AccountCreate(AccountBase):
    pass

class AccountResponse(AccountBase):
    id: int
    balance: float
    created_at: datetime

    class Config:
        from_attributes = True

# --- Transaction Leg Schemas ---
class TransactionLegCreate(BaseModel):
    account_id: int
    amount: float = Field(..., gt=0, description="Transaction amount (must be positive)")
    entry_type: EntryType

class TransactionLegResponse(BaseModel):
    id: int
    account_id: int
    amount: float
    entry_type: EntryType

    class Config:
        from_attributes = True

# --- Journal Entry Schemas ---
class JournalEntryCreate(BaseModel):
    description: str = Field(..., example="Monthly AWS Cloud Infrastructure Payment")
    reference_id: Optional[str] = None
    legs: List[TransactionLegCreate] = Field(..., min_length=2)

    @model_validator(mode="after")
    def validate_double_entry_balance(self):
        """
        The Fundamental Banking Invariant:
        sum(Debits) MUST equal sum(Credits) down to the cent.
        """
        total_debit = sum(leg.amount for leg in self.legs if leg.entry_type == EntryType.DEBIT)
        total_credit = sum(leg.amount for leg in self.legs if leg.entry_type == EntryType.CREDIT)

        if round(total_debit, 2) != round(total_credit, 2):
            raise ValueError(
                f"Double-entry accounting violation: Total Debits (Â₹{total_debit:.2f}) "
                f"must equal Total Credits (Â₹{total_credit:.2f}). Imbalance: Â₹{abs(total_debit - total_credit):.2f}"
            )
        return self

class JournalEntryResponse(BaseModel):
    id: int
    reference_id: str
    description: str
    posted_at: datetime
    legs: List[TransactionLegResponse]

    class Config:
        from_attributes = True