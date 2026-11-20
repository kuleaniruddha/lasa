# LASA Unified Project: Feature Integration & System Status

> **Unified AI-Powered Look-Alike Sound-Alike (LASA) Medication Safety Portal**  
> *Combining Clinical UI/UX Workflow with Machine Learning, Big Data Analytics, and Clinical NLP Engines.*  
> **Target Folder:** `c:\Lasa Project\lasa-unified`  
> **Status:** Merged & Operational (No `.git` repositories attached)

---

## 1. Executive Summary

This unified project integrates a comprehensive clinical decision support interface and client-side tooling with machine learning algorithms, Big Data Analytics (BDA) streaming pipelines, and NLP scoring metrics.

The interface retains an **enterprise React 18 + TypeScript + Vite + TailwindCSS 9-page clinical portal** while exposing:
- **6-Metric NLP Matrix & ML Ensemble Probabilities** on the Medicine Check, Comparison, and Audit pages.
- **Clinician Override System** (FDA-grade justification & digital signature modal).
- **Big Data Analytics (BDA) Engine** (DGIM sliding window, Flajolet-Martin distinct counting, and Bloom Filter cache).
- **Unified Drug Catalog** merging Indian Pharmacopoeia drugs with global pharmaceuticals (**761 total catalog entries** and **123 confirmed LASA collision pairs**).

---

## 2. Feature-by-Feature Status Matrix

| Feature | Subsystem | Unified Status | Operational Mode / Notes |
| :--- | :--- | :--- | :--- |
| **Clinical UI/UX (9 Pages)** | Clinical Portal | 🟢 **100% Working** | React + TypeScript + TailwindCSS portal with responsive navigation, modal dialogs, and real-time state. |
| **Combined Formulary (761 Drugs)** | Merged Catalog | 🟢 **100% Working** | `data/drugs.csv` contains 761 verified drugs with brand, generic, schedule, and therapeutic class. |
| **LASA Collision Pairs (123 Pairs)** | Merged Catalog | 🟢 **100% Working** | `data/lasa_pairs.csv` combines ISMP international high-alert pairs with Indian brand pairs. |
| **FDA POCA Composite Scoring** | POCA Engine | 🟢 **100% Working** | Normalized Orthographic (Levenshtein), Phonetic (Soundex/Metaphone), and Semantic algorithms. |
| **6-Metric NLP Similarity Matrix** | Clinical NLP Service | 🟢 **100% Working** | Calculates Levenshtein, BiSim, Soundex, Dice, Metaphone, and Cosine similarity. |
| **Tall Man Lettering Generation** | Safety Engine | 🟢 **100% Working** | Automatic capitalization of divergent character blocks (e.g., `hydrOXYzine` vs `hydrALAzine`). |
| **Dual-Medicine Comparator** | Comparator Engine | 🟢 **100% Working** | Side-by-side comparative analysis with 6-metric NLP breakdown and ML collision probability. |
| **Prescription Scanner Matrix** | OCR Engine | 🟢 **100% Working** | Combinatorial screening endpoint `/api/scan-prescription` for multi-drug prescriptions. |
| **Voice Dictation Input** | Speech Module | 🟢 **100% Working** | Browser-native Web Speech API with mic button in search bars. |
| **Clinician Risk Override Modal** | Governance Engine | 🟢 **100% Working** | FDA justification prompt, signature capture, and audit logging into `/api/override`. |
| **Big Data Analytics (BDA) Stream** | BDA Engine | 🟢 **100% Working** | DGIM sliding window (60s), Flajolet-Martin distinct estimator, and 20,000-bit Bloom Filter. |
| **ML Model Loading & Scoring** | ML Service | 🟢 **100% Working** | Pre-trained `rf_model.pkl`, `scaler.pkl`, `kmeans.pkl` loaded from `models_saved/`. |
| **ML Retraining Pipeline** | ML Service | 🟢 **100% Working** | "Retrain ML Engine" button in Admin Analytics page triggers background retraining. |
| **Authentication & Demo Bypass** | Security Service | 🟢 **100% Working** | 1-Click "Demo Bypass / Offline Mode" button enables immediate testing without Firebase setup. |
| **Docker Compose Support** | Infrastructure | 🟢 **Ready** | `docker-compose.yml` configures Flask, MongoDB, Kafka, and Zookeeper. |

