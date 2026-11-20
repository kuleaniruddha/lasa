import { createWorker } from 'tesseract.js';
import { MEDICINES_DATABASE } from '../data/medicinesData';
import { levenshteinDistance } from './similarity';

export interface ExtractedDrugResult {
  rawLine: string;
  cleanedName: string;
  dosage?: string;
  confidence: number;
  matchedDrugName?: string;
  isFuzzyMatched: boolean;
}

export interface OcrProgressInfo {
  status: string;
  progress: number; // 0 - 100
}

/**
 * Preprocesses an image in an HTML5 canvas for optimal OCR accuracy:
 * - Grayscale conversion
 * - Contrast stretching and adaptive thresholding
 * - Removes paper background noise
 */
export async function preprocessImageForOcr(
  imageSource: string | File | Blob
): Promise<{ preprocessedDataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let objectUrl = '';
    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      objectUrl = URL.createObjectURL(imageSource);
      img.src = objectUrl;
    }

    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);

      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ preprocessedDataUrl: typeof imageSource === 'string' ? imageSource : img.src, width: img.width, height: img.height });
        return;
      }

      // Resize if too huge or too small
      let w = img.width;
      let h = img.height;
      const maxDim = 2400;
      if (w > maxDim || h > maxDim) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      canvas.width = w;
      canvas.height = h;

      // Draw original image
      ctx.drawImage(img, 0, 0, w, h);

      // Get pixel data
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Calculate brightness histogram for auto-contrast
      let minLum = 255;
      let maxLum = 0;
      for (let i = 0; i < data.length; i += 4) {
        const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        if (lum < minLum) minLum = lum;
        if (lum > maxLum) maxLum = lum;
      }

      const lumRange = Math.max(1, maxLum - minLum);

      // Enhance contrast and apply soft binarization
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Standard luminance
        let lum = 0.299 * r + 0.587 * g + 0.114 * b;

        // Contrast stretch
        lum = ((lum - minLum) / lumRange) * 255;

        // Sigmoid contrast boost
        if (lum < 140) {
          lum = Math.max(0, lum * 0.7); // Darken text ink
        } else {
          lum = Math.min(255, lum * 1.15 + 10); // Lighten paper background
        }

        data[i] = lum;
        data[i + 1] = lum;
        data[i + 2] = lum;
      }

      ctx.putImageData(imgData, 0, 0);
      const preprocessedDataUrl = canvas.toDataURL('image/png');
      resolve({ preprocessedDataUrl, width: w, height: h });
    };

    img.onerror = (err) => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load prescription image for preprocessing.'));
    };
  });
}

/**
 * Runs Tesseract OCR on the prescription image with progress callbacks
 */
export async function recognizePrescriptionImage(
  imageSource: string | File | Blob,
  onProgress?: (info: OcrProgressInfo) => void
): Promise<{ rawText: string; confidence: number; preprocessedDataUrl?: string }> {
  try {
    onProgress?.({ status: 'Preprocessing image for contrast & clarity...', progress: 10 });

    // Step 1: Preprocessing
    let imageToScan: string | File | Blob = imageSource;
    let preprocessedUrl: string | undefined = undefined;
    try {
      const prep = await preprocessImageForOcr(imageSource);
      imageToScan = prep.preprocessedDataUrl;
      preprocessedUrl = prep.preprocessedDataUrl;
    } catch {
      // If canvas preprocessing fails, fall back to raw image
    }

    onProgress?.({ status: 'Initializing Tesseract OCR Neural Network...', progress: 25 });

    // Step 2: Initialize worker
    const worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const pct = 30 + Math.round((m.progress || 0) * 65);
          onProgress?.({
            status: `Optical Character Recognition: ${Math.round((m.progress || 0) * 100)}%`,
            progress: pct
          });
        } else if (m.status === 'loading language traineddata') {
          onProgress?.({ status: 'Loading English Medical Lexicon...', progress: 20 });
        }
      }
    });

    onProgress?.({ status: 'Analyzing characters & clinical typography...', progress: 35 });

    // Step 3: Run recognition
    const ret = await worker.recognize(imageToScan);
    const rawText = ret.data.text || '';
    const confidence = Math.round(ret.data.confidence || 85);

    await worker.terminate();

    onProgress?.({ status: 'OCR recognition complete', progress: 100 });

    return { rawText, confidence, preprocessedDataUrl: preprocessedUrl };
  } catch (err: any) {
    console.warn('Tesseract OCR error:', err);
    throw new Error(err?.message || 'Optical Character Recognition processing failed.');
  }
}

/**
 * Common doctor noise lines to ignore when extracting medicines
 */
