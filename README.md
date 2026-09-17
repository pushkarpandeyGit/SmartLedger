# SmartLedger 💳

A high-integrity double-entry core banking engine and financial risk analytics platform built with Python, FastAPI, SQLAlchemy, Redis, and React.

Most personal finance and expense tracker projects are built with a single transactions table where balances are updated arbitrarily (`balance -= amount`). In real-world enterprise banking (such as NatWest), this approach fails regulatory compliance and causes silent data corruption. 

I built SmartLedger according to GAAP/IFRS accounting standards: every financial event is an atomic journal entry with at least two legs where total debits must equal total credits down to the exact paisa.

---
# Screenshots
<img width="1807" height="842" alt="Screenshot 2026-09-18 003521" src="https://github.com/user-attachments/assets/efbac3a7-6d28-4caf-8ef6-120c3fa8d083" />
<img width="1830" height="830" alt="Screenshot 2026-09-18 003535" src="https://github.com/user-attachments/assets/a85be69e-3dbd-4d08-8172-7c1a8f6e203d" />
<img width="1823" height="836" alt="Screenshot 2026-09-18 003548" src="https://github.com/user-attachments/assets/fed453eb-e605-4dfa-b1e1-b7a1f3450c2b" />
<img width="1833" height="837" alt="Screenshot 2026-09-18 003625" src="https://github.com/user-attachments/assets/3f78ac19-ba69-49d2-b568-8b67bb7f0ede" />
<img width="1252" height="348" alt="image" src="https://github.com/user-attachments/assets/1763eda1-d94e-4493-918b-459f5b22f943" />




## What It Does

- **Strict Double-Entry Invariant:** Enforces the fundamental banking rule:
  $$\sum \text{Debits} == \sum \text{Credits}$$
  Pydantic v2 validates all transactions before opening database sessions. Any imbalanced transaction (e.g. Debit ₹5,000 vs Credit ₹4,200) is rejected with HTTP `422 Unprocessable Entity`.
- **Standard Chart of Accounts (GAAP/IFRS):**
  - **Assets & Expenses:** Normal balance is **Debit** ($\text{Balance} = \sum \text{Debits} - \sum \text{Credits}$).
  - **Liabilities, Equity & Revenue:** Normal balance is **Credit** ($\text{Balance} = \sum \text{Credits} - \sum \text{Debits}$).
- **Redis In-Memory Caching:** Account balances and balance sheet summaries are cached in Redis with a 60-second TTL. The cache is automatically evicted/invalidated whenever a new journal posting is committed.
- **Statistical Risk Intelligence (Z-Score Anomaly Engine):** Analyzes historical distributions of outgoing disbursements. Any transaction deviating by $Z \ge 1.8\sigma$ from the mean is flagged with a compliance risk alert.
- **Interactive UI with Balance Validation:** The React modal features live real-time debit vs. credit validation, disabling the commit button until books balance.
- **Automated Testing Suite:** 100% test coverage using Pytest verifying atomic commits, schema rollbacks, and mathematical balance sheet reconciliation.

---

## System Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │       React Frontend (Vite + Tailwind)       │
                               │  - Live Real-Time Double-Entry Balance Bar   │
                               │  - Chart of Accounts & Balances              │
                               │  - Statistical Anomaly Risk Alert Banner     │
                               │  - Operating Expense Distribution Visualizer │
                               └──────────────────────┬───────────────────────┘
                                                      │
                                   JSON REST Requests │ http://localhost:8000/api/v1
                                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 FastAPI Financial Gateway                                   │
