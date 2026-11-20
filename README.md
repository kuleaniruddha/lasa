# LASA-GUARD: Clinical Decision Support Platform

An enterprise-grade, AI-powered healthcare surveillance system designed to intercept **Look-Alike Sound-Alike (LASA)** medication dispensing errors in real-time.

Integrates a modern 9-page clinical portal with multi-metric NLP, Machine Learning Ensembles, and Big Data Stream Analytics.

---

## Key Features

- **Clinical UI/UX & Workflow Portal**:
  - 9 integrated clinical views: Dashboard, Check Medicine, Dual-Drug Comparator, Prescription Scanner, Search Formulary, Analytics & BDA Stream, Screened Orders & Overrides Audit, Settings, Login.
  - Interactive Tall Man lettering generation.
  - Multi-drug prescription OCR & combinatorial safety screening.
  - Web Speech API voice dictation for hands-free clinical input.
  - 1-Click offline demo bypass for instant access without cloud credentials.

- **Multi-Engine Intelligence & Surveillance**:
  - **FDA POCA Composite Scoring**: Combines orthographic spelling, phonetic pronunciation, and pharmacological therapeutic classification.
  - **6-Metric NLP Matrix**: Levenshtein Distance, BiSim (Jaccard character bigrams), Soundex, Sorensen-Dice, Metaphone, and Cosine BERT embeddings.
  - **ML Classification Ensembles**: Soft-voting classifier combining Random Forest, XGBoost / GradientBoosting, and Logistic Regression with KMeans TF-IDF clustering.
  - **Big Data Analytics (BDA)**:
    - **Bloom Filter** (20,000 bits) for sub-millisecond formulary membership pre-checks.
    - **DGIM Algorithm** for sliding-window bitstream high-risk event frequency tracking.
    - **Flajolet-Martin Algorithm** for cardinality estimation of unique screened drugs.
    - **Kafka Producer** for hospital event stream publishing.
  - **Clinician Override System**:
    - FDA-grade override modal requiring clinical justification, severity confirmation, and digital signature.
    - Audit trail logging and CSV export.
  - **Merged Catalog**: 761 drugs and 123 LASA collision pairs combining ISMP international standards with the Indian Pharmacopoeia.

---

## Directory Structure

```
lasa-unified/
├── backend/
│   ├── api/                 # Flask Blueprints (auth, check, drug, admin, stats)
│   ├── bda/                 # Big Data Analytics (BloomFilter, DGIM, Flajolet-Martin, Kafka)
│   ├── ml/                  # ML training and evaluation routines
│   ├── models/              # Data schemas and MongoDB models
│   ├── models_saved/        # Pre-trained models (.pkl, .json metrics)
│   ├── scripts/             # Retraining scripts
│   ├── services/            # POCA, NLP, ML, Drug, Audit, and BDA services
│   ├── utils/               # Text preprocessing and security helpers
│   ├── app.py               # Main Flask application entrypoint
│   ├── config.py            # Environment configuration
│   ├── extensions.py        # JWT and CORS extensions with fallbacks
│   └── requirements.txt     # Python dependencies
├── data/
│   ├── drugs.csv            # 761 verified pharmaceutical drugs
│   ├── lasa_pairs.csv       # 123 verified LASA confusable pairs
│   └── seed_users.json      # Default clinician accounts
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components, layout, navbar, modals (OverrideModal)
│   │   ├── pages/           # 9 full clinical portal pages
│   │   ├── services/        # API communication, multi-port detector, similarity fallbacks
│   │   ├── types/           # Unified TypeScript definitions (LASA, NLP, BDA, Overrides)
│   │   ├── App.tsx          # Root router with 1-click offline login support
│   │   └── index.css        # TailwindCSS design system
│   ├── package.json         # React 19 + TypeScript + Vite + TailwindCSS
│   └── vite.config.ts       # Vite build configuration with proxy
├── notebooks/               # Research and data analysis notebooks
├── scripts/                 # Dataset merger and utility scripts
├── tests/                   # Automated API and algorithm unit tests
├── docker-compose.yml       # Container orchestration (Flask, Mongo, Kafka, Zookeeper)
├── MERGE_STATUS.md          # Comprehensive merge status and step-by-step roadmap
├── run_all.bat              # 1-Click launcher for both Backend & Frontend
├── run_unified_backend.bat  # Launch Flask backend on port 5000
└── run_unified_frontend.bat # Launch Vite frontend on port 5173
```

---

## Quickstart

### 1. Launch Everything with 1 Click
Double-click:
```cmd
run_all.bat
```
- **Backend API**: `http://localhost:5000`
- **Clinical Frontend**: `http://localhost:5173`

### 2. Manual Startup

#### Backend
```powershell
cd "c:\Lasa Project\lasa-unified"
.\run_unified_backend.bat
```

#### Frontend
```powershell
cd "c:\Lasa Project\lasa-unified\frontend"
npm install
npm run dev
```

---

## Default Clinician Credentials

- **1-Click Login:** Click **"Demo Bypass / Offline Mode"** on the login page to enter immediately.
- **Form Login:**
  - **Email:** `clinician@lasaguard.health`
  - **Password:** `ClinicalPassword2026!`
  - **Role:** Attending Clinician / Pharmacist
- **Administrator / Safety Director Login:**
  - **Email:** `safety.director@lasaguard.health`
  - **Password:** `SafetyDirector2026!`
  - **Role:** Chief Pharmacy Officer / Patient Safety Director

---

## Architecture & Governance
- **Platform:** LASA-GUARD Clinical Decision Support System (CDSS)
- **Standards Compliance:** FDA POCA Guidance, ISMP Confused Drug Names List, WHO International Nonproprietary Names (INN)
- **Deployment:** Enterprise Healthcare On-Premise / Clinical Cloud (HIPAA & FHIR Compatible)