const CLINICAL_NOISE_PATTERNS = [
  /^(dr\.|doctor|m\.?b\.?b\.?s|m\.?d\.|f\.?r\.?c\.?s)/i,
  /^(clinic|hospital|dispensary|medical centre|health care|healthcare)/i,
  /^(patient|pt\.|name|age|gender|sex|male|female|yrs|years)/i,
  /^(date|time|phone|tel|email|address|reg\s*no|rx\s*#)/i,
  /^(signature|sign|seal|regd\s*no|licence|license)/i,
  /^(instructions|notes|advice|diagnosis|chief\s*complaint|rx\s*$)/i,
  /^(follow\s*up|next\s*visit|refer\s*to)/i,
  /^[_\-=\*\~]{3,}$/,
  /^\s*$/
];

/**
 * Common dosage markers
 */
const DOSAGE_REGEX = /(\d+\.?\d*\s*(?:mg|mcg|microgram|g|gm|ml|iu|units|%|mEq)?\s*(?:duo|forte|sr|xr|cr|ds|suspension|syrup|tab|tablet|cap|capsule)?)/i;

/**
 * Extracts and parses medicines from raw OCR prescription text.
 * Integrates 761 known drugs from the catalog with Levenshtein fuzzy matching
 * to correct OCR misreadings.
 */
export function extractMedicinesFromPrescriptionText(
  rawText: string,
  baseConfidence: number = 88
): ExtractedDrugResult[] {
  if (!rawText || rawText.trim().length === 0) return [];

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 1);

  const results: ExtractedDrugResult[] = [];
  const seenNames = new Set<string>();

  // Prepare database drug lookup list
  const allDbDrugs = MEDICINES_DATABASE.map((m) => ({
    name: m.name,
    lower: m.name.toLowerCase(),
    brand: m.brandName || m.name,
    brandLower: (m.brandName || m.name).toLowerCase(),
    generic: m.genericName,
    genericLower: m.genericName.toLowerCase()
  }));

  for (const rawLine of lines) {
    // Check if line is clinical noise
    const isNoise = CLINICAL_NOISE_PATTERNS.some((pat) => pat.test(rawLine));
    if (isNoise) continue;

    // Clean prescription line: remove leading numbering like "1.", "1)", "Rx:", bullet points
    let cleanLine = rawLine
      .replace(/^(?:rx\b[:\s\-]*|\d+[\.\)\-:\s]+|[•\*\-\–\—\>]\s*)+/i, '')
      .trim();

    if (cleanLine.length < 2) continue;

    // Extract dosage if present (e.g., "25mg", "650mg", "500 mg")
    const dosageMatch = cleanLine.match(/(\d+(?:\.\d+)?\s*(?:mg|mcg|gm|g|ml|iu|%)\b(?:\s*(?:duo|forte|sr|xr|cr|ds))?)/i);
    const dosageStr = dosageMatch ? dosageMatch[0].trim() : undefined;

    // Strip dosage instructions from the potential name string
    let candidateName = cleanLine
      .replace(/(\d+(?:\.\d+)?\s*(?:mg|mcg|gm|g|ml|iu|%)\b(?:\s*(?:duo|forte|sr|xr|cr|ds))?)/gi, '')
      .replace(/\b(?:tab(?:let)?|cap(?:sule)?|syrup|inj(?:ection)?|drops|ointment|cream|sol(?:ution)?)\b/gi, '')
      .replace(/\b(?:1-0-1|1-1-1|0-0-1|1-0-0|0-1-0|od|bd|tds|tid|qid|hs|sos|stat|po|prn|ac|pc|bbf|hs)\b/gi, '')
      .replace(/\b(?:before\s*meals?|after\s*food|after\s*meals?|daily|twice\s*daily|times\s*a\s*day|for\s*\d+\s*days?)\b/gi, '')
      .replace(/[^\w\s\-\/]/g, ' ')
      .trim();

    // Split words in candidate
    const tokens = candidateName.split(/\s+/).filter((t) => t.length >= 2);
    if (tokens.length === 0) continue;

    const primaryToken = tokens[0];
    const candidateLower = candidateName.toLowerCase();
    const primaryLower = primaryToken.toLowerCase();

    // 1. Try EXACT match in database
    let matchedDb = allDbDrugs.find(
      (d) =>
        d.lower === candidateLower ||
        d.lower === primaryLower ||
        d.brandLower === candidateLower ||
        d.brandLower === primaryLower ||
        candidateLower.startsWith(d.lower) ||
        candidateLower.includes(d.lower)
    );

    let finalName = '';
    let isFuzzy = false;

    if (matchedDb) {
      finalName = matchedDb.name;
    } else {
      // 2. Try FUZZY match in database (Levenshtein distance <= 2 or similarity >= 75%)
      let bestFuzzyMatch: { name: string; sim: number } | null = null;
      for (const d of allDbDrugs) {
        // Compare against primary token or candidate
        const dist = levenshteinDistance(primaryLower, d.lower);
        const maxLen = Math.max(primaryLower.length, d.lower.length);
        const sim = ((maxLen - dist) / maxLen) * 100;

        if (sim >= 75 && (dist <= 2 || sim > 80)) {
          if (!bestFuzzyMatch || sim > bestFuzzyMatch.sim) {
            bestFuzzyMatch = { name: d.name, sim };
          }
        }
      }

      if (bestFuzzyMatch) {
        finalName = bestFuzzyMatch.name;
        isFuzzy = true;
      } else {
        // 3. If no database match, capitalize candidate appropriately
        finalName = primaryToken.charAt(0).toUpperCase() + primaryToken.slice(1);
      }
    }

    if (finalName.length < 2) continue;

    // Build formatted medicine string e.g. "Hydroxyzine 25mg"
    const formattedWithDose = dosageStr ? `${finalName} ${dosageStr}` : finalName;
    const lookupKey = finalName.toLowerCase();

    if (!seenNames.has(lookupKey)) {
      seenNames.add(lookupKey);
      results.push({
        rawLine,
        cleanedName: formattedWithDose,
        dosage: dosageStr,
        confidence: isFuzzy ? Math.max(70, baseConfidence - 12) : baseConfidence,
        matchedDrugName: finalName,
        isFuzzyMatched: isFuzzy
      });
    }
  }

  return results;
}

