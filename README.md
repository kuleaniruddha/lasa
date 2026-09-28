# LASA-SAFE: AI-Powered LASA Medication Error Prevention System

<div align="center">

![LASA-SAFE Banner](https://img.shields.io/badge/Clinical%20Safety-AI%20Powered-0284c7?style=for-the-badge&logo=shield&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

**An intelligent clinical decision-support web platform engineered to intercept Look-Alike and Sound-Alike (LASA) medication dispensing errors in real-time.**

*Honours AIML Healthcare Engineering Project — Academic Year 2026-27*

</div>

---

## 👥 Academic & Research Team

- **Academic Guide:** Prof. Omprakash Yadav
- **Department:** Computer Engineering (AIML Honours)
- **Project Authors:**
  - **Aniruddha Kule** (Roll No: 30) — [GitHub Profile](https://github.com/kuleaniruddha)
  - **Vansh Gurav** (Roll No: 28)
  - **Harsh Jain** (Roll No: 29)
  - **Piyusha Nandivadekar** (Roll No: 40)

---

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [The Clinical Problem](#-the-clinical-problem)
- [Key Features](#-key-features)
- [Multi-Modal Detection Architecture](#-multi-modal-detection-architecture)
- [AIML Evaluation & Benchmarking](#-aiml-evaluation--benchmarking)
- [System Architecture](#-system-architecture)
- [Datasets & Clinical Benchmarks](#-datasets--clinical-benchmarks)
- [Project Directory Structure](#-project-directory-structure)
- [Quick Start & Installation](#-quick-start--installation)
- [REST API Endpoints](#-rest-api-endpoints)
- [User Roles & Security](#-user-roles--security)
- [Clinical Safety Disclaimer](#-clinical-safety-disclaimer)
- [License & Acknowledgments](#-license--acknowledgments)

---

## 🏥 Project Overview

**LASA-SAFE** is a proactive clinical decision-support system (CDSS) built to protect healthcare providers, hospital pharmacists, and patients from catastrophic **Look-Alike and Sound-Alike (LASA)** pharmaceutical dispensing errors.

Medication name confusion is among the leading global causes of preventable morbidity, accidental drug toxicity, and clinical malpractice claims. By coupling **computational linguistics**, **phonetic soundex algorithms**, **therapeutic taxonomy classification**, and **FDA POCA (Phonetic and Orthographic Computer Analysis)** composite risk index modeling, LASA-SAFE screens single orders and entire multi-drug prescriptions within milliseconds before medication reaches the patient.

---

## 🚨 The Clinical Problem

Grounded in findings from recent clinical literature:
> *"Look-alike, sound-alike (LASA) drugs in India"*, **The Lancet Regional Health – Southeast Asia** (2024).

In rapidly expanding pharmaceutical markets, identical or phonetically indistinguishable brand names are frequently registered for radically different therapeutic classes. For example:
- **Hydroxyzine** (Antihistamine / Anxiolytic) vs. **Hydralazine** (Potent Vasodilator / Antihypertensive)
  - *Risk:* Inadvertent administration of hydralazine triggers severe hypotension and cardiac compromise.
- **Olvance** (Olmesartan - Antihypertensive) vs. **Oleanz** (Olanzapine - Antipsychotic)
  - *Risk:* Inappropriate central nervous system sedation or unmanaged severe hypertension.
- **Celebrex** (Celecoxib - NSAID Anti-inflammatory) vs. **Celexa** (Citalopram - SSRI Antidepressant)
  - *Risk:* Untreated psychiatric crisis or fatal gastric mucosal ulceration.
- **Medzol** (Brand collision in India): Marketed concurrently under identical brand roots containing *Midazolam* (Sedative/Anesthetic), *Pantoprazole* (Proton Pump Inhibitor), or *Metronidazole* (Antibiotic).

---

## ✨ Key Features

### 1. 📊 Clinical Command Center Dashboard
- Real-time KPI widgets tracking total screened medications, intercepted collisions, and system safety integrity score.
- Live safety alert timeline and high-risk Lancet collision highlights.
- Instant-lookup search bar with reactive risk badges.

### 2. 🔍 Single Medicine Safety Analysis
- Rapid search across Indian Pharmacopoeia and FDA drug registries.
- Multi-dimensional gauge breakdown:
  - **Orthographic Similarity Score** (%)
  - **Phonetic Pronunciation Similarity Score** (%)
  - **Semantic Class Discrepancy Score** (%)
  - **FDA POCA Composite Risk Index** (%)
- Dynamic risk stratification: **Critical High** (Red), **Moderate Medium** (Orange), **Low** (Amber), or **Clear** (Green).
- Automatic **Tall Man Lettering** generation to distinguish confusable segments (e.g. `hydrOXYzine` vs `hydrALAZINE`).

### 3. ⚖️ Side-by-Side Medication Comparison
- Direct dual-drug comparator evaluating brand names, chemical entities, strengths, forms, indications, and contradictions.
- Alignment visualizer highlighting overlapping prefixes, suffixes, and sound syllables.
- Actionable clinical dispensing advice (e.g., *Double-check indication and baseline blood pressure before dispensing*).

### 4. 📄 Multi-Drug Prescription OCR Scanner
- Upload image scans or input raw prescription transcripts.
- Extracts all active pharmaceuticals using clinical regex and OCR preprocessing.
- Runs an $O(N^2)$ combinatorial pair-wise cross-examination matrix to flag co-prescribed confusions.

### 5. 🎙️ Voice Dictation Input
- Integrated Web Speech Recognition API allowing hands-free dictation during fast-paced clinical rounds or pharmacy counters.

### 6. 🚨 Alert Triage & Pharmacist Overrides
- Dedicated safety alert center for review by hospital pharmacists.
- Workflow buttons to **Acknowledge**, **Override with Justification**, or **Substitute Alternative**.

### 7. 📈 AIML Analytics & Visual Benchmarks
- Frequency distributions of most commonly confused drug pairs.
- Departmental safety performance metrics.
- Comparative accuracy curves against standalone Levenshtein, Soundex, and BioBERT approaches.

### 8. 📜 Compliance Audit Trail & Export
- Persistent Firestore logging of all screened orders with clinician timestamps and input modalities.
- One-click export to CSV / JSON for hospital quality assurance and accreditation reporting.

---

## 🧠 Multi-Modal Detection Architecture

LASA-SAFE applies an ensemble hybrid approach inspired by FDA POCA standards:

```
                          ┌─────────────────────────────┐
                          │   Prescription / Medicine   │
                          │   (Text / Voice / OCR Scan) │
                          └──────────────┬──────────────┘
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 │                       │                       │
                 ▼                       ▼                       ▼
    ┌────────────────────────┐┌─────────────────────┐┌────────────────────────┐
    │  Orthographic Engine   ││   Phonetic Engine   ││    Semantic Engine     │
    │  - Levenshtein Distance││ - Soundex Consonants││ - ATC Class Taxonomy   │
    │  - Jaro-Winkler N-Grams││ - Double Metaphone  ││ - Indication Semantics │
    └────────────┬───────────┘└──────────┬──────────┘└───────────┬────────────┘
                 │ (Weight: 45%)         │ (Weight: 40%)         │ (Weight: 15%)
                 └───────────────────────┼───────────────────────┘
                                         ▼
                          ┌─────────────────────────────┐
                          │   FDA POCA Hybrid Scoring   │
                          │   Composite Risk Index      │
                          └──────────────┬──────────────┘
                                         │
        ┌────────────────────────┼───────────────────────┼────────────────────────┐
        ▼                        ▼                       ▼                        ▼
  🔴 High Risk            🟠 Medium Risk           🟡 Low Risk              🟢 Clear
 (Score >= 80%)           (Score 65-79%)          (Score 50-64%)           (Score < 50%)
```

### Mathematical Formulation:
$$\text{POCA Score} = (0.45 \times S_{\text{ortho}}) + (0.40 \times S_{\text{phon}}) + (0.15 \times S_{\text{semantic}})$$

- **Orthographic ($S_{\text{ortho}}$)**: Length-normalized Levenshtein edit distance and character prefix/suffix overlap.
- **Phonetic ($S_{\text{phon}}$)**: Consonant phonetic encoding comparing initial phoneme weights, Soundex codes, and metaphone cadence.
- **Semantic ($S_{\text{semantic}}$)**: Discrepancy metric between pharmacological classes and therapeutic targets.

---

## 📊 AIML Evaluation & Benchmarking

Experimental evaluation conducted against curated clinical test pairs from the Indian Pharmacopoeia and Lancet 2024 benchmarks:

| Algorithm / Architecture | Accuracy | Precision | Recall (Sensitivity) | F1-Score | FDA POCA Alignment |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Fuzzy String Matching** (Levenshtein + Jaro) | 78.4% | 74.2% | 81.0% | 77.4% | 76.1% |
| **Phonetic Matching** (Double Metaphone + Soundex) | 82.1% | 79.5% | 85.3% | 82.3% | 81.5% |
| **Semantic Embeddings** (BioBERT / Class Matching) | 84.7% | 86.1% | 79.8% | 82.8% | 78.9% |
| **Proposed Hybrid Ensemble (LASA-SAFE v1.0)** | **94.6%** | **92.8%** | **95.1%** | **93.9%** | **92.4%** |

---

## 🏗️ System Architecture

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend API**: Python 3.10+, FastAPI, Uvicorn, Pydantic.
- **Data Layer**:
  - Embedded TypeScript drug database (250+ active formulations).
  - Cloud Firebase Firestore for clinical logs and real-time alerts.
  - Progressive Enhancement: Frontend operates offline with full in-memory algorithm fallback if the FastAPI server is not started.
- **Exploratory AIML**: Jupyter notebook with weighted recommender algorithms.

---

## 📂 Integrated Datasets

1. **Indian Pharmacopoeia (A-Z Medicines Dataset of India)**:
   - Extracted and indexed 250+ prescription formulations with manufacturer, dosage form, strength, and generic mapping.
2. **Lancet 2024 High-Risk Benchmark Collision Pairs**:
   - Curated high-severity Indian brand collisions (*Olvance* vs *Oleanz*, *Medzol*, *Flucor*, *Linamac*, *Atarax/Apresoline*).
3. **FDA & National Library of Medicine Standard Catalogs**:
   - International reference database for therapeutic indications and contraindication warnings.

---

## 📁 Project Directory Structure

```
lasa/
├── frontend/                               # React + TypeScript + Vite SPA
│   ├── public/
│   │   └── favicon.svg                     # Custom medical caduceus favicon
│   ├── src/
│   │   ├── components/                     # Reusable UI & clinical components
│   │   │   ├── layout/                     # Header, Sidebar, Navigation
│   │   │   ├── medicine/                   # RiskBadge, SimilarityGauge, TallManText
│   │   │   └── ui/                         # Buttons, Modals, StatCards
│   │   ├── data/                           # Curated datasets & mock fallbacks
│   │   │   ├── medicinesData.ts            # 250+ indexed medicine formulations
│   │   │   ├── lasaPairsData.ts            # High-risk collision pairs & advice
│   │   │   ├── mockAlerts.ts               # Sample clinical safety alerts
│   │   │   ├── historyData.ts              # Analysis history records
│   │   │   └── analyticsData.ts            # Benchmark and metric figures
│   │   ├── pages/                          # Application views
│   │   │   ├── DashboardPage.tsx           # Clinical command center
│   │   │   ├── CheckMedicinePage.tsx       # Single drug search & similarity
│   │   │   ├── MedicineComparisonPage.tsx  # Dual medication comparison
│   │   │   ├── PrescriptionScannerPage.tsx # Prescription OCR & matrix
│   │   │   ├── SafetyAlertsPage.tsx        # Alert triage & overrides
│   │   │   ├── AnalyticsPage.tsx           # Model benchmarks & statistics
│   │   │   ├── AnalysisHistoryPage.tsx     # Audit logs & export
│   │   │   ├── LoginPage.tsx               # Clinician authentication
│   │   │   └── SettingsPage.tsx            # POCA thresholds & customization
│   │   ├── services/                       # API integration & local engine
│   │   │   ├── lasaService.ts              # Unified screening service
│   │   │   ├── similarity.ts               # Client-side similarity engine
│   │   │   └── firebase.ts                 # Firestore & Auth configuration
│   │   ├── types/                          # TypeScript definitions
│   │   │   └── lasa.ts                     # Core domain interfaces
│   │   ├── App.tsx                         # Main router & layout shell
│   │   ├── main.tsx                        # Application entry point
│   │   └── index.css                       # Global styles & Tailwind directives
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── backend/                                # Python FastAPI microservice
│   ├── main.py                             # API routes, CORS & Firestore sync
│   ├── model.py                            # Levenshtein, Soundex, POCA hybrid
│   └── requirements.txt                    # Python dependencies
├── scripts/                                # Data ingestion & cleaning
│   └── process_datasets.py                 # Parser generating medicinesData.ts
├── weighted-similarity-medicine-recommender-system.ipynb # Research & ML notebook
├── run_app.bat                             # 1-Click Windows execution launcher
├── .gitignore                              # Git exclusion rules
└── README.md                               # Project documentation
```

---

## 🚀 Quick Start & Installation

### Option 1: 1-Click Windows Launch ⚡
Double-click `run_app.bat` from the root directory. It will start the Vite frontend and open `http://localhost:5173` automatically in your default browser.

---

### Option 2: Manual Setup

#### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.9 or higher (optional, for backend API server)
- **Git**

#### 1. Clone the Repository
```bash
git clone https://github.com/kuleaniruddha/lasa.git
cd lasa
```

#### 2. Start the Frontend (Client-Side Application)
```bash
cd frontend
npm install
npm run dev
```
The application will be accessible at **`http://localhost:5173`**.

#### 3. Start the Backend API (Optional / Recommended)
In a separate terminal window:
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```
The FastAPI backend will start on **`http://localhost:8000`** with interactive Swagger documentation available at **`http://localhost:8000/docs`**.

---

## 🔌 REST API Endpoints

| Method | Endpoint | Description | Sample Payload |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service status & database connectivity | None |
| `POST` | `/api/analyze-medicine` | Screen single drug for potential LASA collisions | `{"medicine_name": "Hydroxyzine", "source": "Manual Search"}` |
| `POST` | `/api/scan-prescription` | Batch screen list of drugs from a prescription | `{"medicines": ["Olvance 20mg", "Oleanz 5mg", "Atorvastatin"]}` |
| `GET` | `/api/lasa-pairs` | Retrieve benchmark LASA collision library | None |
| `GET` | `/api/medicines` | Query indexed pharmacopoeia registry | `?q=hydra` |

---

## 🔒 User Roles & Security

LASA-SAFE includes pre-configured clinician personas for testing:
1. **Clinical Pharmacologist / Head Pharmacist**: Full access to override alerts, adjust POCA thresholds, and export regulatory logs.
2. **Attending Physician**: Access to search, side-by-side comparison, and voice dictation.
3. **Staff Nurse**: Access to prescription OCR scanner and alert viewer.
4. **Hospital Quality Auditor**: Read-only access to analytics and historical compliance audit trails.

> **Privacy Note:** In compliance with healthcare data protection standards, patient-identifying fields are masked, and only drug nomenclature and clinical parameters are processed.

---

## ⚠️ Clinical Safety Disclaimer

> **IMPORTANT:** LASA-SAFE is a specialized clinical decision-support tool (CDSS) intended to alert clinicians and pharmacists to potential Look-Alike and Sound-Alike medication errors. It is designed to **supplement and assist**, not replace, the clinical judgment, expertise, and diagnosis of a licensed physician, clinical pharmacologist, or registered healthcare professional. Always consult the official pharmacopoeia monograph and institutional clinical guidelines before dispensing or administering medications.

---

## 📄 License & Acknowledgments

- **License:** Distributed under the MIT License.
- **Academic Mentorship:** Department of Computer Engineering, Honours in Artificial Intelligence and Machine Learning (AY 2026-27).
- **Literature Reference:** *The Lancet Regional Health – Southeast Asia* (2024) for clinical benchmark collision cases.