│                                                                                             │
│  [Pydantic v2 Invariant Guard] ──▶ [Lifespan Startup Seeder] ──▶ [OpenAPI / Swagger Docs]   │
└───────────────────────────┬───────────────────────────────────┬─────────────────────────────┘
                            │                                   │
     1. Validate: Σ Debits == Σ Credits                2. Real-Time Analytics
                            ▼                                   ▼
                 ┌────────────────────┐               ┌────────────────────┐
                 │  SQLAlchemy Engine │               │   Risk Anomaly     │
                 │  (SQLite / Postgres│               │  Z-Score Engine    │
                 └──────────┬─────────┘               └─────────▲──────────┘
                            │                                   │
               Commit / Rollback ACID Trans.                    │ Outlier Debits (> 1.8σ)
                            ▼                                   │
                 ┌────────────────────┐                         │
                 │  General Ledger    │─────────────────────────┘
                 │ (Journal & Legs)   │
                 └──────────┬─────────┘
                            │ Invalidate on Mutation
                            ▼
                 ┌────────────────────┐
                 │  Redis Cache Layer │ (Sub-millisecond balance reads & summary analytics)
                 └────────────────────┘
```

---

## Tech Stack

- **Backend:** Python 3.11, FastAPI, SQLAlchemy 2.0, Pydantic v2, Redis (redis-py), Uvicorn
- **Database:** SQLite (default for development) / PostgreSQL ready
- **Frontend:** React 19, Vite, Tailwind CSS, Lucide React
- **Testing:** Pytest, HTTPX, Starlette TestClient
- **DevOps:** Docker, Docker Compose

---

## Project Structure

```
smartledger/
├── backend/
│   ├── app/
│   │   ├── core/            # Config, database session, Redis client with circuit breaker
│   │   ├── models/          # Account, JournalEntry, TransactionLeg (SQLAlchemy ORM)
│   │   ├── schemas/         # Pydantic v2 models enforcing double-entry invariants
│   │   ├── services/        # Double-entry ledger engine, Anomaly detector, Analytics
│   │   ├── routers/         # /accounts, /ledger, /analytics, /health
│   │   └── main.py          # FastAPI application & lifespan seed data
│   ├── tests/               # Pytest automated test suite (100% passing)
│   ├── requirements.txt
│   ├── pytest.ini
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # MetricCards, AnomalyAlert, ExpenseBreakdown, LedgerTable, PostModal
│   │   ├── App.jsx          # Dashboard layout and live banking metrics
│   │   └── index.css        # Tailwind styling and dark banking theme
│   ├── Dockerfile
│   ├── vite.config.js
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## Quick Start

### Option 1: Run with Docker Compose

Make sure Docker Desktop is running:

```bash
docker-compose up --build
```

This boots:
- **Redis** on port `6379`
- **FastAPI Backend** on `http://localhost:8000`
- **React Frontend** on `http://localhost:80`

---

### Option 2: Run Locally (Manual)

#### 1. Backend Setup

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt python-dotenv
```

Start the FastAPI server:
```bash
.\.venv\Scripts\uvicorn app.main:app --reload --port 8000
```
- API Server: `http://localhost:8000`
- Interactive OpenAPI / Swagger UI: `http://localhost:8000/docs`
- Health Probe: `http://localhost:8000/health`

#### 2. Frontend Setup

In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5174` in your browser.

---

## Running Automated Tests

Run the Pytest suite to verify the double-entry invariant validation, rollback behavior, and balance sheet reconciliation:

```bash
cd backend
.\.venv\Scripts\pytest -v
```

---

## Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status probe |
| `GET` | `/api/v1/accounts` | Retrieve chart of accounts with real-time reconciled balances |
| `POST` | `/api/v1/accounts` | Create a new general ledger account |
| `GET` | `/api/v1/ledger` | Retrieve journal history with all debit and credit legs |
| `POST` | `/api/v1/ledger` | **Atomically commit a verified double-entry transaction** |
| `GET` | `/api/v1/analytics/summary` | Balance sheet, net worth, and expense breakdowns (Redis cached) |
| `GET` | `/api/v1/analytics/anomalies` | **Statistical Z-score outlier disbursement detection** |

---

## Author

**Pushkar Pandey**
- GitHub: [@pushkarpandeyGit](https://github.com/pushkarpandeyGit)
- LinkedIn:  [@pushkarpandeyLinkedIn](https://www.linkedin.com/in/pushkar-kumar-pandey/)
