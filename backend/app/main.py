from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.models.ledger import Account, EntryType, JournalEntry
from app.schemas.ledger import JournalEntryCreate, TransactionLegCreate
from app.services.ledger_service import seed_default_chart_of_accounts, post_journal_entry
from app.routers import accounts, ledger, analytics, health

# Create database tables
Base.metadata.create_all(bind=engine)

def initialize_database():
    """Initializes standard chart of accounts and seeds initial transactions if database is fresh."""
    db = SessionLocal()
    try:
        seed_default_chart_of_accounts(db)

        if db.query(JournalEntry).first() is None:
            cash_acc = db.query(Account).filter(Account.code == "1010").first()
            equity_acc = db.query(Account).filter(Account.code == "3010").first()
            rev_acc = db.query(Account).filter(Account.code == "4010").first()
            cloud_acc = db.query(Account).filter(Account.code == "5010").first()
            office_acc = db.query(Account).filter(Account.code == "5030").first()

            if cash_acc and equity_acc:
                # 1. Initial Foundational Capital Injection: £50,000
                post_journal_entry(db, JournalEntryCreate(
                    description="Initial Capital Equity Allocation",
                    legs=[
                        TransactionLegCreate(account_id=cash_acc.id, amount=50000.0, entry_type=EntryType.DEBIT),
                        TransactionLegCreate(account_id=equity_acc.id, amount=50000.0, entry_type=EntryType.CREDIT)
                    ]
                ))

            if cash_acc and rev_acc:
                # 2. Enterprise Client SaaS Inflow: £12,500
                post_journal_entry(db, JournalEntryCreate(
                    description="Tier-1 Banking API Integration License Fee",
                    legs=[
                        TransactionLegCreate(account_id=cash_acc.id, amount=12500.0, entry_type=EntryType.DEBIT),
                        TransactionLegCreate(account_id=rev_acc.id, amount=12500.0, entry_type=EntryType.CREDIT)
                    ]
                ))

            if cash_acc and cloud_acc:
                # 3. Monthly Cloud Infrastructure: £1,250
                post_journal_entry(db, JournalEntryCreate(
                    description="AWS High-Availability Cluster Hosting",
                    legs=[
                        TransactionLegCreate(account_id=cloud_acc.id, amount=1250.0, entry_type=EntryType.DEBIT),
                        TransactionLegCreate(account_id=cash_acc.id, amount=1250.0, entry_type=EntryType.CREDIT)
                    ]
                ))

            if cash_acc and office_acc:
                # 4. Routine Office Operations: £350
                post_journal_entry(db, JournalEntryCreate(
                    description="Quarterly Hardware & Office Connectivity",
                    legs=[
                        TransactionLegCreate(account_id=office_acc.id, amount=350.0, entry_type=EntryType.DEBIT),
                        TransactionLegCreate(account_id=cash_acc.id, amount=350.0, entry_type=EntryType.CREDIT)
                    ]
                ))

                # 5. Outlier/Anomaly Simulation: An unusually large expense £4,800
                post_journal_entry(db, JournalEntryCreate(
                    description="Emergency Datacenter Disaster Recovery Drill",
                    legs=[
                        TransactionLegCreate(account_id=cloud_acc.id, amount=4800.0, entry_type=EntryType.DEBIT),
                        TransactionLegCreate(account_id=cash_acc.id, amount=4800.0, entry_type=EntryType.CREDIT)
                    ]
                ))
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Modern FastAPI lifespan event
    initialize_database()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="High-Integrity Double-Entry Accounting Platform with Redis Caching and Real-Time Risk Anomaly Detection for NatWest Intern Trainee Portfolio",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS middleware for React frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(health.router)
app.include_router(accounts.router, prefix=settings.API_V1_STR)
app.include_router(ledger.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)