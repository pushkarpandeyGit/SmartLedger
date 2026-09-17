# SmartLedger Engineering & Banking Concepts Explainer (Interview Cheat Sheet)

This document provides clear, plain-English explanations and interview talking points for the core financial engineering principles implemented in **SmartLedger**.

---

## 1. The Core Banking Principle: Double-Entry Bookkeeping

### What is it?
In consumer apps like a basic expense tracker, a purchase is just a single number deducted from a balance. 
In actual enterprise banking (like **NatWest**), money can never simply "disappear" or "appear." Every financial event represents an exchange between two or more accounts.
For every transaction:
$$\sum \text{Debits} == \sum \text{Credits}$$

### How Debits & Credits Actually Work (The Accounting Equation):
The foundational equation of finance is:
$$\text{Assets} = \text{Liabilities} + \text{Equity} + (\text{Revenue} - \text{Expenses})$$

To keep this balanced, each account type behaves differently:
| Account Category | Normal Balance | Increased By | Decreased By | Examples |
| :--- | :---: | :---: | :---: | :--- |
| **Asset** | **Debit** | **Debit** | Credit | Cash in NatWest Vault, Accounts Receivable |
| **Expense** | **Debit** | **Debit** | Credit | Cloud Servers, Office Rent, Employee Salaries |
| **Liability** | **Credit** | **Credit** | Debit | Credit Card Debt, Commercial Bank Loans |
| **Equity** | **Credit** | **Credit** | Debit | Founder Capital, Retained Earnings |
| **Revenue** | **Credit** | **Credit** | Debit | Client Subscriptions, Loan Interest Earned |

**Simple Example:**
When your company pays £1,000 for AWS servers:
1. **Debit Expense** (£1,000 to Cloud Hosting): Increases your expenses.
2. **Credit Asset** (£1,000 to Operating Cash): Decreases your cash balance.
Both sides equal £1,000. Total books stay 100% in balance.

---

## 2. Why Did You Build This for NatWest?
> *"Most student projects build naive single-table transaction logs where balance updates are prone to race conditions or silent data corruption. In SmartLedger, I implemented a strict double-entry ledger container where each posting must balance down to the exact cent across debit and credit legs. If there is even a 1p imbalance, Pydantic validation rejects the payload before the database session opens. This guarantees atomic consistency across ledger accounts."*

---

## 3. Redis In-Memory Caching in Financial Systems

### What problem does it solve?
In high-frequency banking, calculating an account's balance by continuously querying:
```sql
SELECT SUM(amount) FROM transaction_legs WHERE account_id = 1 AND entry_type = 'DEBIT';
```
across millions of historical transactions causes high database CPU utilization and unacceptable read latencies.

### The SmartLedger Solution:
- Account balances and portfolio metrics are cached in **Redis** with a 60-second TTL.
- **Cache Invalidation:** The moment a new transaction is posted (`POST /api/v1/ledger`), we automatically invalidate the cache keys `smartledger:balance:*` and `smartledger:analytics:*`.
- **Fault-Tolerant Circuit Breaker:** If Redis is temporarily unreachable in a given environment, our backend catches the exception and computes directly from SQLite/PostgreSQL without failing client requests.

---

## 4. Statistical Anomaly & Fraud Risk Detection

### How it works:
NatWest actively monitors outgoing payments for suspicious spikes or duplicate disbursements.
In SmartLedger:
1. We compute the historical mean ($\mu$) and standard deviation ($\sigma$) of outgoing expense debits.
2. For each transaction, we calculate its **Z-score**:
   $$Z = \frac{\text{Amount} - \mu}{\sigma}$$
3. Any disbursement with $Z \ge 1.8$ is flagged with an anomaly banner showing the deviation multiplier and reasoning for immediate compliance review.

---

## 5. Top 3 Interview Questions & Model Answers

**Q1: How do you handle concurrency or race conditions during simultaneous transactions?**
> *"In SmartLedger, all transaction legs are wrapped inside a single atomic database transaction (`db.flush()` and `db.commit()`). If any leg fails or an account constraint is violated, the entire transaction rolls back via ACID guarantees. In high-concurrency production deployments with PostgreSQL, row-level pessimistic locking (`SELECT ... FOR UPDATE`) or ledger partitioning prevents balance divergence."*

**Q2: What is the difference between a Journal Entry and a Transaction Leg?**
> *"A `JournalEntry` is the parent transaction envelope (containing the reference ID, timestamp, and business description). A `TransactionLeg` is an individual debit or credit line item pointing to a specific account code. Every Journal Entry must contain at least two Transaction Legs whose amounts match."*

**Q3: Why use FastAPI for financial microservices?**
> *"FastAPI combines high async performance comparable to Node.js and Go with strict type safety through Pydantic. It automatically generates interactive OpenAPI/Swagger documentation (`/docs`), which enterprise banks like NatWest rely on for internal service contracts and developer portals."*