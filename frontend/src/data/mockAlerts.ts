import { SafetyAlert } from '../types/lasa';
import { MEDICINES_DATABASE } from './medicinesData';

const findMed = (name: string) => 
  MEDICINES_DATABASE.find(m => m.name.toLowerCase() === name.toLowerCase()) || {
    id: 'unknown',
    name,
    genericName: name,
    category: 'Prescription Therapeutic',
    therapeuticPurpose: 'Clinical therapeutic use',
    dosageForm: 'Tablet',
    strength: 'Standard',
    manufacturer: 'Pharmacopoeia'
  };

export const INITIAL_SAFETY_ALERTS: SafetyAlert[] = [
  {
    id: 'alt-101',
    pair: ['Hydroxyzine', 'Hydralazine'],
    tallManPair: ['hydrOXYzine', 'hydrALAZINE'],
    lasaScore: 89,
    riskLevel: 'High',
    timestamp: 'Today, 10:42 AM',
    detectionSource: 'Prescription OCR',
    status: 'Active',
    reason: 'High orthographic similarity (91%) with conflicting pharmacological indications (antihistamine sedation vs potent antihypertensive vasodilation).',
    recommendation: 'Verify patient diagnosis (hypertension vs pruritus/anxiety) and baseline BP before dispensing.',
    medA: findMed('Hydroxyzine'),
    medB: findMed('Hydralazine')
  },
  {
    id: 'alt-102',
    pair: ['Olvance', 'Oleanz'],
    tallManPair: ['OLVance', 'OLEAnz'],
    lasaScore: 85,
    riskLevel: 'High',
    timestamp: 'Today, 09:15 AM',
    detectionSource: 'Manual Search',
    status: 'Active',
    reason: 'Lancet 2024 published high-risk brand collision: Olmesartan (antihypertensive) confused with Olanzapine (atypical antipsychotic).',
    recommendation: 'Mandatory verification of International Nonproprietary Name (INN). Confirm cardiovascular vs psychiatric indication.',
    medA: findMed('Olvance'),
    medB: findMed('Oleanz')
  },
  {
    id: 'alt-103',
    pair: ['Celebrex', 'Celexa'],
    tallManPair: ['CELEbrex', 'CELexa'],
    lasaScore: 76,
    riskLevel: 'Medium',
    timestamp: 'Today, 08:30 AM',
    detectionSource: 'Prescription OCR',
    status: 'Active',
    reason: 'Shared phonetic prefix and length: COX-2 NSAID (arthritic pain) confused with SSRI antidepressant.',
    recommendation: 'Confirm indication (rheumatoid pain vs depressive illness) and formulation (capsule vs tablet).',
    medA: findMed('Celebrex'),
    medB: findMed('Celexa')
  },
  {
    id: 'alt-104',
    pair: ['Medzol', 'Medzole'],
    tallManPair: ['MEDZOL-Mida', 'MEDZOLE-Metro'],
    lasaScore: 95,
    riskLevel: 'High',
    timestamp: 'Yesterday, 04:20 PM',
    detectionSource: 'Manual Search',
    status: 'Active',
    reason: 'Critical identical brand name marketed for Midazolam (IV anesthetic sedative) and Metronidazole (antimicrobial).',
    recommendation: 'Examine route of administration (IV ampoule vs oral suspension) and confirm procedural sedation intent.',
    medA: findMed('Medzol'),
    medB: findMed('Medzole')
  },
  {
    id: 'alt-105',
    pair: ['Clonidine', 'Clonazepam'],
    tallManPair: ['cloNIDine', 'clonazePAM'],
    lasaScore: 61,
    riskLevel: 'Low',
    timestamp: 'Yesterday, 02:10 PM',
    detectionSource: 'Voice Input',
    status: 'Resolved',
    reason: 'Shared stem prefix ("Clon-"). High potency decimal dosage confusion risk (0.1mg vs 0.5mg).',
    recommendation: 'Titration verification: checked against patient chart. Confirmed Catapres for mild hypertension.',
    medA: findMed('Clonidine'),
    medB: findMed('Clonazepam')
  },
  {
    id: 'alt-106',
    pair: ['Linamac', 'Linamac-5'],
    tallManPair: ['LINAMAC-Lena', 'LINAMAC-Lina'],
    lasaScore: 96,
    riskLevel: 'High',
    timestamp: 'Yesterday, 11:05 AM',
    detectionSource: 'Prescription OCR',
    status: 'Under Review',
    reason: 'Exact brand identity used for antineoplastic chemotherapy (Lenalidomide) and antidiabetic DPP-4 inhibitor (Linagliptin).',
    recommendation: 'Oncologist verification required. Do not dispense without active prescription protocol check.',
    medA: findMed('Linamac'),
    medB: findMed('Linamac-5')
  },
  {
    id: 'alt-107',
    pair: ['Dobutamine', 'Dopamine'],
    tallManPair: ['dOBUTamine', 'dOPAmine'],
    lasaScore: 84,
    riskLevel: 'High',
    timestamp: '2 days ago',
    detectionSource: 'Manual Search',
    status: 'Resolved',
    reason: 'Emergency ICU inotrope confusion. Dopamine causes peripheral vasoconstriction; Dobutamine reduces afterload.',
    recommendation: 'ICU team re-verified central line infusion rate and hemodynamic goals.',
    medA: findMed('Dobutamine'),
    medB: findMed('Dopamine')
  }
];
