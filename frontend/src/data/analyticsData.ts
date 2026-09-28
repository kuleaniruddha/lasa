import { ModelMetric } from '../types/lasa';

export const MODEL_EVALUATION_METRICS: ModelMetric[] = [
  {
    name: 'Fuzzy String Matching (Levenshtein + Jaro-Winkler)',
    accuracy: 78.4,
    precision: 74.2,
    recall: 81.0,
    f1Score: 77.4,
    pocaScore: 76.1,
    description: 'Measures character-level edit distance and transposed characters. Struggles with phonetically identical strings with disparate spellings.'
  },
  {
    name: 'Phonetic Matching (Double Metaphone + Soundex)',
    accuracy: 82.1,
    precision: 79.5,
    recall: 85.3,
    f1Score: 82.3,
    pocaScore: 81.5,
    description: 'Encodes pronunciation keys based on English and Latin phonology. May over-flag completely harmless phonetic coincidences without clinical context.'
  },
  {
    name: 'Semantic Embeddings (Sentence-Transformers / BioBERT)',
    accuracy: 84.7,
    precision: 86.1,
    recall: 79.8,
    f1Score: 82.8,
    pocaScore: 78.9,
    description: 'Captures pharmacological class, therapeutic target, and contextual usage embeddings. Poor at pure typographic slip-ups.'
  },
  {
    name: 'Proposed Hybrid LASA Ensemble Model (v1.0)',
    accuracy: 94.6,
    precision: 92.8,
    recall: 95.1,
    f1Score: 93.9,
    pocaScore: 92.4,
    description: 'Multi-signal ensemble fusing orthographic distance, phonetic codes, and clinical therapeutic semantic embeddings with adaptive risk thresholding.'
  }
];

export const FREQUENT_LASA_PAIRS = [
  { pair: 'Hydroxyzine ↔ Hydralazine', count: 42, risk: 'High', score: 89 },
  { pair: 'Olvance ↔ Oleanz', count: 38, risk: 'High', score: 85 },
  { pair: 'Celebrex ↔ Celexa', count: 29, risk: 'Medium', score: 76 },
  { pair: 'Medzol ↔ Medzole', count: 26, risk: 'High', score: 95 },
  { pair: 'Clonidine ↔ Clonazepam', count: 21, risk: 'Low', score: 61 },
  { pair: 'Linamac ↔ Linamac-5', count: 18, risk: 'High', score: 96 },
  { pair: 'Metformin ↔ Metronidazole', count: 15, risk: 'Medium', score: 72 },
  { pair: 'Dobutamine ↔ Dopamine', count: 12, risk: 'High', score: 84 }
];

export const WEEKLY_ACTIVITY = [
  { day: 'Mon', checks: 142, alerts: 12 },
  { day: 'Tue', checks: 185, alerts: 15 },
  { day: 'Wed', checks: 210, alerts: 19 },
  { day: 'Thu', checks: 195, alerts: 14 },
  { day: 'Fri', checks: 230, alerts: 22 },
  { day: 'Sat', checks: 165, alerts: 8 },
  { day: 'Sun', checks: 157, alerts: 6 }
];

export const RISK_DISTRIBUTION = [
  { level: 'High Risk', count: 14, percent: 16.3, color: '#dc2626' },
  { level: 'Medium Risk', count: 32, percent: 37.2, color: '#ea580c' },
  { level: 'Low Risk', count: 40, percent: 46.5, color: '#d97706' }
];

export const OCR_CONFIDENCE_BUCKETS = [
  { range: '90-100% (High Confidence)', count: 248, percent: 76.5 },
  { range: '75-89% (Moderate Review)', count: 58, percent: 17.9 },
  { range: '< 75% (Manual Confirmation)', count: 18, percent: 5.6 }
];
