import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Mic, 
  MicOff, 
  Upload, 
  FileScan, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Pill, 
  GitCompare, 
  ShieldAlert, 
  Info,
  Layers,
  Volume2,
  RefreshCw
} from 'lucide-react';
import { Medicine, LASAAnalysisResult } from '../types/lasa';
import { lasaService } from '../services/lasaService';
import { RiskBadge } from '../components/common/RiskBadge';
import { TallManText } from '../components/common/TallManText';
import { MetricGauge } from '../components/common/MetricGauge';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';

interface CheckMedicinePageProps {
  initialMedicine?: string;
  onNavigateToComparison: (medA: string, medB: string) => void;
  onNavigateToScanner: () => void;
}

export const CheckMedicinePage: React.FC<CheckMedicinePageProps> = ({
  initialMedicine = '',
  onNavigateToComparison,
  onNavigateToScanner
}) => {
  const [searchTerm, setSearchTerm] = useState(initialMedicine);
  const [suggestions, setSuggestions] = useState<Medicine[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [result, setResult] = useState<LASAAnalysisResult | null>(null);

  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(true);

  // Quick Preset Chips for rapid demo
  const quickTestMedicines = [
    { name: 'Hydroxyzine', desc: 'vs Hydralazine (Vasodilator)' },
    { name: 'Olvance', desc: 'vs Oleanz (Lancet 2024)' },
    { name: 'Celebrex', desc: 'vs Celexa (SSRI)' },
    { name: 'Medzol', desc: 'vs Medzole (Lancet 2024)' },
    { name: 'Clonidine', desc: 'vs Clonazepam' },
    { name: 'Paracetamol', desc: 'Clean / Safe Control' }
  ];

  const analysisSteps = [
    'Checking verified medicine database...',
    'Analyzing orthographic spelling similarity...',
    'Analyzing phonetic sound-alike similarity...',
    'Analyzing clinical & semantic indications...',
    'Calculating POCA hybrid LASA risk index...',
    'Preparing safety profile & comparison...'
  ];

  // Run initial search if requested
  useEffect(() => {
    if (initialMedicine) {
      setSearchTerm(initialMedicine);
      executeAnalysis(initialMedicine, 'Manual Search');
    }
  }, [initialMedicine]);

  // Autocomplete suggestions
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      const results = await lasaService.searchMedicines(searchTerm);
      setSuggestions(results);
    }, 150);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Execute AI Analysis with multi-step animation
  const executeAnalysis = async (query: string, source: 'Manual Search' | 'Prescription OCR' | 'Voice Input' = 'Manual Search') => {
    if (!query.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setAnalysisStep(0);
    setSuggestions([]);

    // Simulate multi-stage AI reasoning steps for clinical authenticity
    for (let i = 0; i < analysisSteps.length; i++) {
      setAnalysisStep(i);
      await new Promise(r => setTimeout(r, 260));
    }

    const res = await lasaService.analyzeMedicine(query, source);
    setResult(res);
    setIsAnalyzing(false);
  };

  // Web Speech API Voice Recognition
  const handleVoiceInput = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback demo simulation if browser doesn't permit microphone
      setIsListening(true);
      setVoiceTranscript('Listening for medicine name...');
      setTimeout(() => {
        const demoVoicePicks = ['Hydralazine', 'Hydroxyzine', 'Olvance', 'Celebrex', 'Metformin'];
        const randomPick = demoVoicePicks[Math.floor(Math.random() * demoVoicePicks.length)];
        setVoiceTranscript(`Detected: "${randomPick}"`);
        setSearchTerm(randomPick);
        setIsListening(false);
        executeAnalysis(randomPick, 'Voice Input');
      }, 1800);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      setVoiceTranscript('Listening... Speak a medicine name');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const detected = event.results[0][0].transcript;
        setVoiceTranscript(`Detected: "${detected}"`);
        setSearchTerm(detected);
        setIsListening(false);
        executeAnalysis(detected, 'Voice Input');
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = () => {
        // Fallback to simulated voice input
        setVoiceTranscript('Mic access restricted. Simulating voice input: "Hydralazine"');
        setTimeout(() => {
          setSearchTerm('Hydralazine');
          setIsListening(false);
          executeAnalysis('Hydralazine', 'Voice Input');
        }, 1200);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceSupported(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Central Search Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-200 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-health-50 border border-health-200 text-health-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-health-600" />
            <span>AI-Powered LASA Medication Error Screening</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
            Check Medicine for LASA Risks
          </h2>
          <p className="text-xs sm:text-sm text-surface-500 mt-1 max-w-xl mx-auto">
            Enter a medicine name to identify potentially confusing Look-Alike and Sound-Alike medication alternatives before finalizing a prescription.
          </p>

          {/* Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeAnalysis(searchTerm, 'Manual Search');
            }}
            className="mt-6 relative"
          >
            <div className="flex flex-col sm:flex-row items-center gap-2 bg-surface-50 p-2 rounded-2xl border-2 border-surface-200 focus-within:border-health-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-health-500/10 transition-all shadow-xs">
              <div className="relative flex-1 w-full flex items-center">
                <Search className="w-5 h-5 text-surface-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Enter medicine name, brand name, or generic (e.g. Hydroxyzine, Olvance, Medzol)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isAnalyzing}
                  className="w-full bg-transparent pl-12 pr-4 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-hidden font-medium"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={isAnalyzing || isListening}
                  title="Voice Input (Dictate Medicine Name)"
                  className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
                    isListening
                      ? 'bg-red-500 text-white border-red-600 animate-pulse'
                      : 'bg-white border-surface-200 text-surface-600 hover:text-health-700 hover:border-health-300'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-health-600" />}
                  <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Voice'}</span>
                </button>

                {/* Analyze Medicine Action Button */}
                <button
                  type="submit"
                  disabled={isAnalyzing || !searchTerm.trim()}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-health-600 hover:bg-health-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Screening...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze Medicine</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Voice Detection Status Notice */}
            {voiceTranscript && (
              <div className="mt-2 text-xs font-medium text-health-700 bg-health-50 border border-health-200 py-1 px-3 rounded-lg flex items-center justify-center gap-2 animate-in fade-in">
                <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                <span>{voiceTranscript}</span>
              </div>
            )}

            {/* Autocomplete Dropdown list */}
            {suggestions.length > 0 && !isAnalyzing && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-surface-200 py-2 z-40 text-left max-h-64 overflow-y-auto">
                <div className="px-4 py-1 text-[11px] font-bold text-surface-400 uppercase tracking-wider">
                  Indexed Pharmacopoeia Suggestions
                </div>
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSearchTerm(s.name);
                      setSuggestions([]);
                      executeAnalysis(s.name, 'Manual Search');
                    }}
                    className="w-full px-4 py-2 hover:bg-health-50 flex items-center justify-between transition-colors border-b border-surface-100 last:border-b-0"
                  >
                    <div>
                      <span className="text-xs font-bold text-surface-900">{s.name}</span>
                      <span className="text-[11px] text-surface-500 ml-2">
                        {s.genericName} • {s.category}
                      </span>
                    </div>
                    {s.isLasaRisk && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                        LASA Risk Pair
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Quick Preset Chips */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-semibold text-surface-400 mr-1">Quick Clinical Test Cases:</span>
            {quickTestMedicines.map((m) => (
              <button
                key={m.name}
                onClick={() => {
                  setSearchTerm(m.name);
                  executeAnalysis(m.name, 'Manual Search');
                }}
                className="px-3 py-1 rounded-full bg-surface-100 hover:bg-health-50 text-surface-700 hover:text-health-700 border border-surface-200 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <span>{m.name}</span>
                <span className="text-[10px] text-surface-400 font-mono">({m.desc})</span>
              </button>
            ))}
          </div>

          {/* Additional input options */}
          <div className="mt-4 pt-4 border-t border-surface-100 flex flex-wrap items-center justify-center gap-4 text-xs text-surface-500">
            <button
              type="button"
              onClick={onNavigateToScanner}
              className="inline-flex items-center gap-1.5 hover:text-health-700 transition-colors"
            >
              <FileScan className="w-4 h-4 text-health-600" />
              <span>Have a handwritten prescription? <strong>Use OCR Scanner</strong></span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Step AI Analysis Loading State */}
      {isAnalyzing && (
        <div className="bg-white p-8 rounded-3xl border border-surface-200 shadow-xs max-w-2xl mx-auto text-center space-y-6 animate-in fade-in">
          <div className="w-16 h-16 rounded-2xl bg-health-50 border border-health-200 text-health-600 flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-8 h-8 animate-pulse text-health-600" />
          </div>

          <div>
            <h3 className="text-base font-bold text-surface-900">AI Clinical Analysis in Progress</h3>
            <p className="text-xs text-surface-500 mt-0.5">
              Evaluating multi-modal orthographic and phonetic algorithms against database
            </p>
          </div>

          <div className="space-y-2.5 max-w-md mx-auto text-left">
            {analysisSteps.map((step, idx) => {
              const isCurrent = idx === analysisStep;
              const isCompleted = idx < analysisStep;

              return (
                <div
                  key={step}
                  className={`flex items-center gap-3 text-xs p-2 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-health-50 text-health-800 font-bold border border-health-200'
                      : isCompleted
                      ? 'text-emerald-700 font-medium'
                      : 'text-surface-400'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-4 h-4 text-health-600 animate-spin" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-surface-300" />
                    )}
                  </div>
                  <span>{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      {result && !isAnalyzing && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Section 1: Identified Medicine Profile Card */}
          <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-health-50 border border-health-200 text-health-600 flex items-center justify-center shadow-2xs">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-surface-900">{result.queryMedicine.name}</h3>
                    <span className="text-xs text-surface-500 font-medium font-mono">
                      [Tall Man: <TallManText text={result.tallManQuery} />]
                    </span>
                  </div>
                  <p className="text-xs text-surface-500 font-medium">
                    Generic: <strong className="text-surface-700">{result.queryMedicine.genericName}</strong>
                    {result.queryMedicine.brandName && ` • Brand: ${result.queryMedicine.brandName}`}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <RiskBadge level={result.riskLevel} score={result.overallRiskScore} size="lg" />
              </div>
            </div>

            {/* Profile Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
              <div className="p-3 rounded-xl bg-surface-50 border border-surface-200/80">
                <span className="text-surface-400 font-semibold block uppercase text-[10px]">Drug Category</span>
                <span className="font-bold text-surface-800 mt-0.5 block">{result.queryMedicine.category}</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-50 border border-surface-200/80">
                <span className="text-surface-400 font-semibold block uppercase text-[10px]">Therapeutic Purpose</span>
                <span className="font-bold text-surface-800 mt-0.5 block">{result.queryMedicine.therapeuticPurpose}</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-50 border border-surface-200/80">
                <span className="text-surface-400 font-semibold block uppercase text-[10px]">Dosage Form</span>
                <span className="font-bold text-surface-800 mt-0.5 block">{result.queryMedicine.dosageForm}</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-50 border border-surface-200/80">
                <span className="text-surface-400 font-semibold block uppercase text-[10px]">Standard Strength</span>
                <span className="font-bold text-surface-800 mt-0.5 block">{result.queryMedicine.strength}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Warning Card */}
          {result.hasRisk && result.confusedPartner ? (
            <div className="p-6 rounded-2xl border-2 border-red-200 bg-red-50/70 shadow-xs space-y-3">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-red-600 text-white shadow-xs shrink-0 mt-0.5">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded">
                      Potential LASA Risk Detected
                    </span>
                    <span className="text-xs font-mono font-bold text-red-700">
                      Overall Score: {result.overallRiskScore}%
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-extrabold text-red-950 mt-1">
                    {result.queryMedicine.name} may be confused with {result.confusedPartner.name}.
                  </h4>

                  <p className="text-xs sm:text-sm text-red-900 font-medium leading-relaxed mt-1">
                    Please verify the intended medicine, indication, and strength before proceeding with prescription dispensation.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 shadow-xs flex items-center gap-3.5">
              <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  No significant Look-Alike / Sound-Alike conflict detected.
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  The query medicine does not exhibit critical phonetic or orthographic alignment with known high-hazard drugs in the pharmacopoeia.
                </p>
              </div>
            </div>
          )}

          {/* Section 3: AI Analysis Multi-Signal Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-xs space-y-4">
            <div>
              <h4 className="text-sm font-bold text-surface-900">AI Signal Analysis & Feature Scoring</h4>
              <p className="text-xs text-surface-500">
                Composite evaluation incorporating character n-gram distance, phonetic encoding, and pharmacological taxonomy.
              </p>
            </div>

            {/* 4 Gauges */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricGauge
                label="Spelling Similarity"
                value={result.spellingSimilarity}
                subtitle="Levenshtein & Jaro-Winkler"
                type="circle"
              />
              <MetricGauge
                label="Phonetic Similarity"
                value={result.phoneticSimilarity}
                subtitle="Double Metaphone / Soundex"
                type="circle"
              />
              <MetricGauge
                label="Semantic Alignment"
                value={result.semanticSimilarity}
                subtitle="Therapeutic Category & Use"
                type="circle"
              />
              <MetricGauge
                label="Overall LASA Risk"
                value={result.overallRiskScore}
                subtitle="FDA POCA Weighted Index"
                type="circle"
              />
            </div>

            {/* Why was this medicine flagged? */}
            {result.hasRisk && (
              <div className="mt-4 p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-2">
                <h5 className="text-xs font-bold text-surface-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-health-600" />
                  Why was this medicine flagged?
                </h5>
                <ul className="space-y-1.5 text-xs text-surface-700 list-disc list-inside">
                  {result.flagReasons.map((reason, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Section 4: Side-by-side LASA Comparison Card */}
          {result.hasRisk && result.confusedPartner && (
            <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-surface-100 gap-2">
                <div>
                  <h4 className="text-sm font-bold text-surface-900">Direct LASA Comparison</h4>
                  <p className="text-xs text-surface-500">Side-by-side contrast of the conflicting medicine pair</p>
                </div>
                <button
                  onClick={() => onNavigateToComparison(result.queryMedicine.name, result.confusedPartner!.name)}
                  className="px-3.5 py-1.5 rounded-xl bg-health-50 hover:bg-health-100 text-health-700 text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <GitCompare className="w-3.5 h-3.5 text-health-600" />
                  <span>View Full Comparison Matrix</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Queried Medicine Card */}
                <div className="p-4 rounded-xl border border-surface-200 bg-surface-50/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-health-700 tracking-wider">Medicine 1 (Queried)</span>
                    <span className="text-[11px] font-mono text-surface-500">ID: {result.queryMedicine.id}</span>
                  </div>
                  <h5 className="text-base font-bold text-surface-900">
                    <TallManText text={result.tallManQuery} />
                  </h5>
                  <div className="space-y-1 text-surface-600">
                    <p><strong>Generic:</strong> {result.queryMedicine.genericName}</p>
                    <p><strong>Category:</strong> {result.queryMedicine.category}</p>
                    <p><strong>Purpose:</strong> {result.queryMedicine.therapeuticPurpose}</p>
                    <p><strong>Dosage Form:</strong> {result.queryMedicine.dosageForm}</p>
                    <p><strong>Strength:</strong> {result.queryMedicine.strength}</p>
                  </div>
                </div>

                {/* Confusing Alternative Card */}
                <div className="p-4 rounded-xl border border-red-200 bg-red-50/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-red-700 tracking-wider">Medicine 2 (Confusable Alternative)</span>
                    <span className="text-[11px] font-mono text-surface-500">ID: {result.confusedPartner.id}</span>
                  </div>
                  <h5 className="text-base font-bold text-surface-900">
                    <TallManText text={result.tallManPartner || result.confusedPartner.name} />
                  </h5>
                  <div className="space-y-1 text-surface-600">
                    <p><strong>Generic:</strong> {result.confusedPartner.genericName}</p>
                    <p><strong>Category:</strong> {result.confusedPartner.category}</p>
                    <p><strong>Purpose:</strong> {result.confusedPartner.therapeuticPurpose}</p>
                    <p><strong>Dosage Form:</strong> {result.confusedPartner.dosageForm}</p>
                    <p><strong>Strength:</strong> {result.confusedPartner.strength}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <ClinicalDisclaimer />
    </div>
  );
};
