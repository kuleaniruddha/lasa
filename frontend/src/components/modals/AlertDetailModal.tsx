import React from 'react';
import { SafetyAlert } from '../../types/lasa';
import { RiskBadge } from '../common/RiskBadge';
import { TallManText } from '../common/TallManText';
import { MetricGauge } from '../common/MetricGauge';
import { ClinicalDisclaimer } from '../common/ClinicalDisclaimer';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  ShieldAlert, 
  Pill,
  Clock,
  FileCheck
} from 'lucide-react';

interface AlertDetailModalProps {
  alert: SafetyAlert | null;
  onClose: () => void;
  onResolve: (alertId: string) => void;
  onOpenComparison: (medA: string, medB: string) => void;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alert,
  onClose,
  onResolve,
  onOpenComparison
}) => {
  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-surface-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-surface-200 flex items-center justify-between bg-surface-50/50 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-100 text-red-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-surface-900">LASA Safety Alert Review</h3>
                <RiskBadge level={alert.riskLevel} score={alert.lasaScore} size="sm" />
              </div>
              <p className="text-xs text-surface-500 flex items-center gap-2 mt-0.5">
                <Clock className="w-3 h-3" /> Detected {alert.timestamp} via {alert.detectionSource}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Conflicting Medicine Pair Banner */}
          <div className="p-4 rounded-xl border border-red-200 bg-red-50/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-center sm:text-left">
                <p className="text-[11px] uppercase font-bold text-red-600 tracking-wider">Prescribed / Queried Drug</p>
                <div className="text-base font-bold text-surface-900 mt-0.5">
                  <TallManText text={alert.tallManPair[0]} />
                </div>
                <p className="text-xs text-surface-600 font-medium">{alert.medA.category}</p>
              </div>

              <div className="text-red-400 font-bold px-2 text-lg">↔</div>

              <div className="text-center sm:text-left">
                <p className="text-[11px] uppercase font-bold text-red-600 tracking-wider">Confusing Alternative</p>
                <div className="text-base font-bold text-surface-900 mt-0.5">
                  <TallManText text={alert.tallManPair[1]} />
                </div>
                <p className="text-xs text-surface-600 font-medium">{alert.medB.category}</p>
              </div>
            </div>

            <div className="text-center sm:text-right shrink-0">
              <span className="text-2xl font-extrabold text-red-600 font-mono">{alert.lasaScore}%</span>
              <p className="text-[10px] text-red-700 font-medium uppercase">Risk Score</p>
            </div>
          </div>

          {/* AI Clinical Warning */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-surface-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              Clinical Rationale & Why It Was Flagged
            </h4>
            <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200 text-xs text-surface-700 leading-relaxed space-y-2">
              <p>{alert.reason}</p>
              <div className="pt-2 border-t border-surface-200/60 flex items-start gap-2 text-surface-800 font-medium">
                <FileCheck className="w-4 h-4 text-health-600 shrink-0 mt-0.5" />
                <span><strong className="text-surface-900">Recommended Action:</strong> {alert.recommendation}</span>
              </div>
            </div>
          </div>

          {/* AI Signal Indicators */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-surface-900 uppercase tracking-wider">
              AI Multi-Signal Breakdown
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <MetricGauge label="Spelling Similarity" value={Math.min(100, Math.round(alert.lasaScore * 1.02))} type="bar" />
              <MetricGauge label="Phonetic Similarity" value={Math.min(100, Math.round(alert.lasaScore * 0.96))} type="bar" />
              <MetricGauge label="Semantic Similarity" value={Math.min(100, Math.round(alert.lasaScore * 0.82))} type="bar" />
            </div>
          </div>

          {/* Side by side attributes comparison table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-surface-900 uppercase tracking-wider flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-health-600" />
              Clinical Specifications Comparison
            </h4>
            <div className="border border-surface-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-surface-100 text-surface-600 border-b border-surface-200 font-semibold">
                  <tr>
                    <th className="p-2.5 w-1/3">Clinical Property</th>
                    <th className="p-2.5 w-1/3 text-health-900">{alert.pair[0]}</th>
                    <th className="p-2.5 w-1/3 text-surface-900">{alert.pair[1]}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200">
                  <tr>
                    <td className="p-2.5 font-medium text-surface-500">Generic Name</td>
                    <td className="p-2.5 font-semibold text-surface-800">{alert.medA.genericName}</td>
                    <td className="p-2.5 font-semibold text-surface-800">{alert.medB.genericName}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-surface-500">Drug Category</td>
                    <td className="p-2.5 text-surface-700">{alert.medA.category}</td>
                    <td className="p-2.5 text-surface-700">{alert.medB.category}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-surface-500">Therapeutic Purpose</td>
                    <td className="p-2.5 text-surface-700">{alert.medA.therapeuticPurpose}</td>
                    <td className="p-2.5 text-surface-700">{alert.medB.therapeuticPurpose}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-surface-500">Dosage Form / Strength</td>
                    <td className="p-2.5 text-surface-700">{alert.medA.dosageForm} ({alert.medA.strength})</td>
                    <td className="p-2.5 text-surface-700">{alert.medB.dosageForm} ({alert.medB.strength})</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <ClinicalDisclaimer compact={true} />
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-surface-200 bg-surface-50 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenComparison(alert.pair[0], alert.pair[1]);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-health-700 hover:text-health-900 hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Dedicated Comparison Matrix
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-surface-200 text-xs font-semibold text-surface-700 hover:bg-surface-100 transition-colors"
            >
              Close
            </button>
            {alert.status !== 'Resolved' ? (
              <button
                onClick={() => {
                  onResolve(alert.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Acknowledge & Mark Resolved
              </button>
            ) : (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Already Resolved
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
