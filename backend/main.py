"""
LASA-SAFE: FastAPI Server
Honours AIML Healthcare Project AY 2026-27
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import datetime
import firebase_admin
from firebase_admin import credentials, firestore, auth

from model import (
    orthographic_similarity,
    phonetic_similarity,
    calculate_poca_hybrid,
    classify_risk
)

app = FastAPI(
    title="LASA-SAFE API",
    description="AI-Powered Look-Alike & Sound-Alike Medication Safety Intelligence API",
    version="1.0.0"
)

# Enable CORS for local React/Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firebase Admin & Firestore
db = None
try:
    cred_path = os.path.join(os.path.dirname(__file__), "firebase_credentials.json")
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_app = firebase_admin.initialize_app(cred)
        db = firestore.client()
        print(f"Connected to Firebase Firestore for project: {firebase_app.project_id}")
except Exception as e:
    print(f"Firebase initialization notice: {e}")

class AnalyzeRequest(BaseModel):
    medicine_name: str
    source: Optional[str] = "Manual Search"

class ScanRequest(BaseModel):
    medicines: List[str]

@app.get("/api/health")
def health_check():
    db_status = "connected" if db is not None else "offline"
    return {
        "status": "healthy",
        "ai_engine": "online",
        "database": db_status,
        "firebase_project": "lasa-8b8a8",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

@app.post("/api/analyze-medicine")
def analyze_medicine(payload: AnalyzeRequest):
    name = payload.medicine_name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Medicine name required")

    # Sample known high-risk match (e.g. Hydroxyzine vs Hydralazine)
    partner = "Hydralazine" if "hydroxy" in name.lower() else "Hydroxyzine" if "hydral" in name.lower() else "Similar Alternative"
    ortho = orthographic_similarity(name, partner)
    phon = phonetic_similarity(name, partner)
    sem = 75.0
    overall = calculate_poca_hybrid(ortho, phon, sem)
    risk = classify_risk(overall)

    return {
        "queryMedicine": {
            "name": name,
            "genericName": name,
            "category": "Prescription Therapeutic",
            "therapeuticPurpose": "Clinical indication",
            "dosageForm": "Tablet",
            "strength": "Standard",
            "manufacturer": "Pharmacopoeia Database"
        },
        "confusedPartner": {
            "name": partner,
            "genericName": partner,
            "category": "Prescription Therapeutic",
            "therapeuticPurpose": "Clinical indication",
            "dosageForm": "Tablet",
            "strength": "Standard",
            "manufacturer": "Pharmacopoeia Database"
        } if overall >= 50 else None,
        "spellingSimilarity": ortho,
        "phoneticSimilarity": phon,
        "semanticSimilarity": sem,
        "overallRiskScore": overall,
        "riskLevel": risk,
        "hasRisk": overall >= 50,
        "flagReasons": [
            f"Orthographic similarity score of {ortho}%",
            f"Phonetic sound-alike match of {phon}%"
        ],
        "clinicalAdvice": "Please verify the intended medicine, indication, and strength before proceeding.",
        "tallManQuery": name.upper() if len(name) < 6 else name,
        "tallManPartner": partner.upper() if len(partner) < 6 else partner,
        "timestamp": datetime.datetime.now().strftime("%H:%M")
    }

@app.get("/api/compare")
def compare_medicines(medA: str = Query(...), medB: str = Query(...)):
    ortho = orthographic_similarity(medA, medB)
    phon = phonetic_similarity(medA, medB)
    sem = 70.0
    overall = calculate_poca_hybrid(ortho, phon, sem)
    risk = classify_risk(overall)

    return {
        "medA": medA,
        "medB": medB,
        "spellingSimilarity": ortho,
        "phoneticSimilarity": phon,
        "semanticSimilarity": sem,
        "overallRiskScore": overall,
        "riskLevel": risk,
        "safetyMessage": "Verify intended medicine and relevant clinical context before proceeding."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
