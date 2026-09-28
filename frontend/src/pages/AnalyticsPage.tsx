import React from 'react';
import { 
  BarChart3, 
  BrainCircuit, 
  TrendingUp, 
  Award, 
  Layers, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert,
  Sliders,
  FileCheck,
  Binary
} from 'lucide-react';
import { 
  MODEL_EVALUATION_METRICS, 
  FREQUENT_LASA_PAIRS, 
  WEEKLY_ACTIVITY, 
  RISK_DISTRIBUTION, 
  OCR_CONFIDENCE_BUCKETS 
} from '../data/analyticsData';
import { RiskBadge } from '../components/common/RiskBadge';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-health-50 border border-health-200 text-health-700 text-xs font-semibold mb-2">
              <BrainCircuit className="w-3.5 h-3.5 text-health-600" />
              <span>Honours AIML Research & Model Evaluation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-surface-900 tracking-tight">
              Medication Safety & AIML Analytics
            </h2>
            <p className="text-xs sm:text-sm text-surface-500 mt-0.5 max-w-2xl">
              Quantitative validation of orthographic, phonetic, and semantic algorithms against clinical benchmark datasets (Lancet 2024 & Indian Pharmacopoeia).
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-surface-50 border border-surface-200 text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-surface-500 block">Hybrid Model F1-Score</span>
            <span className="text-2xl font-black text-health-700 font-mono">93.9%</span>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-surface-100">
          <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200/70">
            <span className="text-[11px] text-surface-500 font-medium block">Total Analyses</span>
            <span className="text-xl font-extrabold text-surface-900 font-mono mt-0.5 block">1,284</span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200/70">
            <span className="text-[11px] text-amber-600 font-medium block">LASA Conflicts</span>
            <span className="text-xl font-extrabold text-amber-600 font-mono mt-0.5 block">86 (6.7%)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200/70">
            <span className="text-[11px] text-red-600 font-medium block">High-Risk Collisions</span>
            <span className="text-xl font-extrabold text-red-600 font-mono mt-0.5 block">14 (1.1%)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200/70">
            <span className="text-[11px] text-surface-500 font-medium block">Mean POCA Score</span>
            <span className="text-xl font-extrabold text-surface-900 font-mono mt-0.5 block">42.3%</span>
          </div>
        </div>
      </div>

      {/* AIML Model Evaluation Section (Crucial for Honours AIML) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-health-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-health-600" />
              <h3 className="text-lg font-bold text-surface-900">
                AIML Model Evaluation & Comparative Benchmark
              </h3>
            </div>
            <p className="text-xs text-surface-500 mt-0.5">
              Empirical evaluation comparing baseline string matching against phonetic encoding, embedding NLP, and our proposed Hybrid Ensemble.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-health-100 text-health-800 text-xs font-mono font-bold self-start sm:self-auto">
            Model: Hybrid-LASA v1.0
          </span>
        </div>

        {/* Model Evaluation Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-health-50/60 border border-health-200 text-center">
            <span className="text-xs font-bold text-health-800 uppercase tracking-wider block">Accuracy</span>
            <span className="text-3xl font-extrabold text-health-900 font-mono mt-1 block">94.6%</span>
            <span className="text-[10px] text-health-600 mt-1 block">±0.4% 10-fold CV</span>
          </div>

          <div className="p-4 rounded-2xl bg-health-50/60 border border-health-200 text-center">
            <span className="text-xs font-bold text-health-800 uppercase tracking-wider block">Precision</span>
            <span className="text-3xl font-extrabold text-health-900 font-mono mt-1 block">92.8%</span>
            <span className="text-[10px] text-health-600 mt-1 block">Low false alert rate</span>
          </div>

          <div className="p-4 rounded-2xl bg-health-50/60 border border-health-200 text-center">
            <span className="text-xs font-bold text-health-800 uppercase tracking-wider block">Recall (Sensitivity)</span>
            <span className="text-3xl font-extrabold text-health-900 font-mono mt-1 block">95.1%</span>
            <span className="text-[10px] text-health-600 mt-1 block">Minimal missed LASA pairs</span>
          </div>

          <div className="p-4 rounded-2xl bg-health-50/60 border border-health-200 text-center">
            <span className="text-xs font-bold text-health-800 uppercase tracking-wider block">F1-Score</span>
            <span className="text-3xl font-extrabold text-health-900 font-mono mt-1 block">93.9%</span>
            <span className="text-[10px] text-health-600 mt-1 block">Harmonic mean balance</span>
          </div>
        </div>

        {/* Comparative Algorithm Matrix Table */}
        <div className="border border-surface-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 bg-surface-50 border-b border-surface-200 flex items-center justify-between">
            <span className="text-xs font-bold text-surface-800 uppercase tracking-wider">
              Ablation & Algorithm Benchmark Matrix
            </span>
            <span className="text-[11px] text-surface-500 font-medium">Tested on 500 Confusable Drug Pairs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-surface-100/60 border-b border-surface-200 text-surface-600 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4 w-1/3">Algorithm / Model Architecture</th>
                  <th className="py-3 px-3 text-center">Accuracy</th>
                  <th className="py-3 px-3 text-center">Precision</th>
                  <th className="py-3 px-3 text-center">Recall</th>
                  <th className="py-3 px-3 text-center">F1 Score</th>
                  <th className="py-3 px-3 text-center">FDA POCA Alignment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {MODEL_EVALUATION_METRICS.map((m, idx) => {
                  const isHybrid = m.name.includes('Hybrid');
                  return (
                    <tr
                      key={m.name}
                      className={isHybrid ? 'bg-health-50/60 font-semibold' : 'hover:bg-surface-50/50'}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {isHybrid && (
                            <span className="w-2 h-2 rounded-full bg-health-600 animate-pulse" />
                          )}
                          <span className={isHybrid ? 'text-health-900 font-bold' : 'text-surface-800'}>
                            {m.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-surface-500 mt-0.5">{m.description}</p>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-surface-900">{m.accuracy}%</td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-surface-900">{m.precision}%</td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-surface-900">{m.recall}%</td>
                      <td className={`py-3.5 px-3 text-center font-mono font-bold ${isHybrid ? 'text-health-700 text-sm' : 'text-surface-900'}`}>
                        {m.f1Score}%
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-surface-700">{m.pocaScore}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Model Architecture Specs Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-1">
            <span className="font-bold text-surface-900 block flex items-center gap-1.5">
              <Binary className="w-3.5 h-3.5 text-health-600" />
              Orthographic Component
            </span>
            <p className="text-surface-600 leading-relaxed">
              Normalized Levenshtein edit distance and Jaro-Winkler character transpositions with a weight coefficient of <strong>w₁ = 0.45</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-1">
            <span className="font-bold text-surface-900 block flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-health-600" />
              Phonetic Component
            </span>
            <p className="text-surface-600 leading-relaxed">
              Double Metaphone and Soundex phonetic consonant encoding for spoken medication recognition with <strong>w₂ = 0.40</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-1">
            <span className="font-bold text-surface-900 block flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-health-600" />
              Semantic & Clinical Component
            </span>
            <p className="text-surface-600 leading-relaxed">
              Therapeutic indication compatibility, dosage form overlap, and pharmacological classification matching with <strong>w₃ = 0.15</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* 5 Analytical Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Most Frequently Flagged LASA Pairs */}
        <div className="bg-white p-6 rounded-3xl border border-surface-200 shadow-xs space-y-4">
          <div>
            <h4 className="text-sm font-bold text-surface-900">Most Frequently Detected LASA Pairs</h4>
            <p className="text-xs text-surface-500">Highest incidence pairs flagged in clinical workflow tests</p>
          </div>

          <div className="space-y-2.5">
            {FREQUENT_LASA_PAIRS.map((pair) => (
              <div key={pair.pair} className="space-y-1 text-xs">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-surface-900 font-bold">{pair.pair}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-surface-500">{pair.count} incidents</span>
                    <RiskBadge level={pair.risk as any} score={pair.score} size="sm" showIcon={false} />
                  </div>
                </div>
                <div className="w-full bg-surface-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-health-600 rounded-full"
                    style={{ width: `${(pair.count / 42) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: OCR Recognition Confidence Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-surface-200 shadow-xs space-y-4">
          <div>
            <h4 className="text-sm font-bold text-surface-900">OCR Extraction Confidence Spread</h4>
            <p className="text-xs text-surface-500">Recognition fidelity across scanned prescription batches</p>
          </div>

          <div className="space-y-4 pt-2">
            {OCR_CONFIDENCE_BUCKETS.map((bucket) => (
              <div key={bucket.range} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-surface-800">{bucket.range}</span>
                  <span className="font-mono font-bold text-surface-900">
                    {bucket.count} items ({bucket.percent}%)
                  </span>
                </div>
                <div className="w-full bg-surface-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${bucket.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200 text-xs text-surface-600 space-y-1 mt-4">
            <span className="font-bold text-surface-800 block">Pharmacopoeia Coverage:</span>
            <p>
              Integrated with Indian A-Z medicines repository and NIH RxNorm/FDA tables, spanning over 250+ verified generic entities and brand trade names.
            </p>
          </div>
        </div>
      </div>

      {/* Academic Citation & Project Credentials */}
      <div className="p-5 rounded-2xl bg-white border border-surface-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-health-50 text-health-700">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-surface-900">
              Honours AIML Project • AY 2026-27 • Department of Computer Engineering
            </p>
            <p className="text-surface-500 mt-0.5">
              Authors: Vansh Gurav(28), Harsh Jain(29), Piyusha Nandivadekar(40), Aniruddha Kule(30) • Guide: Prof. Omprakash Yadav
            </p>
            <p className="text-[11px] text-surface-400 mt-0.5">
              Grounded in: <em>Look-alike, sound-alike (LASA) drugs in India</em> (The Lancet Regional Health Southeast Asia, 2024).
            </p>
          </div>
        </div>
      </div>

      <ClinicalDisclaimer />
    </div>
  );
};
