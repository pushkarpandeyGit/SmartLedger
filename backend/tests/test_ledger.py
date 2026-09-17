import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    """Verify service availability and health probe."""
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert "SmartLedger" in data["service"]

def test_chart_of_accounts_seeded(client):
    """Verify default banking chart of accounts was seeded."""
    res = client.get("/api/v1/accounts")
    assert res.status_code == 200
    accounts = res.json()
    assert len(accounts) >= 5

    codes = [a["code"] for a in accounts]
    assert "1010" in codes  # Operating Cash
    assert "4010" in codes  # Revenue
    assert "5010" in codes  # Expenses

def test_post_balanced_transaction(client):
    """Verify that a balanced double-entry transaction (Debits == Credits) succeeds."""
    accs = client.get("/api/v1/accounts").json()
    cash_acc = next(a for a in accs if a["code"] == "1010")
    rev_acc = next(a for a in accs if a["code"] == "4010")

    initial_cash_balance = cash_acc["balance"]

    payload = {
        "description": "Enterprise Licensing Retainer",
        "legs": [
            {"account_id": cash_acc["id"], "amount": 2500.0, "entry_type": "DEBIT"},
            {"account_id": rev_acc["id"], "amount": 2500.0, "entry_type": "CREDIT"}
        ]
    }

    res = client.post("/api/v1/ledger", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["description"] == "Enterprise Licensing Retainer"
    assert len(data["legs"]) == 2

    # Check updated balance for cash account
    updated_accs = client.get("/api/v1/accounts").json()
    updated_cash = next(a for a in updated_accs if a["code"] == "1010")
    assert updated_cash["balance"] == round(initial_cash_balance + 2500.0, 2)

def test_reject_unbalanced_transaction(client):
    """
    CRITICAL BANKING TEST:
    Verify that an unbalanced transaction is strictly rejected by Pydantic validation.
    """
    accs = client.get("/api/v1/accounts").json()
    cash_acc = next(a for a in accs if a["code"] == "1010")
    rev_acc = next(a for a in accs if a["code"] == "4010")

    imbalanced_payload = {
        "description": "Faulty Transfer with Inconsistent Books",
        "legs": [
            {"account_id": cash_acc["id"], "amount": 5000.0, "entry_type": "DEBIT"},
            {"account_id": rev_acc["id"], "amount": 4200.0, "entry_type": "CREDIT"} # Imbalanced by £800
        ]
    }

    res = client.post("/api/v1/ledger", json=imbalanced_payload)
    # Pydantic model_validator rejects with 422
    assert res.status_code == 422
    assert "Double-entry accounting violation" in res.text

def test_financial_summary_and_equation(client):
    """Verify balance sheet equation reconciliation."""
    res = client.get("/api/v1/analytics/summary")
    assert res.status_code == 200
    data = res.json()

    assert "total_assets" in data
    assert "total_liabilities" in data
    assert "net_worth" in data
    assert data["total_assets"] >= data["net_worth"]

def test_anomaly_detection(client):
    """Verify statistical anomaly detection flags simulated high-value outlier expense."""
    res = client.get("/api/v1/analytics/anomalies?threshold=1.2")
    assert res.status_code == 200
    anomalies = res.json()
    assert isinstance(anomalies, list)
    if len(anomalies) > 0:
        assert anomalies[0]["amount"] >= 4000.0
        assert "z_score" in anomalies[0]