import { AnalysisHistoryItem } from '../types/lasa';

export const INITIAL_HISTORY: AnalysisHistoryItem[] = [
  {
    id: 'hist-1',
    date: '2026-09-04 10:42',
    medicine: 'Hydroxyzine',
    tallMan: 'hydrOXYzine',
    confusedWith: 'Hydralazine',
    lasaScore: 89,
    riskLevel: 'High',
    source: 'Prescription OCR',
    user: 'Dr. Aniruddha Kule',
    status: 'Flagged'
  },
  {
    id: 'hist-2',
    date: '2026-09-04 09:15',
    medicine: 'Olvance',
    tallMan: 'OLVance',
    confusedWith: 'Oleanz',
    lasaScore: 85,
    riskLevel: 'High',
    source: 'Manual Search',
    user: 'Dr. Aniruddha Kule',
    status: 'Reviewed'
  },
  {
    id: 'hist-3',
    date: '2026-09-04 08:30',
    medicine: 'Celebrex',
    tallMan: 'CELEbrex',
    confusedWith: 'Celexa',
    lasaScore: 76,
    riskLevel: 'Medium',
    source: 'Prescription OCR',
    user: 'Dr. Aniruddha Kule',
    status: 'Reviewed'
  },
  {
    id: 'hist-4',
    date: '2026-09-03 16:20',
    medicine: 'Medzol',
    tallMan: 'MEDZOL-Mida',
    confusedWith: 'Medzole',
    lasaScore: 95,
    riskLevel: 'High',
    source: 'Manual Search',
    user: 'Dr. Aniruddha Kule',
    status: 'Flagged'
  },
  {
    id: 'hist-5',
    date: '2026-09-03 14:10',
    medicine: 'Clonidine',
    tallMan: 'cloNIDine',
    confusedWith: 'Clonazepam',
    lasaScore: 61,
    riskLevel: 'Low',
    source: 'Voice Input',
    user: 'Dr. Aniruddha Kule',
    status: 'Resolved'
  },
  {
    id: 'hist-6',
    date: '2026-09-03 11:05',
    medicine: 'Linamac',
    tallMan: 'LINAMAC-Lena',
    confusedWith: 'Linamac-5',
    lasaScore: 96,
    riskLevel: 'High',
    source: 'Prescription OCR',
    user: 'Dr. Aniruddha Kule',
    status: 'Flagged'
  },
  {
    id: 'hist-7',
    date: '2026-09-02 18:40',
    medicine: 'Paracetamol',
    tallMan: 'paracetAMOL',
    confusedWith: undefined,
    lasaScore: 18,
    riskLevel: 'Clear',
    source: 'Manual Search',
    user: 'Dr. Aniruddha Kule',
    status: 'Reviewed'
  },
  {
    id: 'hist-8',
    date: '2026-09-02 15:30',
    medicine: 'Augmentin 625 Duo',
    tallMan: 'AUGMENTIN 625',
    confusedWith: undefined,
    lasaScore: 22,
    riskLevel: 'Clear',
    source: 'Prescription OCR',
    user: 'Dr. Aniruddha Kule',
    status: 'Reviewed'
  },
  {
    id: 'hist-9',
    date: '2026-09-02 12:15',
    medicine: 'Dobutamine',
    tallMan: 'dOBUTamine',
    confusedWith: 'Dopamine',
    lasaScore: 84,
    riskLevel: 'High',
    source: 'Manual Search',
    user: 'Dr. Aniruddha Kule',
    status: 'Resolved'
  },
  {
    id: 'hist-10',
    date: '2026-09-01 17:00',
    medicine: 'Metformin',
    tallMan: 'metFORMIN',
    confusedWith: 'Metronidazole',
    lasaScore: 72,
    riskLevel: 'Medium',
    source: 'Voice Input',
    user: 'Dr. Aniruddha Kule',
    status: 'Reviewed'
  }
];
