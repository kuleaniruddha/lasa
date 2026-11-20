# LASA-GUARD: Clinical Decision Support & Medication Error Prevention Platform

[![Repository](https://img.shields.io/badge/GitHub-kuleaniruddha%2Flasa-blue?logo=github)](https://github.com/kuleaniruddha/lasa)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Flask](https://img.shields.io/badge/Flask-Backend-black?logo=flask)](https://flask.palletsprojects.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![FDA POCA](https://img.shields.io/badge/Standards-FDA%20POCA%20%7C%20ISMP-green)](#multi-engine-intelligence--surveillance)

An enterprise-grade, AI-powered healthcare surveillance and clinical decision support system (CDSS) designed to intercept **Look-Alike Sound-Alike (LASA)** medication dispensing hazards in real time. 

The platform integrates a modern, dark-mode compatible 9-page clinical portal with multi-metric NLP string/phonetic distance algorithms, Machine Learning Soft-Voting Ensembles (Random Forest, XGBoost, LSTM), and real-time Big Data Stream Processing (Bloom Filters, DGIM sliding windows, Flajolet-Martin cardinality estimation).

---

## Table of Contents

- [Key Features](#key-features)
- [Multi-Engine Architecture](#multi-engine-architecture)
- [Big Data Analytics (BDA) Stream Engine](#big-data-analytics-bda-stream-engine)
- [Clinical UI/UX & Portal Modules](#clinical-uiux--portal-modules)
- [Project Directory Structure](#project-directory-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1-Click Quickstart (Windows)](#1-click-quickstart-windows)
  - [Manual Setup](#manual-setup)
  - [Docker Compose Deployment](#docker-compose-deployment)
- [Authentication & Clinical Roles](#authentication--clinical-roles)
- [API Reference](#api-reference)
- [Automated Testing](#automated-testing)
- [Clinical Standards & Evidence Base](#clinical-standards--evidence-base)

---

## Key Features

- **Clinical Portal & Workflow Management**:
  - 9 integrated clinical views with full **Dark Mode / Light Mode** theme persistence.
  - Interactive **Tall Man Lettering** highlighting phonetic and orthographic differentiators (e.g., *hydrOXYzine* vs. *hydrALAZINE*).
  - Multi-drug **Prescription OCR Scanner** with automated text extraction and pairwise safety screening.
  - **Web Speech API Voice Dictation** for hands-free clinical inputs in fast-paced pharmacy and hospital environments.
  - **1-Click Offline Demo Bypass** for instant simulation without cloud or external database dependencies.

- **FDA-Grade Clinician Override System**:
  - Modal requiring explicit clinical rationale, risk severity acknowledgment, and clinician digital signature before overriding high-risk alerts.
  - Tamper-evident audit logging with CSV export for hospital compliance reviews.

- **Curated Drug Catalog**:
  - **761 verified drug formulations** and **123 confirmed LASA collision pairs** combining the **Indian Pharmacopoeia (A-Z Medicines Dataset)** with **ISMP International Standards** and **Lancet 2024 collision benchmarks**.

---

## Multi-Engine Architecture

LASA-GUARD utilizes a multi-tiered evaluation pipeline that analyzes medication pairs across orthographic, phonetic, semantic, and pharmacological dimensions:

```
[Prescription / Medication Input]
               │
               ▼
   [Bloom Filter Pre-Screening] (O(1) Formulary Verification)
               │
               ├───────────────────────────────────────────────┐
               ▼                                               ▼
      [6-Metric NLP Matrix]                        [Deep Semantic Similarity]
   • Levenshtein Distance (Edit)                 • Bio_ClinicalBERT Cosine
   • BiSim (Jaccard Bigrams)                     • Pharmacological Drug Class
   • Soundex Hashing (Acoustic)                  • Therapeutic Indication Overlap
   • Sorensen-Dice Index
   • Double Metaphone Cadence
               │                                               │
               └───────────────────────┬───────────────────────┘
                                       ▼
                       [Soft-Voting Ensemble Model]
                        • Random Forest Classifier
                        • XGBoost Gradient Boosting
                        • Neural Network / LSTM
                                       │
                                       ▼
                         [FDA POCA Composite Score]
                       Low / Medium / High Risk Tier
                                       │
                                       ▼
             [Clinical Alert / Interception / Override Modal]
```

### 1. 6-Metric NLP Matrix
- **Levenshtein Distance**: Edit distance measuring character insertions, deletions, and substitutions.
- **BiSim (Jaccard Character Bigrams)**: Segmental similarity measuring shared letter pairs.
- **Soundex**: Standard phonetic coding targeting consonant acoustical collisions.
- **Sorensen-Dice**: Harmonic mean of bigram overlap emphasizing shared roots.
- **Double Metaphone**: Secondary phonetic algorithm accounting for irregular medical pronunciations.
- **Bio_ClinicalBERT**: Cosine similarity between dense clinical language embeddings.

### 2. Machine Learning Classification Ensembles
- Pre-trained models (`models_saved/random_forest.pkl`, `models_saved/xgboost.pkl`, `models_saved/ensemble.pkl`) soft-voting on extracted linguistic and pharmacological features.
- Performance: **97.8% Accuracy**, **100% Precision**, **95.7% Recall**, and **1.000 ROC-AUC** on verified test sets.

---

## Big Data Analytics (BDA) Stream Engine

For high-throughput hospital dispensing networks, LASA-GUARD implements three zero-latency stream algorithms:

| Algorithm | Implementation | Purpose & Capacity |
|---|---|---|
| **Bloom Filter** | 20,000-bit array with Kirsch-Mitzenmacher dual hashing ($k=7$) | Sub-millisecond $O(1)$ membership checks with $<0.1\%$ false positive rate and zero false negatives. |
| **DGIM Algorithm** | Logarithmic bucketed sliding window counter | Tracks frequency of high-risk dispensing collisions over sliding bitstreams (default: 60-minute window) in $O(\log^2 N)$ memory. |
| **Flajolet-Martin** | Trailing-zero bitmap register with hash sampling | Distinct count cardinality estimation of queried pharmaceutical compounds in real-time streams. |
| **Kafka Integration** | Event Producer & Consumer (`lasa-events` topic) | Real-time event pub/sub for enterprise hospital HIS/EHR backbones. |

---

## Clinical UI/UX & Portal Modules

The frontend is organized into 9 dedicated clinical views:

1. **Dashboard (`/dashboard`)**: System telemetry, real-time alert feed, active surveillance metrics, and quick screening widget.
2. **Check Medicine (`/check-medicine`)**: Single-drug intake analyzer comparing against the 761-drug formulary with voice input.
3. **Dual-Drug Comparator (`/medicine-comparison`)**: Side-by-side comparative analysis of two medications displaying the full 6-metric NLP vector.
4. **Prescription Scanner (`/scan-prescription`)**: Multi-medication OCR upload (image/camera) extracting drug lists and executing $O(N^2)$ pairwise collision scans.
5. **Safety Alerts & Incident Feed (`/safety-alerts`)**: Filterable high-risk alert logs with one-click override action.
6. **Analysis History (`/analysis-history`)**: Complete searchable log of historical screenings with CSV report export.
7. **Analytics & BDA Stream Center (`/analytics`)**: Big Data algorithm monitors (Bloom, DGIM, Flajolet-Martin) and ML performance benchmarks.
8. **Settings & Preferences (`/settings`)**: Sensitivity threshold configuration, theme switching, and formulary updates.
9. **Authentication (`/login`)**: Role-based access control supporting Clinician, Pharmacist, and Safety Director personas with demo bypass.

---

## Project Directory Structure

```
lasa/
├── backend/
│   ├── api/                 # Flask Blueprints (auth, check, drug, admin, stats)
│   ├── bda/                 # Big Data Analytics (BloomFilter, DGIM, Flajolet-Martin, Kafka)
│   ├── ml/                  # ML feature extraction, training, and clustering routines
│   ├── models/              # Data schemas (Drug, Override, User, Interaction)
│   ├── models_saved/        # Pre-trained models (.pkl, .npy, metrics.json)
│   ├── scripts/             # Model retraining and seeding scripts
│   ├── services/            # Core services: POCA, NLP, ML, Drug, Audit, and BDA
│   ├── utils/               # Sanitizers, validation, and security decorators
│   ├── app.py               # Flask application factory
│   ├── config.py            # Environment configurations
│   └── extensions.py        # JWT and CORS handlers with graceful fallbacks
├── data/
│   ├── drugs.csv            # 761 verified pharmaceutical drugs
│   ├── lasa_pairs.csv       # 123 verified LASA collision pairs
│   ├── drug_interactions.csv# Drug-drug interaction database
│   └── seed_users.json      # Pre-configured clinical roles and credentials
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components, layout, modals (OverrideModal, TallMan)
│   │   ├── context/         # ThemeContext (Dark/Light) and RoleContext
│   │   ├── pages/           # 9 complete clinical views + Landing page
│   │   ├── services/        # API client, OCR service, fallback similarity calculators
│   │   ├── types/           # Unified TypeScript interfaces
│   │   ├── App.tsx          # Router configuration
│   │   └── index.css        # Tailwind design tokens and dark mode styles
│   ├── package.json         # React 19 + TypeScript + Vite + TailwindCSS
│   └── vite.config.ts       # Vite proxy & build settings
├── notebooks/               # Research notebooks and exploratory analysis
├── scripts/                 # Dataset processing and merge utilities
├── tests/                   # Automated API, NLP, ML, and BDA test suite
├── docker-compose.yml       # Microservice orchestration (Flask, Mongo, Redis, Kafka)
├── Dockerfile               # Production container image
├── run_all.bat              # 1-Click launcher for Backend + Frontend
├── run_unified_backend.bat  # Launch Flask backend on port 5000
└── run_unified_frontend.bat # Launch Vite frontend on port 5173
```

---

## Getting Started

### Prerequisites

- **Python**: Version 3.10+ installed
- **Node.js**: Version 18+ (v20 or v22 recommended) with `npm`
- **Git**: Installed and configured

---

### 1-Click Quickstart (Windows)

Simply double-click `run_all.bat` or run:
```cmd
run_all.bat
```
This launches:
- **Backend API**: `http://localhost:5000` (Health Check: `http://localhost:5000/health`)
- **Clinical Frontend**: `http://localhost:5173`

---

### Manual Setup

#### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/kuleaniruddha/lasa.git
cd lasa

# (Optional) Create virtual environment
python -m venv venv
venv\Scripts\activate  # On Linux/macOS: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend
python -m backend.app
```
*The backend automatically falls back to in-memory caching and session storage if Redis or MongoDB are not running.*

#### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

### Docker Compose Deployment

To deploy the full containerized stack including MongoDB, Redis, Kafka, and Zookeeper:
```bash
docker-compose up -d
```

---

## Authentication & Clinical Roles

| Role | Default Email | Password | Permissions |
|---|---|---|---|
| **Attending Clinician / Pharmacist** | `clinician@lasaguard.health` | `ClinicalPassword2026!` | Screen drugs, compare pairs, run OCR, execute overrides |
| **Chief Pharmacy Officer / Safety Director** | `safety.director@lasaguard.health` | `SafetyDirector2026!` | Access full audit trail, export CSV logs, retrain ML models |
| **Demo Offline Bypass** | *Click "Demo Bypass / Offline Mode" on the login screen* | *None required* | Immediate full access for demonstrations and evaluation |

---

## API Reference

The Flask backend exposes the following primary endpoints under `/api`:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` or `/api/health` | Service health status and AI engine telemetry |
| `POST` | `/api/check` | Analyze a medication against the full formulary for collisions |
| `GET` | `/api/compare?medA=...&medB=...` | Direct pairwise evaluation of two drugs with 6-metric breakdown |
| `GET` | `/api/drugs` | Paginated search of the 761-drug pharmaceutical formulary |
| `GET` | `/api/bda/metrics` | Real-time statistics from Bloom Filter, DGIM, and Flajolet-Martin engines |
| `POST` | `/api/overrides` | Submit a signed clinician override justification |
| `GET` | `/api/admin/overrides` | Retrieve logged override audit trail |
| `POST` | `/api/admin/retrain` | Trigger retraining pipeline for ML classifiers |

---

## Automated Testing

Run the test suite using `pytest`:
```bash
python -m pytest tests/ -v
```
Test modules include:
- `tests/test_api.py`: Endpoint health, check, and compare route verification.
- `tests/test_nlp.py`: Orthographic distance and phonetic similarity accuracy.
- `tests/test_ml.py`: Classification pipeline and ensemble probability checks.
- `tests/test_bda.py`: Bloom filter false-positive rates, DGIM sliding windows, and Flajolet-Martin estimators.

---

## Clinical Standards & Evidence Base

- **FDA POCA**: Phonetic and Orthographic Computer Analysis guidance for proprietary drug name evaluation.
- **ISMP Standards**: Institute for Safe Medication Practices List of Confused Drug Names and Tall Man Lettering Guidelines.
- **Lancet Regional Health (2024)**: *Look-alike, sound-alike (LASA) drugs in India: an urgent call for regulatory action and clinician awareness*.
- **WHO INN**: International Nonproprietary Names stem guidelines for pharmacological grouping.

---

## License

This project is developed for clinical decision support and healthcare research. Consult institutional medical governance before deploying in clinical dispensing environments.
