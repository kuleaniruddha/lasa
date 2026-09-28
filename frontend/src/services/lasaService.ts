import { 
  Medicine, 
  LASAAnalysisResult, 
  PrescriptionScanResult, 
  SafetyAlert, 
  AnalysisHistoryItem,
  OCRMedicineItem 
} from '../types/lasa';
import { MEDICINES_DATABASE } from '../data/medicinesData';
import { INITIAL_SAFETY_ALERTS } from '../data/mockAlerts';
import { INITIAL_HISTORY } from '../data/historyData';
import { db, auth } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { 
  analyzeMedicineQuery, 
  calculateSpellingSimilarity, 
  calculatePhoneticSimilarity, 
  calculateSemanticSimilarity, 
  calculateHybridLasaScore, 
  getRiskLevel, 
  generateTallMan 
} from './similarity';

// In-memory fallback/cache
let memoryAlerts: SafetyAlert[] = [...INITIAL_SAFETY_ALERTS];
let memoryHistory: AnalysisHistoryItem[] = [...INITIAL_HISTORY];

const getClinicianName = (): string => {
  return auth.currentUser?.displayName || auth.currentUser?.email || 'Dr. Aniruddha Kule';
};

export const lasaService = {
  // Search medicines autocomplete
  searchMedicines: async (queryStr: string): Promise<Medicine[]> => {
    if (!queryStr || queryStr.trim().length === 0) return [];
    const q = queryStr.toLowerCase().trim();
    return MEDICINES_DATABASE.filter(m => 
      m.name.toLowerCase().includes(q) || 
      (m.brandName && m.brandName.toLowerCase().includes(q)) ||
      m.genericName.toLowerCase().includes(q)
    ).slice(0, 8);
  },

  // Get medicine details by exact or partial name
  getMedicineDetails: async (name: string): Promise<Medicine | undefined> => {
    const q = name.toLowerCase().trim();
    return MEDICINES_DATABASE.find(m => 
      m.name.toLowerCase() === q || 
      (m.brandName && m.brandName.toLowerCase() === q)
    );
  },

  // Analyze single medicine
  analyzeMedicine: async (name: string, source: 'Manual Search' | 'Prescription OCR' | 'Voice Input' = 'Manual Search'): Promise<LASAAnalysisResult> => {
    try {
      // Check if backend is available (progressive enhancement)
      const res = await fetch('http://localhost:8000/api/analyze-medicine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicine_name: name, source })
      });
      if (res.ok) {
        const backendResult = await res.json();
        // Record to Firestore
        await lasaService.recordAnalysisToFirestore(backendResult, source);
        return backendResult;
      }
    } catch {
      // Backend not reached, proceed with local AI engine
    }

    // Client-side AI execution
    const result = analyzeMedicineQuery(name, source);
    await lasaService.recordAnalysisToFirestore(result, source);
    return result;
  },

  // Helper to persist analysis and conditional alerts to Firestore
  recordAnalysisToFirestore: async (result: LASAAnalysisResult, source: 'Manual Search' | 'Prescription OCR' | 'Voice Input') => {
    const clinician = getClinicianName();
    const historyEntry: AnalysisHistoryItem = {
      id: `hist-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      medicine: result.queryMedicine.name,
      tallMan: result.tallManQuery,
      confusedWith: result.confusedPartner?.name,
      lasaScore: result.overallRiskScore,
      riskLevel: result.riskLevel,
      source,
      user: clinician,
      status: result.hasRisk ? 'Flagged' : 'Reviewed'
    };

    // Update memory
    memoryHistory = [historyEntry, ...memoryHistory];

    // Write to Firebase Firestore
    try {
      const histRef = doc(db, 'history', historyEntry.id);
      await setDoc(histRef, historyEntry);
    } catch (err) {
      console.warn('Firestore history write notice:', err);
    }

    // If high risk, also add to Firestore active alerts
    if (result.riskLevel === 'High' && result.confusedPartner) {
      const alertExists = memoryAlerts.some(
        a => a.pair[0].toLowerCase() === result.queryMedicine.name.toLowerCase() &&
             a.pair[1].toLowerCase() === result.confusedPartner?.name.toLowerCase() &&
             a.status === 'Active'
      );
      if (!alertExists) {
        const newAlert: SafetyAlert = {
          id: `alt-${Date.now()}`,
          pair: [result.queryMedicine.name, result.confusedPartner.name],
          tallManPair: [result.tallManQuery, result.tallManPartner || result.confusedPartner.name],
          lasaScore: result.overallRiskScore,
          riskLevel: result.riskLevel,
          timestamp: 'Just now',
          detectionSource: source,
          status: 'Active',
          reason: result.flagReasons.join('. '),
          recommendation: result.clinicalAdvice,
          medA: result.queryMedicine,
          medB: result.confusedPartner
        };
        memoryAlerts = [newAlert, ...memoryAlerts];

        try {
          const alertRef = doc(db, 'alerts', newAlert.id);
          await setDoc(alertRef, {
            id: newAlert.id,
            pair: newAlert.pair,
            tallManPair: newAlert.tallManPair,
            lasaScore: newAlert.lasaScore,
            riskLevel: newAlert.riskLevel,
            timestamp: newAlert.timestamp,
            detectionSource: newAlert.detectionSource,
            status: newAlert.status,
            reason: newAlert.reason,
            recommendation: newAlert.recommendation
          });
        } catch (err) {
          console.warn('Firestore alert write notice:', err);
        }
      }
    }
  },

  // Compare two specific medicines side-by-side
  compareMedicines: async (medAName: string, medBName: string) => {
    let medA = MEDICINES_DATABASE.find(m => m.name.toLowerCase() === medAName.toLowerCase());
    let medB = MEDICINES_DATABASE.find(m => m.name.toLowerCase() === medBName.toLowerCase());

    if (!medA) {
      medA = {
        id: 'c-a',
        name: medAName,
        genericName: medAName,
        category: 'Prescription Medicine',
        therapeuticPurpose: 'Prescribed clinical use',
        dosageForm: 'Tablet',
        strength: 'Standard',
        manufacturer: 'Clinical Database'
      };
    }

    if (!medB) {
      medB = {
        id: 'c-b',
        name: medBName,
        genericName: medBName,
        category: 'Prescription Medicine',
        therapeuticPurpose: 'Prescribed clinical use',
        dosageForm: 'Tablet',
        strength: 'Standard',
        manufacturer: 'Clinical Database'
      };
    }

    const spelling = calculateSpellingSimilarity(medA.name, medB.name);
    const phonetic = calculatePhoneticSimilarity(medA.name, medB.name);
    const semantic = calculateSemanticSimilarity(medA, medB);
    const overallRisk = calculateHybridLasaScore(spelling, phonetic, semantic);
    const riskLevel = getRiskLevel(overallRisk);
    const [tallA, tallB] = generateTallMan(medA.name, medB.name);

    return {
      medA,
      medB,
      tallA,
      tallB,
      spellingSimilarity: spelling,
      phoneticSimilarity: phonetic,
      semanticSimilarity: semantic,
      overallRiskScore: overallRisk,
      riskLevel,
      safetyMessage: overallRisk >= 65 
        ? 'High potential for confusion detected. Verify intended medicine, dosage strength, and indication before proceeding.'
        : 'Low conflict detected. Standard medication dispensing checks apply.'
    };
  },

  // Scan Prescription OCR
  scanPrescription: async (extractedMedicineNames: string[]): Promise<PrescriptionScanResult> => {
    const items: OCRMedicineItem[] = [];
    let conflictsCount = 0;
    let highRiskCount = 0;

    for (const rawName of extractedMedicineNames) {
      const clean = rawName.trim();
      if (!clean) continue;

      const analysis = analyzeMedicineQuery(clean, 'Prescription OCR');
      const conf = Math.floor(88 + Math.random() * 11); // 88% - 98% OCR confidence

      if (analysis.riskLevel === 'High' || analysis.riskLevel === 'Medium') {
        conflictsCount++;
        if (analysis.riskLevel === 'High') highRiskCount++;
      }

      items.push({
        id: `ocr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        extractedName: clean,
        confidence: conf,
        matchedMedicine: analysis.queryMedicine,
        potentialConflict: analysis.confusedPartner?.name,
        riskLevel: analysis.riskLevel,
        lasaScore: analysis.overallRiskScore
      });
    }

    const scanResult: PrescriptionScanResult = {
      id: `rx-${Date.now()}`,
      filename: 'Prescription_Rx_Scan.png',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      totalDetected: items.length,
      potentialConflicts: conflictsCount,
      highRiskConflicts: highRiskCount,
      medicines: items
    };

    // Store scan record in Firebase Firestore
    try {
      const scanRef = doc(db, 'scans', scanResult.id);
      await setDoc(scanRef, {
        id: scanResult.id,
        filename: scanResult.filename,
        timestamp: scanResult.timestamp,
        totalDetected: scanResult.totalDetected,
        potentialConflicts: scanResult.potentialConflicts,
        highRiskConflicts: scanResult.highRiskConflicts,
        medicinesCount: items.length,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Firestore scan record write notice:', e);
    }

    return scanResult;
  },

  // Get active and historical safety alerts directly from Firebase Firestore
  getAlerts: async (): Promise<SafetyAlert[]> => {
    try {
      const colRef = collection(db, 'alerts');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const loaded: SafetyAlert[] = snap.docs.map(docSnap => {
          const data = docSnap.data();
          const p0 = data.pair?.[0] || 'Drug A';
          const p1 = data.pair?.[1] || 'Drug B';
          const medA = data.medA || MEDICINES_DATABASE.find(m => m.name.toLowerCase() === p0.toLowerCase()) || {
            id: 'm-a',
            name: p0,
            genericName: p0,
            category: 'Prescription Therapeutic',
            therapeuticPurpose: 'Clinical indication',
            dosageForm: 'Tablet',
            strength: 'Standard',
            manufacturer: 'Pharmacopoeia'
          };
          const medB = data.medB || MEDICINES_DATABASE.find(m => m.name.toLowerCase() === p1.toLowerCase()) || {
            id: 'm-b',
            name: p1,
            genericName: p1,
            category: 'Prescription Therapeutic',
            therapeuticPurpose: 'Clinical indication',
            dosageForm: 'Tablet',
            strength: 'Standard',
            manufacturer: 'Pharmacopoeia'
          };
          return {
            id: docSnap.id,
            pair: [p0, p1],
            tallManPair: data.tallManPair || [p0, p1],
            lasaScore: data.lasaScore ?? 75,
            riskLevel: data.riskLevel || 'High',
            timestamp: data.timestamp || 'Recent',
            detectionSource: data.detectionSource || 'AI Engine',
            status: data.status || 'Active',
            reason: data.reason || 'Orthographic / phonetic similarity detected.',
            recommendation: data.recommendation || 'Verify patient diagnosis before dispensing.',
            medA,
            medB
          } as SafetyAlert;
        });
        memoryAlerts = loaded;
        return loaded;
      }
    } catch (e) {
      console.warn('Firestore alerts load notice:', e);
    }
    return memoryAlerts;
  },

  // Update alert status in Firebase Firestore
  resolveAlert: async (alertId: string): Promise<SafetyAlert[]> => {
    try {
      const alertRef = doc(db, 'alerts', alertId);
      await updateDoc(alertRef, { 
        status: 'Resolved',
        resolvedAt: new Date().toISOString(),
        resolvedBy: getClinicianName()
      });
    } catch (e) {
      console.warn('Firestore alert status update notice:', e);
    }
    memoryAlerts = memoryAlerts.map(a => a.id === alertId ? { ...a, status: 'Resolved' } : a);
    return memoryAlerts;
  },

  // Get past history from Firebase Firestore
  getHistory: async (): Promise<AnalysisHistoryItem[]> => {
    try {
      const colRef = collection(db, 'history');
      let snap;
      try {
        const q = query(colRef, orderBy('date', 'desc'), limit(50));
        snap = await getDocs(q);
      } catch {
        snap = await getDocs(colRef);
      }

      if (!snap.empty) {
        const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() } as AnalysisHistoryItem));
        memoryHistory = loaded;
        return loaded;
      }
    } catch (e) {
      console.warn('Firestore history load notice:', e);
    }
    return memoryHistory;
  }
};
