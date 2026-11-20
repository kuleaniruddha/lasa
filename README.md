# LASA-GUARD: Artificial Intelligence & Machine Learning in Healthcare (Honours Project)

[![Repository](https://img.shields.io/badge/GitHub-kuleaniruddha%2Flasa-blue?logo=github)](https://github.com/kuleaniruddha/lasa)
[![Domain](https://img.shields.io/badge/Domain-AI%20%26%20Machine%20Learning%20in%20Healthcare-emerald)](#academic-project-overview)
[![Ensemble F1-Score](https://img.shields.io/badge/Ensemble%20F1--Score-97.8%25-brightgreen)](#ml-models--performance-benchmarks)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Flask](https://img.shields.io/badge/Flask-AI%20Backend-black?logo=flask)](https://flask.palletsprojects.com/)
[![FDA POCA](https://img.shields.io/badge/Standards-FDA%20POCA%20%7C%20ISMP-purple)](#clinical-guidelines--regulatory-alignment)

An AI-driven **Clinical Decision Support System (CDSS)** designed to detect and intercept **Look-Alike Sound-Alike (LASA)** medication dispensing hazards in real time. 

Developed as an **Honours Project in Artificial Intelligence & Machine Learning (AIML) in Healthcare**, this platform combines **multi-metric clinical NLP string/phonetic distance representations**, **Bio_ClinicalBERT Transformer semantic embeddings**, and **Soft-Voting Machine Learning Classification Ensembles** (Random Forest, XGBoost, and Neural Networks) to safeguard patient medication orders.

---

## Academic Project Overview

- **Project Title:** LASA-GUARD: Clinical Decision Support Platform for Medication Error Prevention
- **Discipline / Specialization:** Artificial Intelligence & Machine Learning (AIML) Honours in Healthcare Informatics
- **Clinical Challenge:** Dispensing errors resulting from Look-Alike Sound-Alike drug names represent up to 25% of all reported pharmacy medication incidents (ISMP / WHO). Distinguishing visually or phonetically identical compounds that have drastically different therapeutic indications is critical to patient safety.
- **Core AI Innovation:** Multi-modal feature fusion integrating orthographic edit distance, acoustic phonetic hashing, transformer clinical language representations (Bio_ClinicalBERT), and supervised ensemble classifiers calibrated against FDA POCA regulatory metrics.

---

## Table of Contents

- [Core AI/ML Architecture](#core-aiml-architecture)
- [6-Metric Clinical NLP Matrix](#6-metric-clinical-nlp-matrix)
- [Machine Learning Ensembles & Performance](#machine-learning-ensembles--performance)
- [Clinical Decision Support Modules](#clinical-decision-support-modules)
- [Formulary Dataset & Collision Pairs](#formulary-dataset--collision-pairs)
- [System Architecture & Directory Structure](#system-architecture--directory-structure)
- [Quickstart Guide](#quickstart-guide)
  - [1-Click Launch (Windows)](#1-click-launch-windows)
  - [Manual Execution](#manual-execution)
- [Clinical Evaluation & Benchmarks](#clinical-evaluation--benchmarks)
- [Clinical Guidelines & Regulatory Alignment](#clinical-guidelines--regulatory-alignment)

---

## Core AI/ML Architecture

The core decision pipeline processes incoming drug names through a multi-stage feature extraction, semantic embedding, and ensemble classification stack:

```
                  [Prescription / Physician Order]
                                 │
                                 ▼
                   [Input Sanitization & Normalization]
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
[6-Metric Clinical NLP Matrix]             [Deep Clinical Embeddings]
 • Levenshtein Distance (Orthographic)      • Bio_ClinicalBERT Dense Vectors
 • BiSim Jaccard Bigrams (Letter pairs)     • Pharmacological Classification
 • Soundex Code (Consonant Acoustics)       • Therapeutic Indication Overlap
 • Sorensen-Dice Index (Harmonic)           • Dosage Form & Route Compatibility
 • Double Metaphone (Clinical Cadence)
         │                                               │
         └───────────────────────┬───────────────────────┘
                                 ▼
                 [Feature Engineering & Vector Scaling]
                     (10-Dimensional Feature Space)
                                 │
                                 ▼
              [Supervised Soft-Voting Ensemble Model]
               ├── Random Forest Classifier (n=200, depth=15)
               ├── XGBoost Gradient Boosting (lr=0.1, max_depth=6)
               └── Multi-Layer Perceptron / LSTM Sequence Model
                                 │
                                 ▼
                     [Ensemble Probability Output]
                                 │
                                 ▼
              [FDA POCA Aligned Composite Safety Metric]
               • Low Risk (POCA < 50%)    - Safe to Dispense
               • Moderate (50% - 69%)     - Verification Advisory
               • High Hazard (≥ 70%)      - Hard Interception & Override
                                 │
                                 ▼
             [Interactive Tall Man Differentiator & CDSS]
```

---

## 6-Metric Clinical NLP Matrix

To capture every dimension of linguistic confusion, LASA-GUARD computes a normalized multi-metric distance matrix for every candidate pair:

| Metric | Algorithm Class | Clinical Rationale in Pharmacovigilance |
|---|---|---|
| **Levenshtein Distance** | Orthographic String Distance | Identifies typo frequency, letter insertions, omissions, and transpositions in physician handwriting or e-prescriptions. |
| **BiSim (Jaccard Bigrams)** | Segmental Character N-Grams | Measures overlapping 2-character sequences to detect shared prefixes, suffixes, and chemical root morphemes. |
| **Soundex Code** | Acoustic Consonant Hashing | Catches fundamental acoustic equivalence when medications are prescribed or communicated verbally. |
| **Sorensen-Dice Index** | Harmonic Bigram Overlap | Heavily weights common character pairs to isolate similar brand name stems. |
| **Double Metaphone** | Advanced Phonetic Phonology | Handles atypical medical pronunciations and silent letters common in pharmaceutical Latinate nomenclature. |
| **Bio_ClinicalBERT** | Transformer Neural Embeddings | Computes 768-dimensional contextual cosine similarity to evaluate semantic meaning and medical context. |

---

## Machine Learning Ensembles & Performance

### Supervised Classification Pipeline
Extracted orthographic, phonetic, and semantic features are standardized and passed through a Soft-Voting Ensemble classifier:

1. **Random Forest Classifier**: 200 estimators with entropy criterion to capture non-linear metric interactions.
2. **XGBoost Classifier**: Gradient boosted decision trees optimized for high recall on rare hazardous pairs.
3. **K-Means TF-IDF Clustering**: Groups the 761 formulary drugs into 12 functional clusters for rapid candidate filtering.

### Empirical Evaluation (n=690 Verified Test Pairs)

| Metric | Ensemble Model Score | Clinical Impact |
|---|---|---|
| **Accuracy** | **97.8%** | Robust separation between harmless and hazardous medication pairs. |
| **Precision** | **100.0%** | **Zero false alarms** on safe, distinct medications (prevents clinician alert fatigue). |
| **Recall (Sensitivity)** | **95.7%** | Intercepts 22 out of 23 high-risk LASA hazards in test benchmarks. |
| **F1-Score** | **97.8%** | Harmonic balance between specificity and safety interception. |
| **ROC-AUC** | **1.000** | Perfect discriminatory power along the receiver operating characteristic curve. |

---

## Clinical Decision Support Modules

The portal delivers 9 AI-assisted workflows tailored to hospital operations:

1. **Dashboard (`/dashboard`)**: Active safety surveillance metrics, collision trends, and immediate single-drug check.
2. **Check Medicine (`/check-medicine`)**: Real-time screening against the 761-drug catalog with multi-metric similarity and voice dictation.
3. **Dual-Drug Comparator (`/medicine-comparison`)**: Side-by-side linguistic breakdown, dynamic Tall Man letter generation, and indication mismatch warnings.
4. **Prescription Scanner (`/scan-prescription`)**: Computer vision OCR extracting multi-drug regimens and conducting exhaustive combinatorial ($O(N^2)$) safety checks.
5. **Safety Alerts & Incident Feed (`/safety-alerts`)**: Centralized surveillance feed of intercepted prescription collisions.
6. **Analysis History (`/analysis-history`)**: Searchable audit repository with CSV export capabilities for clinical safety audits.
7. **AIML Model Analytics (`/analytics`)**: Interactive model evaluation benchmark comparisons, ROC metrics, and live inference monitors.
8. **Clinical Settings (`/settings`)**: Sensitivity calibration, role customization, and dark/light UI mode toggle.
9. **Role-Based Authentication (`/login`)**: Tailored views for Attending Clinicians, Pharmacists, and Patient Safety Directors.

---

## Formulary Dataset & Collision Pairs

The platform's underlying catalog unifies international and regional clinical registries:
- **761 Verified Pharmaceutical Entities**: Complete generic formulations, dosage forms, routes of administration, and indications curated from the **Indian Pharmacopoeia (A-Z Medicines Dataset)**.
- **123 Clinically Confirmed LASA Collision Pairs**: Curated from the **Institute for Safe Medication Practices (ISMP)** and **Lancet Regional Health (2024)** collision studies (e.g., *Hydroxyzine* vs. *Hydralazine*, *Cisplatin* vs. *Carboplatin*, *Vinblastine* vs. *Vincristine*).

---

## System Architecture & Directory Structure

```
lasa/
├── backend/
│   ├── api/                 # Flask REST Blueprints (check, compare, drug, admin)
│   ├── ml/                  # Feature engineering, Random Forest, XGBoost, Clustering
│   ├── models/              # Schema definitions (Drug, Override, User, Interaction)
│   ├── models_saved/        # Pre-trained models (.pkl, .npy, metrics.json)
│   ├── scripts/             # Model training pipelines and formulary seeders
│   ├── services/            # NLP service, ML service, POCA service, Audit service
│   ├── utils/               # Text normalizers, validation, and security utilities
│   ├── app.py               # Flask application factory
│   ├── config.py            # Environment configuration
│   └── extensions.py        # JWT and CORS middleware
├── data/
│   ├── drugs.csv            # 761 indexed pharmaceutical drugs
│   ├── lasa_pairs.csv       # 123 verified confusable drug pairs
│   ├── drug_interactions.csv# Drug interaction rules
│   └── seed_users.json      # Pre-configured clinical roles
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components, layout, Tall Man generator, modals
│   │   ├── context/         # ThemeContext (Dark/Light) and RoleContext
│   │   ├── pages/           # 9 full clinical portal views
│   │   ├── services/        # API client, OCR service, similarity calculations
│   │   ├── types/           # Unified TypeScript interfaces
│   │   ├── App.tsx          # Router configuration
│   │   └── index.css        # Tailwind design system & dark mode tokens
│   ├── package.json         # React 19 + TypeScript + Vite + TailwindCSS
│   └── vite.config.ts       # Vite proxy and build configuration
├── notebooks/               # AIML research notebooks & exploratory analysis
├── tests/                   # Automated pytest suite for API, NLP, and ML models
├── run_all.bat              # 1-Click launcher for Backend + Frontend
├── run_unified_backend.bat  # Flask backend launcher
└── run_unified_frontend.bat # Vite frontend launcher
```

---

## Quickstart Guide

### 1-Click Launch (Windows)

Simply double-click `run_all.bat` or run from terminal:
```cmd
run_all.bat
```
- **Clinical Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000) (Health: `http://localhost:5000/health`)

---

### Manual Execution

#### Backend (Python 3.10+)
```bash
# Clone the repository
git clone https://github.com/kuleaniruddha/lasa.git
cd lasa

# (Optional) Setup Virtual Environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend API
python -m backend.app
```

#### Frontend (Node.js 18+)
```bash
cd frontend
npm install
npm run dev
```

---

## Clinical Evaluation & Benchmarks

Comparison of individual baseline NLP algorithms versus the Soft-Voting Ensemble:

| Architecture / Technique | Model Category | Accuracy | Precision | Recall | F1-Score |
|---|---|---|---|---|---|
| Levenshtein + Jaro Distance | Orthographic Distance | 78.4% | 74.2% | 81.0% | 77.4% |
| Double Metaphone + Soundex | Acoustic Phonetics | 82.1% | 79.5% | 85.3% | 82.3% |
| Bio_ClinicalBERT Cosine | Transformer Neural NLP | 86.2% | 87.5% | 82.1% | 84.7% |
| Random Forest (n=200) | Supervised Tree Ensemble | 97.8% | 100.0% | 95.7% | 97.8% |
| XGBoost (lr=0.1) | Gradient Boosted Trees | 97.8% | 100.0% | 95.7% | 97.8% |
| **Soft-Voting Ensemble (Ours)** | **Multi-Model Ensemble** | **97.8%** | **100.0%** | **95.7%** | **97.8%** |

---

## Clinical Guidelines & Regulatory Alignment

- **FDA POCA (Phonetic and Orthographic Computer Analysis)**: Follows the FDA Staff Manual Guide for evaluating look-alike and sound-alike proprietary names.
- **ISMP (Institute for Safe Medication Practices)**: Incorporates the FDA/ISMP list of established confusable drug names and Tall Man lettering guidelines.
- **The Lancet Regional Health (2024)**: Informed by published findings on the prevalence of look-alike, sound-alike drugs in hospital dispensing practices.
- **WHO International Nonproprietary Names (INN)**: Employs standardized pharmacological stem conventions.

---

## Academic Citation

```bibtex
@misc{lasaguard2026,
  author = {Kule, Aniruddha},
  title = {LASA-GUARD: Clinical Decision Support Platform for Medication Error Prevention},
  year = {2026},
  publisher = {GitHub},
  howpublished = {\url{https://github.com/kuleaniruddha/lasa}}
}
```
