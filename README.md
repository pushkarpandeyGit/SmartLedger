# ðŸ’³ SmartLedger â€” High-Integrity Double-Entry Banking & Risk Analytics Engine

> Production-style financial ledger and risk intelligence engine designed for core banking environments. Features strict GAAP/IFRS double-entry transaction validation ($\sum \text{Debits} == \sum \text{Credits}$), Redis in-memory balance caching, and statistical Z-score outlier detection.

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-teal.svg)](https://fastapi.tiangolo.com/)
[![SQLAlchemy](https://img.shields.io/badge/ORM-SQLAlchemy%202.0-red.svg)](https://sqlalchemy.org/)
[![Redis](https://img.shields.io/badge/Cache-Redis-darkred.svg)](https://redis.io/)
[![Pytest](https://img.shields.io/badge/Tests-Pytest%20100%25%20Passing-brightgreen.svg)]()
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-cyan.svg)](https://tailwindcss.com/)

---

## ðŸ›ï¸ System Architecture

```
                               â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                               â”‚       React Frontend (Vite + Tailwind)       â”‚
                               â”‚  - Live Real-Time Double-Entry Balance Bar   â”‚
                               â”‚  - Chart of Accounts & Balances              â”‚
                               â”‚  - Statistical Anomaly Risk Alert Banner     â”‚
                               â”‚  - Operating Expense Distribution Visualizer â”‚
                               â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                                      â”‚
                                   JSON REST Requests â”‚ http://localhost:8000/api/v1
                                                      â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                                 FastAPI Financial Gateway                                   â”‚
â”‚                                                                                             â”‚
â”‚  [Pydantic v2 Invariant Guard] â”€â”€â–¶ [Lifespan Startup Seeder] â”€â”€â–¶ [OpenAPI / Swagger Docs]   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚                                   â”‚
     1. Validate: Î£ Debits == Î£ Credits                2. Real-Time Analytics
                            â–¼                                   â–¼
                 â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”               â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                 â”‚  SQLAlchemy Engine â”‚               â”‚   Risk Anomaly     â”‚
                 â”‚  (SQLite / Postgresâ”‚               â”‚  Z-Score Engine    â”‚
                 â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜               â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â–²â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚                                   â”‚
               Commit / Rollback ACID Trans.                    â”‚ Outlier Debits (> 1.8Ïƒ)
                            â–¼                                   â”‚
                 â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                         â”‚
                 â”‚  General Ledger    â”‚â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                 â”‚ (Journal & Legs)   â”‚
                 â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚ Invalidate on Mutation
                            â–¼
                 â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                 â”‚  Redis Cache Layer â”‚ (Sub-millisecond balance reads & summary analytics)
                 â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸš€ Key Engineering & Financial Highlights (Interview Discussion Points)

1. **The Double-Entry Mathematical Invariant:**
   - Instead of modifying balances arbitrarily, every financial event creates a `JournalEntry` containing at least two `TransactionLeg` records.
   - Pydantic v2 enforces down to the cent:
     $$\sum \text{Debits} == \sum \text{Credits}$$
   - Any unbalanced posting (e.g. Debit Â£100 vs Credit Â£90) is blocked with an HTTP `422 Unprocessable Entity` before reaching database locks.

2. **Standard Chart of Accounts (GAAP/IFRS):**
   - Implements banking standard account categories:
     - **Assets (1000s)** & **Expenses (5000s):** Normal balance is **Debit** ($\text{Balance} = \sum \text{Debits} - \sum \text{Credits}$).
     - **Liabilities (2000s)**, **Equity (3000s)** & **Revenue (4000s):** Normal balance is **Credit** ($\text{Balance} = \sum \text{Credits} - \sum \text{Debits}$).

3. **Redis In-Memory Balance Caching & Circuit Breaking:**
   - Account balances and portfolio metrics are cached in Redis with a 60-second TTL.
   - Posting any new transaction immediately invalidates matching Redis cache keys (`smartledger:balance:*` and `smartledger:analytics:*`).
   - Built with graceful circuit breaking: if Redis is offline locally, queries seamlessly fall back to database calculations without disruption.

4. **Statistical Anomaly & Fraud Risk Detection:**
   - Computes historical mean ($\mu$) and standard deviation ($\sigma$) across debit transactions.
   - Identifies outliers where $Z = \frac{\text{Amount} - \mu}{\sigma} \ge 1.8$, providing a transparent reason string for compliance reviews.

5. **Automated Testing Suite (100% Pass Rate):**
   - Pytest test suite in `tests/test_ledger.py` verifying health probes, balanced transaction success, atomic rollbacks on unbalanced inputs, balance sheet reconciliation, and outlier detection.

---

## ðŸ“ Repository Structure

```
smartledger/
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”œâ”€â”€ core/            # Config, SQLAlchemy DB session, Redis client with circuit breaker
â”‚   â”‚   â”œâ”€â”€ models/          # Account, JournalEntry, TransactionLeg (SQLAlchemy ORM)
â”‚   â”‚   â”œâ”€â”€ schemas/         # Pydantic v2 validation models enforcing double-entry invariants
â”‚   â”‚   â”œâ”€â”€ services/        # Double-entry ledger engine, Anomaly detector, Analytics
â”‚   â”‚   â”œâ”€â”€ routers/         # /accounts, /ledger, /analytics, /health
â”‚   â”‚   â””â”€â”€ main.py          # FastAPI application & startup seed data
â”‚   â”œâ”€â”€ tests/               # Pytest automated test suite (100% pass)
â”‚   â”œâ”€â”€ EXPLAINER.md         # Plain-English interview cheat sheet for Banking & Accounting APIs
â”‚   â”œâ”€â”€ requirements.txt
â”‚   â””â”€â”€ pytest.ini
â”œâ”€â”€ frontend/
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ components/      # MetricCards, AnomalyAlert, ExpenseBreakdown, LedgerTable, PostModal
â”‚   â”‚   â”œâ”€â”€ App.jsx          # Dashboard layout & live banking metrics
â”‚   â”‚   â””â”€â”€ index.css        # Tailwind styling & dark banking theme
â”‚   â”œâ”€â”€ vite.config.js       # Proxy configurations to backend (:8000)
â”‚   â””â”€â”€ package.json
â””â”€â”€ README.md
```

---

## ðŸ› ï¸ Quick Start Guide


### 🐳 Run with Docker Compose (One-Click Setup)
```bash
docker-compose up --build
```
This automatically boots:
- Redis on port `6379`
- SmartLedger FastAPI Backend on `http://localhost:8000`
- SmartLedger React Frontend on `http://localhost:80`

### 1. Run Backend
```bash
cd backend
# Create virtual environment if needed
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Start FastAPI server
.\venv\Scripts\uvicorn app.main:app --reload --port 8000
```
- API Server: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`
- Health Probe: `http://localhost:8000/health`

**Run Tests:**
```bash
.\venv\Scripts\pytest -v
```

### 2. Run Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5174` in your browser.

---

## ðŸ“ Resume Bullet Points (Tailored for NatWest)

```markdown
- Designed and engineered SmartLedger, a core banking double-entry ledger platform using Python, FastAPI, SQLAlchemy, and React, enforcing GAAP/IFRS balance invariants (Debits == Credits) down to the cent.
- Implemented in-memory caching using Redis (60s TTL) with automated key invalidation on new postings, reducing database read latency for real-time account reconciliation.
- Developed an automated statistical risk engine calculating Z-score dispersions on outgoing disbursements to flag outlier or fraudulent debits exceeding 1.8 standard deviations.
- Wrote an automated Pytest test suite covering atomic transaction execution, schema invariant validation, and financial balance sheet mathematical integrity.
```