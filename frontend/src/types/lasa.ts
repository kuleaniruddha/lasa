export type RiskLevel = 'High' | 'Medium' | 'Low' | 'Clear';

export interface Medicine {
  id: string;
  name: string;
  brandName?: string;
  genericName: string;
  tallMan?: string;
  category: string;
  therapeuticPurpose: string;
  dosageForm: string;
  strength: string;
  manufacturer: string;
  isLasaRisk?: boolean;
  knownLasaPartner?: string;
  origin?: string;
}

export interface LASAPair {
  medA: string;
  medB: string;
  brandA: string;
  brandB: string;
  tallManA: string;
  tallManB: string;
  categoryA: string;
  categoryB: string;
  purposeA: string;
  purposeB: string;
  dosageA: string;
  dosageB: string;
  spellingSimilarity: number; // 0-100
  phoneticSimilarity: number; // 0-100
  semanticSimilarity: number; // 0-100
  overallRiskScore: number;   // 0-100
  riskLevel: RiskLevel;
  flagReasons: string[];
  clinicalAdvice: string;
}

export interface LASAAnalysisResult {
  queryMedicine: Medicine;
  hasRisk: boolean;
  confusedPartner?: Medicine;
  spellingSimilarity: number;
  phoneticSimilarity: number;
  semanticSimilarity: number;
  overallRiskScore: number;
  riskLevel: RiskLevel;
  flagReasons: string[];
  clinicalAdvice: string;
  tallManQuery: string;
  tallManPartner?: string;
  aiExplanation: string;
  timestamp: string;
  detectionSource: 'Manual Search' | 'Prescription OCR' | 'Voice Input';
}

export interface OCRMedicineItem {
  id: string;
  extractedName: string;
  confidence: number;
  matchedMedicine?: Medicine;
  potentialConflict?: string;
  riskLevel: RiskLevel;
  lasaScore: number;
  isEdited?: boolean;
}

export interface PrescriptionScanResult {
  id: string;
  filename: string;
  timestamp: string;
  totalDetected: number;
  potentialConflicts: number;
  highRiskConflicts: number;
  medicines: OCRMedicineItem[];
}

export interface SafetyAlert {
  id: string;
  pair: [string, string];
  tallManPair: [string, string];
  lasaScore: number;
  riskLevel: RiskLevel;
  timestamp: string;
  detectionSource: 'Manual Search' | 'Prescription OCR' | 'Voice Input';
  status: 'Active' | 'Resolved' | 'Under Review';
  reason: string;
  recommendation: string;
  medA: Medicine;
  medB: Medicine;
}

export interface AnalysisHistoryItem {
  id: string;
  date: string;
  medicine: string;
  tallMan: string;
  confusedWith?: string;
  lasaScore: number;
  riskLevel: RiskLevel;
  source: 'Manual Search' | 'Prescription OCR' | 'Voice Input';
  user: string;
  status: 'Reviewed' | 'Flagged' | 'Ignored' | 'Resolved';
}

export interface ModelMetric {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  pocaScore: number;
  description: string;
}

export interface AISettings {
  similarityThreshold: number; // e.g. 70
  riskSensitivity: 'Permissive' | 'Standard' | 'High';
  pocaWeight: number; // 0-1
  phoneticAlgorithm: 'Double Metaphone' | 'Soundex' | 'NYSIIS';
}
