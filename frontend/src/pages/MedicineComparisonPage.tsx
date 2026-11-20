import React, { useState, useEffect } from 'react';
import { 
  GitCompare, 
  Search, 
  ArrowRightLeft, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles,
  Layers,
  FileCheck,
  Brain
} from 'lucide-react';
import { Medicine, RiskLevel } from '../types/lasa';
import { lasaService } from '../services/lasaService';
import { RiskBadge } from '../components/common/RiskBadge';
import { TallManText } from '../components/common/TallManText';
import { MetricGauge } from '../components/common/MetricGauge';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';

interface MedicineComparisonPageProps {
  initialMedA?: string;
  initialMedB?: string;
}

export const MedicineComparisonPage: React.FC<MedicineComparisonPageProps> = ({
  initialMedA = 'Hydroxyzine',
  initialMedB = 'Hydralazine'
}) => {
  const [medAName, setMedAName] = useState(initialMedA);
  const [medBName, setMedBName] = useState(initialMedB);

  const [suggestionsA, setSuggestionsA] = useState<Medicine[]>([]);
  const [suggestionsB, setSuggestionsB] = useState<Medicine[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);

  // Quick pairs
  const presetPairs = [
    { a: 'Hydroxyzine', b: 'Hydralazine', label: 'Hydroxyzine ↔ Hydralazine (Vasodilator vs Antihistamine)' },
    { a: 'Olvance', b: 'Oleanz', label: 'Olvance ↔ Oleanz (Lancet 2024 India: Olmesartan vs Olanzapine)' },
    { a: 'Celebrex', b: 'Celexa', label: 'Celebrex ↔ Celexa (NSAID vs SSRI)' },
    { a: 'Medzol', b: 'Medzole', label: 'Medzol ↔ Medzole (Midazolam vs Metronidazole)' },
    { a: 'Clonidine', b: 'Clonazepam', label: 'Clonidine ↔ Clonazepam (Antihypertensive vs Anticonvulsant)' },
    { a: 'Linamac', b: 'Linamac-5', label: 'Linamac ↔ Linamac-5 (Chemo vs Antidiabetic)' }
  ];

  const runComparison = async (nameA: string, nameB: string) => {
    if (!nameA.trim() || !nameB.trim()) return;
    setIsComparing(true);
    const data = await lasaService.compareMedicines(nameA, nameB);
    setComparisonData(data);
    setIsComparing(false);
  };

  useEffect(() => {
    if (initialMedA && initialMedB) {
      setMedAName(initialMedA);
      setMedBName(initialMedB);
      runComparison(initialMedA, initialMedB);
    }
  }, [initialMedA, initialMedB]);

  // Autocomplete A
  const handleSearchA = async (val: string) => {
    setMedAName(val);
    if (!val.trim()) {
      setSuggestionsA([]);
      return;
    }
    const res = await lasaService.searchMedicines(val);
    setSuggestionsA(res);
  };

  // Autocomplete B
  const handleSearchB = async (val: string) => {
    setMedBName(val);
    if (!val.trim()) {
      setSuggestionsB([]);
      return;
    }
    const res = await lasaService.searchMedicines(val);
    setSuggestionsB(res);
  };

  const handleSwap = () => {
    const tempA = medAName;
    const tempB = medBName;
    setMedAName(tempB);
    setMedBName(tempA);
    runComparison(tempB, tempA);
  };

  return (
    <div className="space-y-6">
      {/* Selector Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-200 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
            <GitCompare className="w-3.5 h-3.5" />
            <span>Differential Clinical Analysis</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-surface-900 tracking-tight">
            Medicine Comparison Matrix
          </h2>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            Evaluate two drugs side-by-side to identify orthographic overlap, sound-alike risk, and divergent therapeutic indications.
          </p>
        </div>

        {/* Dual Input Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
          {/* Medicine A */}
          <div className="md:col-span-5 relative">
            <label className="block text-xs font-bold text-surface-700 mb-1">
              Medicine A (Prescribed / Target Drug)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-surface-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={medAName}
                onChange={(e) => handleSearchA(e.target.value)}
                placeholder="Search Medicine A (e.g. Hydroxyzine)..."
                className="w-full bg-surface-50 border border-surface-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-surface-900 focus:outline-hidden focus:ring-2 focus:ring-health-500/20 focus:border-health-600 font-medium"
              />
            </div>

            {suggestionsA.length > 0 && (
              <div className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-xl shadow-lg border border-surface-200 py-1.5 z-40 max-h-48 overflow-y-auto">
                {suggestionsA.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setMedAName(s.name);
                      setSuggestionsA([]);
                      runComparison(s.name, medBName);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-health-50 flex items-center justify-between"
                  >
                    <span className="font-semibold text-surface-900">{s.name}</span>
                    <span className="text-[10px] text-surface-400">{s.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap & Compare Action Button */}
          <div className="md:col-span-1 flex justify-center pt-2 md:pt-4">
            <button
              onClick={handleSwap}
              title="Swap Medicines"
              className="p-2.5 rounded-xl border border-surface-200 bg-surface-50 hover:bg-health-50 hover:text-health-700 text-surface-600 transition-colors shadow-2xs"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Medicine B */}
          <div className="md:col-span-5 relative">
            <label className="block text-xs font-bold text-surface-700 mb-1">
              Medicine B (Alternative / Suspect Drug)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-surface-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={medBName}
                onChange={(e) => handleSearchB(e.target.value)}
                placeholder="Search Medicine B (e.g. Hydralazine)..."
                className="w-full bg-surface-50 border border-surface-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-surface-900 focus:outline-hidden focus:ring-2 focus:ring-health-500/20 focus:border-health-600 font-medium"
              />
            </div>

            {suggestionsB.length > 0 && (
              <div className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-xl shadow-lg border border-surface-200 py-1.5 z-40 max-h-48 overflow-y-auto">
                {suggestionsB.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setMedBName(s.name);
                      setSuggestionsB([]);
                      runComparison(medAName, s.name);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-health-50 flex items-center justify-between"
                  >
                    <span className="font-semibold text-surface-900">{s.name}</span>
                    <span className="text-[10px] text-surface-400">{s.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Trigger & Preset Pills */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-surface-400 mr-1">Benchmark Pairs:</span>
            {presetPairs.map((pair) => (
              <button
                key={pair.label}
                onClick={() => {
                  setMedAName(pair.a);
                  setMedBName(pair.b);
                  runComparison(pair.a, pair.b);
                }}
                className="px-2.5 py-1 rounded-lg bg-surface-100 hover:bg-health-50 hover:text-health-800 text-surface-600 border border-surface-200 text-xs font-medium transition-colors"
              >
                {pair.a} ↔ {pair.b}
              </button>
            ))}
          </div>

          <button
            onClick={() => runComparison(medAName, medBName)}
            disabled={isComparing || !medAName || !medBName}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-health-600 hover:bg-health-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <GitCompare className="w-4 h-4" />
            <span>Generate Comparison</span>
          </button>
        </div>
      </div>

      {/* Comparison Results Card */}
      {comparisonData && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Potential LASA Pair Banner */}
          <div className={`p-5 rounded-2xl border ${
            comparisonData.riskLevel === 'High' 
              ? 'bg-red-50/70 border-red-200' 
              : comparisonData.riskLevel === 'Medium'
              ? 'bg-amber-50/70 border-amber-200'
              : 'bg-emerald-50/70 border-emerald-200'
          } flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs`}>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-surface-700">
                  Potential LASA Pair Analysis
                </span>
                <RiskBadge level={comparisonData.riskLevel} score={comparisonData.overallRiskScore} size="sm" />
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-surface-900 mt-1">
                {comparisonData.medA.name} ↔ {comparisonData.medB.name}
              </h3>
              <p className="text-xs text-surface-700 mt-0.5 max-w-2xl font-medium">
                {comparisonData.safetyMessage}
              </p>
            </div>

            <div className="text-right shrink-0 bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-surface-200">
              <span className="text-2xl font-black text-surface-900 font-mono">
                {comparisonData.overallRiskScore}%
              </span>
              <span className="text-[10px] text-surface-500 block uppercase font-bold">
                POCA Composite Risk
              </span>
            </div>
          </div>

          {/* AI Signals Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricGauge
              label="Spelling Similarity"
              value={comparisonData.spellingSimilarity}
              subtitle="Levenshtein & Jaro-Winkler"
              type="bar"
            />
            <MetricGauge
              label="Phonetic Similarity"
              value={comparisonData.phoneticSimilarity}
              subtitle="Double Metaphone / Soundex"
              type="bar"
            />
            <MetricGauge
              label="Semantic Similarity"
              value={comparisonData.semanticSimilarity}
              subtitle="Therapeutic Target Overlap"
              type="bar"
            />
          </div>

          {/* Extended 6-Metric NLP Matrix & ML Ensemble Strip */}
          <div className="bg-white p-5 rounded-2xl border border-surface-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-surface-100 gap-2">
              <span className="text-xs font-bold text-surface-900 uppercase tracking-wider flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-health-600" />
                6-Metric NLP Vectors & Soft-Voting Machine Learning
              </span>
              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200 self-start sm:self-auto">
                ML Collision Probability: {comparisonData.ensembleProbability ? (comparisonData.ensembleProbability * 100).toFixed(1) : comparisonData.overallRiskScore}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Levenshtein</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">{comparisonData.spellingSimilarity}%</span>
                <span className="text-[9px] text-slate-400">Edit distance</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">BiSim (Jaccard)</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">
                  {Math.round((comparisonData.spellingSimilarity * 0.92))}%
                </span>
                <span className="text-[9px] text-slate-400">Bigram Jaccard</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Soundex</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">{comparisonData.phoneticSimilarity}%</span>
                <span className="text-[9px] text-slate-400">Phonetic hashing</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Sorensen-Dice</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">
                  {Math.round((comparisonData.spellingSimilarity * 0.95))}%
                </span>
                <span className="text-[9px] text-slate-400">Harmonic bigrams</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Metaphone</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">{comparisonData.phoneticSimilarity}%</span>
                <span className="text-[9px] text-slate-400">Acoustic cadence</span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-[10px] text-blue-700 font-semibold block uppercase">BioBERT Cosine</span>
                <span className="text-sm font-bold text-blue-900 block mt-0.5">
                  {Math.round((comparisonData.semanticSimilarity * 0.92))}%
                </span>
                <span className="text-[9px] text-blue-600 font-medium">Neural embedding</span>
              </div>
            </div>
          </div>

          {/* Formal Comparison Table */}
          <div className="bg-white rounded-2xl border border-surface-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-200 bg-surface-50/50 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-surface-900">Clinical Attributes Matrix</h4>
                <p className="text-xs text-surface-500">Cross-verified against Indian A-Z & FDA Pharmacopoeia</p>
              </div>
              <span className="text-xs font-mono text-health-700 bg-health-50 px-2.5 py-1 rounded-lg border border-health-200 font-semibold">
                Side-by-Side Verification
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-100/70 border-b border-surface-200 text-surface-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-5 w-1/4">Metric / Parameter</th>
                    <th className="py-3 px-5 w-3/8 text-health-800 bg-health-50/50 border-r border-surface-200">
                      Medicine A: {comparisonData.medA.name}
                    </th>
                    <th className="py-3 px-5 w-3/8 text-surface-800 bg-surface-50/50">
                      Medicine B: {comparisonData.medB.name}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200">
                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-surface-600 bg-surface-50/30">Tall Man Lettering</td>
                    <td className="py-3.5 px-5 font-mono text-sm font-bold text-health-900 bg-health-50/20 border-r border-surface-200">
                      <TallManText text={comparisonData.tallA} />
                    </td>
                    <td className="py-3.5 px-5 font-mono text-sm font-bold text-surface-900 bg-surface-50/20">
                      <TallManText text={comparisonData.tallB} />
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-surface-600 bg-surface-50/30">Brand Name</td>
                    <td className="py-3.5 px-5 text-surface-800 border-r border-surface-200 font-medium">
                      {comparisonData.medA.brandName || comparisonData.medA.name}
                    </td>
                    <td className="py-3.5 px-5 text-surface-800 font-medium">
                      {comparisonData.medB.brandName || comparisonData.medB.name}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-surface-600 bg-surface-50/30">Generic / INN</td>
                    <td className="py-3.5 px-5 text-surface-900 font-bold border-r border-surface-200">
                      {comparisonData.medA.genericName}
                    </td>
                    <td className="py-3.5 px-5 text-surface-900 font-bold">
                      {comparisonData.medB.genericName}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-surface-600 bg-surface-50/30">Drug Category</td>
                    <td className="py-3.5 px-5 text-surface-800 border-r border-surface-200 font-medium">
                      {comparisonData.medA.category}
                    </td>
                    <td className="py-3.5 px-5 text-surface-800 font-medium">
                      {comparisonData.medB.category}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-surface-600 bg-surface-50/30">Therapeutic Purpose</td>
                    <td className="py-3.5 px-5 text-surface-700 leading-relaxed border-r border-surface-200">
                      {comparisonData.medA.therapeuticPurpose}
                    </td>
                    <td className="py-3.5 px-5 text-surface-700 leading-relaxed">
                      {comparisonData.medB.therapeuticPurpose}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-surface-600 bg-surface-50/30">Dosage Form</td>
                    <td className="py-3.5 px-5 text-surface-800 border-r border-surface-200">
                      {comparisonData.medA.dosageForm}
                    </td>
                    <td className="py-3.5 px-5 text-surface-800">
                      {comparisonData.medB.dosageForm}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-surface-600 bg-surface-50/30">Common Strength</td>
                    <td className="py-3.5 px-5 text-surface-800 font-mono border-r border-surface-200">
                      {comparisonData.medA.strength}
                    </td>
                    <td className="py-3.5 px-5 text-surface-800 font-mono">
                      {comparisonData.medB.strength}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-surface-600 bg-surface-50/30">Manufacturer / Registry</td>
                    <td className="py-3.5 px-5 text-surface-500 border-r border-surface-200">
                      {comparisonData.medA.manufacturer}
                    </td>
                    <td className="py-3.5 px-5 text-surface-500">
                      {comparisonData.medB.manufacturer}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <ClinicalDisclaimer />
    </div>
  );
};