---

## 3. Features with Fallbacks / Optional Integrations (Step-by-Step Guide)

To make this project run **immediately without requiring third-party cloud services or heavy native drivers**, several features use built-in fallbacks. You can enable external production services one step at a time:

### Step 1: Firebase Authentication (Currently: Built-in 1-Click Offline Bypass)
- **Current State:** The login page includes a blue **"Demo Bypass / Offline Mode"** button that logs the user in immediately as a Senior Attending Clinician without contacting Firebase.
- **To Enable Real Firebase:**
  1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com).
  2. Copy your web app config into `frontend/src/config/firebase.ts`.
  3. Set up Email/Password authentication in the Firebase Console.

### Step 2: Apache Kafka Event Streaming (Currently: In-Memory Event Stream)
- **Current State:** When Kafka is not running, `backend/bda/kafka_producer.py` catches the connection error and switches to an in-memory event stream buffer. The app runs smoothly without errors.
- **To Enable Apache Kafka:**
  1. Ensure Docker Desktop is running.
  2. Run: `docker-compose up -d zookeeper kafka`
  3. Events will stream to the `lasa-events` topic.

### Step 3: MongoDB Database (Currently: In-Memory / Local JSON Data)
- **Current State:** Interactions and overrides are logged to local memory and logged via standard logging when MongoDB is offline.
- **To Enable MongoDB:**
  1. Run: `docker-compose up -d mongodb`
  2. Or set `MONGO_URI=mongodb://localhost:27017/lasa_db` in your environment.

### Step 4: HuggingFace Bio_ClinicalBERT (Currently: Deterministic ASCII Character Vector Fallback)
- **Current State:** If `sentence_transformers` or PyTorch is not installed in your Python environment, `nlp_service.py` computes an ASCII n-gram pseudo-embedding.
- **To Enable Bio_ClinicalBERT:**
  1. Run: `pip install torch sentence-transformers`
  2. On first run, it will automatically download `emilyalsentzer/Bio_ClinicalBERT` from Hugging Face.

### Step 5: TensorFlow LSTM Deep Learning Model (Currently: FallbackLSTM Model)
- **Current State:** If TensorFlow runtime is not installed, `ml_service.py` routes sequence predictions through `FallbackLSTM`.
- **To Enable Keras LSTM:**
  1. Run: `pip install tensorflow`
  2. Retrain models via `/api/admin/retrain` or the Analytics page button.

---

## 4. How to Run the Unified Application

### Option A: 1-Click Launch (Recommended)
Double-click:
```cmd
run_all.bat
```
This opens two terminal windows:
1. **Flask Backend API** on `http://localhost:5000`
2. **React Clinical UI** on `http://localhost:5173`

### Option B: Manual Launch

#### 1. Start Backend:
```powershell
cd "c:\Lasa Project\lasa-unified"
.\run_unified_backend.bat
```
*Health Check:* Open `http://localhost:5000/health` in your browser.

#### 2. Start Frontend:
```powershell
cd "c:\Lasa Project\lasa-unified\frontend"
npm install
npm run dev
```
*Access Portal:* Open `http://localhost:5173` in your browser. Click **"Demo Bypass / Offline Mode"** on the login page to enter immediately.

---

## 5. Verification Checklist

- [x] Fresh standalone folder created at `c:\Lasa Project\lasa-unified`
- [x] Zero `.git` repositories or submodules present
- [x] Full 9-page clinical UI/UX preserved and rendered
- [x] 6-metric NLP similarity algorithms active
- [x] Pre-trained ML models (`rf_model.pkl`, `scaler.pkl`, `kmeans.pkl`) loaded
- [x] BDA stream analytics (Bloom Filter, DGIM, Flajolet-Martin) operational
- [x] Clinician Override modal and audit logging active
- [x] Dual-drug comparator and prescription scanner preserved
- [x] Indian Pharmacopoeia dataset merged with global drug catalog (761 drugs total)
- [x] Automated batch launcher scripts created (`run_all.bat`, `run_unified_backend.bat`, `run_unified_frontend.bat`)
