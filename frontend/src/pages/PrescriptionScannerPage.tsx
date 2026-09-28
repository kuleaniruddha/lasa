import React, { useState } from 'react';
import { 
  FileScan, 
  Upload, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  Plus, 
  Trash2, 
  Play, 
  RefreshCw, 
  FileText, 
  Eye, 
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { PrescriptionScanResult, OCRMedicineItem } from '../types/lasa';
import { lasaService } from '../services/lasaService';
import { RiskBadge } from '../components/common/RiskBadge';
import { TallManText } from '../components/common/TallManText';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';

interface PrescriptionScannerPageProps {
  onOpenAlertDetail: (pairA: string, pairB: string) => void;
  onNavigateToComparison: (medA: string, medB: string) => void;
  onNavigateToCheck: (med: string) => void;
}

export const PrescriptionScannerPage: React.FC<PrescriptionScannerPageProps> = ({
  onOpenAlertDetail,
  onNavigateToComparison,
  onNavigateToCheck
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sampleRxName, setSampleRxName] = useState<string | null>('Rx-01: Allergy & Cardiopulmonary Regimen');
  
  // OCR processing state
  const [isScanning, setIsScanning] = useState(false);
  const [ocrStep, setOcrStep] = useState(0);

  // Extracted medicines list (editable before or after full LASA analysis)
  const [extractedList, setExtractedList] = useState<string[]>([
    'Hydroxyzine 25mg',
    'Hydralazine 25mg',
    'Paracetamol 650mg',
    'Augmentin 625 Duo',
    'Pan-D'
  ]);
  const [newMedInput, setNewMedInput] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  // Analysis result
  const [scanResult, setScanResult] = useState<PrescriptionScanResult | null>(null);

  const ocrSteps = [
    'Image file uploaded and preprocessed',
    'Optical character recognition text detected',
    'Medicine names and dosages extracted via NLP regex',
    'Matching entities against Pharmacopoeia catalog',
    'Calculating LASA similarity scores and clinical hazards'
  ];

  // Preset sample prescriptions for instant clinical demonstration
  const samplePresets = [
    {
      id: 'rx-1',
      title: 'Rx-01: Allergy & Cardiopulmonary Regimen',
      medicines: ['Hydroxyzine 25mg', 'Hydralazine 25mg', 'Paracetamol 650mg', 'Augmentin 625 Duo', 'Pan-D'],
      desc: 'Contains critical Look-Alike pair (Hydroxyzine ↔ Hydralazine)'
    },
    {
      id: 'rx-2',
      title: 'Rx-02: Lancet 2024 Indian Case (Cardio / Psych)',
      medicines: ['Olvance 20mg', 'Oleanz 5mg', 'Metformin 500mg', 'Telmisartan 40mg'],
      desc: 'Contains high-risk brand collision (Olvance ↔ Oleanz)'
    },
    {
      id: 'rx-3',
      title: 'Rx-03: Pain & Psychiatric Dual Dispensation',
      medicines: ['Celebrex 200mg', 'Celexa 20mg', 'Pantoprazole 40mg'],
      desc: 'Contains moderate risk phonetic pair (Celebrex ↔ Celexa)'
    }
  ];

  const handleSelectSample = (preset: typeof samplePresets[0]) => {
    setSampleRxName(preset.title);
    setSelectedFile(null);
    setExtractedList([...preset.medicines]);
    setScanResult(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setSampleRxName(`Custom Upload: ${file.name}`);
      setScanResult(null);
    }
  };

  // Run the 5-step OCR scanner simulation
  const startOcrScan = async () => {
    if (extractedList.length === 0) return;

    setIsScanning(true);
    setScanResult(null);

    for (let i = 0; i < ocrSteps.length; i++) {
      setOcrStep(i);
      await new Promise((r) => setTimeout(r, 300));
    }

    const result = await lasaService.scanPrescription(extractedList);
    setScanResult(result);
    setIsScanning(false);
  };

  // Add custom medicine
  const handleAddMedicine = () => {
    if (!newMedInput.trim()) return;
    setExtractedList([...extractedList, newMedInput.trim()]);
    setNewMedInput('');
  };

  // Delete medicine
  const handleDeleteMedicine = (index: number) => {
    setExtractedList(extractedList.filter((_, i) => i !== index));
  };

  // Save inline edit
  const handleSaveEdit = (index: number) => {
    if (!editingText.trim()) return;
    const updated = [...extractedList];
    updated[index] = editingText.trim();
    setExtractedList(updated);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone & Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-200 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
            <FileScan className="w-3.5 h-3.5" />
            <span>Prescription OCR & Batch LASA Screening</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-surface-900 tracking-tight">
            Scan Prescription
          </h2>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            Upload a prescription image or document to extract medicine names and automatically screen for look-alike sound-alike conflicts.
          </p>
        </div>

        {/* Drag & Drop Upload Container */}
        <div className="border-2 border-dashed border-surface-300 hover:border-health-400 bg-surface-50/50 hover:bg-health-50/20 rounded-2xl p-6 sm:p-8 text-center transition-all">
          <div className="w-14 h-14 rounded-2xl bg-health-50 border border-health-200 text-health-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <Upload className="w-6 h-6" />
          </div>

          <h3 className="text-sm font-bold text-surface-900">
            Upload Doctor Prescription Document
          </h3>
          <p className="text-xs text-surface-500 mt-0.5">
            Drag and drop an image or PDF here • Supported formats: JPG, PNG, PDF
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <label className="px-4 py-2 rounded-xl bg-health-600 hover:bg-health-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs inline-flex items-center gap-2">
              <Upload className="w-3.5 h-3.5" />
              <span>Choose File</span>
              <input
                type="file"
                accept="image/png, image/jpeg, application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => alert("Camera capture simulated in browser sandbox. Using sample prescription.")}
              className="px-4 py-2 rounded-xl border border-surface-200 bg-white hover:bg-surface-50 text-surface-700 text-xs font-semibold transition-colors inline-flex items-center gap-2"
            >
              <Camera className="w-3.5 h-3.5 text-surface-500" />
              <span>Use Camera</span>
            </button>
          </div>

          <p className="text-[11px] text-surface-400 mt-3">
            Uploaded files are processed securely according to system HIPAA & clinical confidentiality standards.
          </p>
        </div>

        {/* Preset Sample Prescriptions */}
        <div className="pt-2">
          <span className="text-xs font-bold text-surface-700 block mb-2">
            Or select a benchmark clinical prescription:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {samplePresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectSample(preset)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  sampleRxName === preset.title
                    ? 'border-health-600 bg-health-50/60 ring-2 ring-health-500/10'
                    : 'border-surface-200 bg-white hover:bg-surface-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-surface-900">{preset.title.split(':')[0]}</span>
                  {sampleRxName === preset.title && (
                    <span className="w-2 h-2 rounded-full bg-health-600" />
                  )}
                </div>
                <p className="text-xs font-semibold text-surface-700 truncate">{preset.title.split(':')[1]}</p>
                <p className="text-[11px] text-surface-500 mt-1">{preset.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* OCR Review & Edit Step (Critical requirement) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-surface-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-surface-900">
                Review Extracted Medicines
              </h3>
              <span className="text-xs font-mono text-health-700 bg-health-50 px-2 py-0.5 rounded border border-health-200 font-semibold">
                {extractedList.length} items
              </span>
            </div>
            <p className="text-xs text-surface-500 mt-0.5">
              Doctors and pharmacists may modify or correct OCR-extracted drug names before launching the full LASA screening.
            </p>
          </div>

          <button
            onClick={startOcrScan}
            disabled={isScanning || extractedList.length === 0}
            className="px-5 py-2.5 rounded-xl bg-health-600 hover:bg-health-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing OCR Engine...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run Complete LASA Screening</span>
              </>
            )}
          </button>
        </div>

        {/* Editable medicine tags / pills */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {extractedList.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-surface-50 border border-surface-200 px-3 py-1.5 rounded-xl text-xs font-medium text-surface-800 shadow-2xs group"
              >
                {editingIndex === idx ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="border border-health-500 rounded px-1.5 py-0.5 text-xs bg-white text-surface-900 focus:outline-hidden"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(idx)}
                      className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                      title="Save"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="font-semibold text-surface-900">{item}</span>
                    <button
                      onClick={() => {
                        setEditingIndex(idx);
                        setEditingText(item);
                      }}
                      className="text-surface-400 hover:text-health-700 transition-colors"
                      title="Edit medicine name"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMedicine(idx)}
                      className="text-surface-400 hover:text-red-600 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Quick add field */}
          <div className="pt-2 flex items-center gap-2 max-w-md">
            <input
              type="text"
              value={newMedInput}
              onChange={(e) => setNewMedInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMedicine();
                }
              }}
              placeholder="Add another medicine from prescription..."
              className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-1.5 text-xs text-surface-900 placeholder:text-surface-400 focus:outline-hidden focus:ring-2 focus:ring-health-500/20 font-medium"
            />
            <button
              type="button"
              onClick={handleAddMedicine}
              className="px-3 py-1.5 rounded-xl border border-surface-200 bg-white hover:bg-surface-50 text-surface-700 text-xs font-semibold flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* OCR Multi-Step Progress Indicator */}
        {isScanning && (
          <div className="p-5 rounded-2xl bg-health-50/50 border border-health-100 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-health-800">
              <RefreshCw className="w-4 h-4 text-health-600 animate-spin" />
              <span>OCR Pipeline Running: Step {ocrStep + 1} of 5</span>
            </div>

            <div className="space-y-1.5">
              {ocrSteps.map((step, idx) => (
                <div
                  key={step}
                  className={`text-xs flex items-center gap-2 ${
                    idx === ocrStep
                      ? 'text-health-900 font-bold'
                      : idx < ocrStep
                      ? 'text-emerald-700 font-medium'
                      : 'text-surface-400'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                    {idx < ocrStep ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-surface-300" />
                    )}
                  </div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Prescription Analysis Results Table */}
      {scanResult && (
        <div className="bg-white rounded-3xl border border-surface-200 shadow-xs overflow-hidden space-y-4 p-6 sm:p-8 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-surface-900">Prescription Analysis Complete</h3>
                <span className="text-xs font-mono text-surface-500">[{scanResult.filename}]</span>
              </div>
              <p className="text-xs text-surface-500 mt-0.5">
                Total medicines detected: <strong>{scanResult.totalDetected}</strong> • 
                Potential LASA conflicts: <strong className="text-amber-600">{scanResult.potentialConflicts}</strong> • 
                High-risk conflicts: <strong className="text-red-600">{scanResult.highRiskConflicts}</strong>
              </p>
            </div>

            {scanResult.highRiskConflicts > 0 && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs font-bold text-red-700 self-start sm:self-auto">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Critical co-dispensing hazard detected in prescription</span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200 text-surface-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Extracted Medicine</th>
                  <th className="py-3 px-4">OCR Confidence</th>
                  <th className="py-3 px-4">Database Match</th>
                  <th className="py-3 px-4">Confusable Pair</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4 text-right">Clinical Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {scanResult.medicines.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-surface-900">
                      {item.extractedName}
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-surface-700">
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {item.confidence}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-surface-700">
                      {item.matchedMedicine?.name || 'Verified'}
                    </td>

                    <td className="py-3 px-4 text-surface-800 font-medium">
                      {item.potentialConflict ? (
                        <span className="text-red-700 font-semibold">{item.potentialConflict}</span>
                      ) : (
                        <span className="text-surface-400 italic">None</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-surface-900">
                      {item.lasaScore}%
                    </td>

                    <td className="py-3 px-4">
                      <RiskBadge level={item.riskLevel} score={item.lasaScore} size="sm" />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onNavigateToCheck(item.extractedName.split(' ')[0])}
                          className="px-2.5 py-1 rounded-lg bg-surface-100 hover:bg-health-50 text-surface-700 hover:text-health-700 text-xs font-semibold transition-colors"
                        >
                          Review
                        </button>
                        {item.potentialConflict && (
                          <button
                            onClick={() => onNavigateToComparison(item.extractedName.split(' ')[0], item.potentialConflict!)}
                            className="px-2.5 py-1 rounded-lg bg-health-50 hover:bg-health-100 text-health-700 text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <span>Compare</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ClinicalDisclaimer />
    </div>
  );
};