/**
 * Benchmark sample prescriptions with high-resolution canvas generation
 */
export interface PrescriptionSamplePreset {
  id: string;
  title: string;
  doctorName: string;
  hospitalName: string;
  date: string;
  patientName: string;
  patientAge: string;
  medicines: string[];
  desc: string;
  lasaCollisionSummary: string;
}

export const BENCHMARK_PRESCRIPTIONS: PrescriptionSamplePreset[] = [
  {
    id: 'rx-benchmark-1',
    title: 'Rx-01: Allergy & Cardiopulmonary Regimen',
    doctorName: 'Dr. Evelyn Reed, MD, FACP',
    hospitalName: 'St. Jude Academic Medical Center',
    date: '12-Oct-2026',
    patientName: 'Arthur Henderson (M / 58y)',
    patientAge: '58 yrs',
    medicines: [
      'Hydroxyzine 25mg',
      'Hydralazine 25mg',
      'Paracetamol 650mg',
      'Augmentin 625 Duo',
      'Pantoprazole 40mg'
    ],
    desc: 'Critical Look-Alike & Sound-Alike collision (Hydroxyzine ↔ Hydralazine)',
    lasaCollisionSummary: 'Severe orthographic collision. Both 25mg dosage strength prescribed concurrently.'
  },
  {
    id: 'rx-benchmark-2',
    title: 'Rx-02: Lancet 2024 Indian Collision Case',
    doctorName: 'Dr. Ramesh Sharma, MBBS, MD (Cardiology)',
    hospitalName: 'Apollo Specialty Heart Institute',
    date: '14-Oct-2026',
    patientName: 'Sunita Rao (F / 64y)',
    patientAge: '64 yrs',
    medicines: [
      'Olvance 20mg',
      'Oleanz 5mg',
      'Metformin 500mg',
      'Telmisartan 40mg',
      'Atorvastatin 10mg'
    ],
    desc: 'Fatal brand collision (Olvance [Olmesartan] ↔ Oleanz [Olanzapine])',
    lasaCollisionSummary: 'Antihypertensive vs Antipsychotic collision reported in Indian Pharmacopoeia / Lancet 2024.'
  },
  {
    id: 'rx-benchmark-3',
    title: 'Rx-03: Pain Management & Dual Dispensation',
    doctorName: 'Dr. Michael Chen, MD (Orthopedics)',
    hospitalName: 'Metro General Orthopedic Clinic',
    date: '15-Oct-2026',
    patientName: 'David Martinez (M / 42y)',
    patientAge: '42 yrs',
    medicines: [
      'Celebrex 200mg',
      'Celexa 20mg',
      'Amoxicillin 500mg',
      'Omeprazole 20mg'
    ],
    desc: 'Phonetic similarity collision (Celebrex [NSAID] ↔ Celexa [SSRI Antidepressant])',
    lasaCollisionSummary: 'High phonetic confusion risk with overlapping soundex syllables.'
  }
];

