import pytest
import json
from backend.app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    """Test /health endpoint."""
    res = client.get('/health')
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["status"] == "HEALTHY"

def test_lasa_check_celebrex(client):
    """Test POST /api/check for 'Celebrex' identifying 'Cerebyx' with score >= 0.7."""
    res = client.post('/api/check', json={"drug_name": "Celebrex"})
    assert res.status_code == 200
    res_json = res.get_json()
    assert res_json["success"] is True
    
    data = res_json["data"]
    assert data["input_drug"] == "Celebrex"
    assert data["top_match"] == "Cerebyx"
    assert data["similarity_score"] >= 0.7
    assert data["risk_level"] in ["High", "HIGH"]

def test_lasa_check_losec(client):
    """Test POST /api/check for 'Losec' identifying 'Lasix'."""
    res = client.post('/api/check', json={"drug_name": "Losec"})
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert data["top_match"] == "Lasix"

def test_get_drugs(client):
    """Test GET /api/drugs."""
    res = client.get('/api/drugs')
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
    assert len(data["data"]) > 0

def test_public_stats(client):
    """Test GET /api/stats."""
    res = client.get('/api/stats')
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "total_drugs_cataloged" in data["data"]

def test_risk_override(client):
    """Test POST /api/override."""
    payload = {
        "drug1": "Celebrex",
        "drug2": "Cerebyx",
        "reason": "Verified dosage form oral capsule vs intravenous fosphenytoin injection.",
        "clinician_name": "Dr. Sarah Jenkins",
        "clinician_license": "PHARM-99120"
    }
    res = client.post('/api/override', json=payload)
    assert res.status_code == 201
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["drug1"] == "Celebrex"

def test_analyze_medicine_endpoint(client):
    """Test POST /api/analyze-medicine for Hydroxyzine identifying Hydralazine."""
    res = client.post('/api/analyze-medicine', json={"medicine_name": "Hydroxyzine"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["queryMedicine"]["name"] == "Hydroxyzine"
    assert data["confusedPartner"] is not None
    assert "Hydralazine" in data["confusedPartner"]["name"]
    assert data["hasRisk"] is True
    assert data["overallRiskScore"] >= 50
    assert "tallManQuery" in data
    assert "similarityBreakdown" in data
    assert "ensembleProbability" in data

def test_compare_endpoint(client):
    """Test GET /api/compare for Hydroxyzine and Hydralazine."""
    res = client.get('/api/compare?medA=Hydroxyzine&medB=Hydralazine')
    assert res.status_code == 200
    data = res.get_json()
    assert data["medA"] == "Hydroxyzine"
    assert data["medB"] == "Hydralazine"
    assert data["overallRiskScore"] >= 50
    assert "tallA" in data
    assert "tallB" in data

def test_scan_prescription_endpoint(client):
    """Test POST /api/scan-prescription for multi-drug list."""
    payload = {"medicines": ["Hydroxyzine", "Hydralazine", "Paracetamol"]}
    res = client.post('/api/scan-prescription', json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert data["totalDetected"] == 3
    assert data["potentialConflicts"] >= 1