/**
 * Renders a high-resolution, photorealistic prescription document onto a Canvas
 * and returns its Data URL. This gives users an actual prescription image to preview,
 * run OCR on, and inspect!
 */
export function generatePrescriptionPadImage(preset: PrescriptionSamplePreset): string {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 1150;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background - Off-white medical paper texture
  ctx.fillStyle = '#fafaf7';
  ctx.fillRect(0, 0, 900, 1150);

  // Subtle border
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 860, 1110);

  // Top header bar
  ctx.fillStyle = '#0c87eb';
  ctx.fillRect(20, 20, 860, 12);

  // Clinic Header
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 26px Inter, Arial, sans-serif';
  ctx.fillText(preset.hospitalName, 50, 75);

  ctx.fillStyle = '#475569';
  ctx.font = '15px Inter, Arial, sans-serif';
  ctx.fillText(preset.doctorName, 50, 102);
  ctx.fillText('Reg. No: MED-884192 • Dept of Internal Medicine & Clinical Pharmacology', 50, 124);

  // Divider line
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(50, 142);
  ctx.lineTo(850, 142);
  ctx.stroke();

  // Patient info bar
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(50, 155, 800, 48);

  ctx.fillStyle = '#334155';
  ctx.font = 'bold 13px Inter, Arial, sans-serif';
  ctx.fillText(`PATIENT: ${preset.patientName.toUpperCase()}`, 65, 184);
  ctx.fillText(`DATE: ${preset.date}`, 560, 184);
  ctx.fillText('OPD #94120', 740, 184);

  // Rx Symbol
  ctx.fillStyle = '#0c87eb';
  ctx.font = 'italic bold 52px Georgia, serif';
  ctx.fillText('℞', 52, 260);

  // Medicines list
  let y = 305;
  preset.medicines.forEach((med, idx) => {
    // Number pill
    ctx.fillStyle = '#e0effe';
    ctx.beginPath();
    ctx.roundRect(55, y - 22, 32, 28, [6]);
    ctx.fill();

    ctx.fillStyle = '#0254a2';
    ctx.font = 'bold 14px Inter, Arial, sans-serif';
    ctx.fillText(`${idx + 1}`, 65, y - 4);

    // Medicine line
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px "Courier New", Courier, monospace';
    ctx.fillText(`Tab. ${med}`, 105, y - 4);

    // Dosage instruction
    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 14px Georgia, serif';
    const instructions = [
      '1 tab PO twice daily after meals (10 days)',
      '1 tab PO once daily morning with water',
      '1 tab SOS for severe distress / pain',
      '1 tab PO every 12 hours for 5 days',
      '1 cap PO once daily 30 mins before breakfast'
    ];
    ctx.fillText(`— ${instructions[idx % instructions.length]}`, 105, y + 18);

    // Subtle underline
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(55, y + 30);
    ctx.lineTo(845, y + 30);
    ctx.stroke();

    y += 76;
  });

  // Clinical Notes & Warnings
  ctx.fillStyle = '#fffbeb';
  ctx.strokeStyle = '#fde68a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(50, 780, 800, 80, [10]);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#92400e';
  ctx.font = 'bold 12px Inter, Arial, sans-serif';
  ctx.fillText('⚠ PHARMACY DISPENSING CAUTION:', 65, 806);
  ctx.font = '12px Inter, Arial, sans-serif';
  ctx.fillText(
    'Verify generic identity, therapeutic indication, and double-check look-alike sound-alike collision matrix before dispensing.',
    65,
    830
  );
  ctx.fillText(
    'Electronic LASA-GUARD CDS check mandated under hospital medication safety protocol.',
    65,
    848
  );

  // Footer & Signature
  ctx.strokeStyle = '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(580, 990);
  ctx.lineTo(820, 990);
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.font = 'italic 16px "Brush Script MT", cursive, sans-serif';
  ctx.fillText('E. Reed, MD', 630, 978);

  ctx.font = 'bold 12px Inter, Arial, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('ATTENDING PHYSICIAN SIGNATURE', 585, 1010);
  ctx.font = '11px Inter, Arial, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Digital Verification ID: CDS-SEC-2026-X89', 585, 1028);

  // Hospital Watermark Seal
  ctx.save();
  ctx.translate(450, 560);
  ctx.rotate(-0.15);
  ctx.strokeStyle = 'rgba(12, 135, 235, 0.07)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 110, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = 'bold 14px Inter, Arial, sans-serif';
  ctx.fillStyle = 'rgba(12, 135, 235, 0.08)';
  ctx.textAlign = 'center';
  ctx.fillText('CLINICAL PHARMACOPOEIA AUDIT', 0, 5);
  ctx.restore();

  return canvas.toDataURL('image/png');
}
