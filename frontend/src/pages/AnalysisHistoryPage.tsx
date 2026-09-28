import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { AnalysisHistoryItem, RiskLevel } from '../types/lasa';
import { RiskBadge } from '../components/common/RiskBadge';
import { TallManText } from '../components/common/TallManText';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';

interface AnalysisHistoryPageProps {
  history: AnalysisHistoryItem[];
  onNavigateToCheck: (medName: string) => void;
  onNavigateToComparison: (medA: string, medB: string) => void;
}

export const AnalysisHistoryPage: React.FC<AnalysisHistoryPageProps> = ({
  history,
  onNavigateToCheck,
  onNavigateToComparison
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');

  const filteredHistory = history.filter((item) => {
    if (sourceFilter !== 'All' && item.source !== sourceFilter) return false;
    if (riskFilter !== 'All' && item.riskLevel !== riskFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchMed = item.medicine.toLowerCase().includes(q);
      const matchPartner = item.confusedWith && item.confusedWith.toLowerCase().includes(q);
      const matchUser = item.user.toLowerCase().includes(q);
      return matchMed || matchPartner || matchUser;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-2">
              <History className="w-3.5 h-3.5" />
              <span>Institutional Audit & Verification Logs</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-surface-900 tracking-tight">
              Medication Analysis History
            </h2>
            <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
              Comprehensive audit trail of every drug queried, OCR parsed, or voice inputted with associated similarity scores.
            </p>
          </div>

          <button
            onClick={() => alert("Audit log export downloaded in CSV / Excel format.")}
            className="px-4 py-2 rounded-xl border border-surface-200 bg-white hover:bg-surface-50 text-surface-700 text-xs font-semibold transition-colors flex items-center gap-2 self-start sm:self-auto shadow-2xs"
          >
            <Download className="w-4 h-4 text-surface-500" />
            <span>Export Audit Log</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-surface-100">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-surface-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search medicine, partner, user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-50 border border-surface-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-surface-900 placeholder:text-surface-400 focus:outline-hidden focus:ring-2 focus:ring-health-500/20 font-medium"
            />
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-surface-500 shrink-0">Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-1.5 text-xs text-surface-900 font-medium focus:outline-hidden"
            >
              <option value="All">All Sources</option>
              <option value="Manual Search">Manual Search</option>
              <option value="Prescription OCR">Prescription OCR</option>
              <option value="Voice Input">Voice Input</option>
            </select>
          </div>

          {/* Risk Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-surface-500 shrink-0">Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-1.5 text-xs text-surface-900 font-medium focus:outline-hidden"
            >
              <option value="All">All Risk Levels</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
              <option value="Clear">Clear / Safe</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Data Table */}
      <div className="bg-white rounded-3xl border border-surface-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200 text-surface-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Queried Medicine</th>
                <th className="py-3.5 px-4">Confused With</th>
                <th className="py-3.5 px-4">LASA Score</th>
                <th className="py-3.5 px-4">Risk Level</th>
                <th className="py-3.5 px-4">Input Source</th>
                <th className="py-3.5 px-4">Clinical User</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="py-3 px-4 text-surface-500 font-mono text-[11px]">
                    {item.date}
                  </td>

                  <td className="py-3 px-4 font-bold text-surface-900">
                    <TallManText text={item.tallMan || item.medicine} />
                  </td>

                  <td className="py-3 px-4 text-surface-700">
                    {item.confusedWith ? (
                      <span className="font-semibold text-red-700">{item.confusedWith}</span>
                    ) : (
                      <span className="text-surface-400 italic">No conflict</span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-surface-900">
                    {item.lasaScore}%
                  </td>

                  <td className="py-3 px-4">
                    <RiskBadge level={item.riskLevel} score={item.lasaScore} size="sm" />
                  </td>

                  <td className="py-3 px-4 text-surface-600 font-medium">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-100 text-surface-700 text-[11px]">
                      {item.source}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-surface-700">
                    {item.user}
                  </td>

                  <td className="py-3 px-4">
                    <span className={`text-[11px] font-bold ${
                      item.status === 'Flagged'
                        ? 'text-red-600'
                        : item.status === 'Resolved'
                        ? 'text-emerald-600'
                        : 'text-surface-600'
                    }`}>
                      {item.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onNavigateToCheck(item.medicine)}
                        className="px-2.5 py-1 rounded-lg bg-surface-100 hover:bg-health-50 text-surface-700 hover:text-health-700 font-semibold text-xs transition-colors"
                      >
                        Re-Analyze
                      </button>

                      {item.confusedWith && (
                        <button
                          onClick={() => onNavigateToComparison(item.medicine, item.confusedWith!)}
                          className="p-1 rounded-lg text-surface-400 hover:text-health-700 hover:bg-surface-100 transition-colors"
                          title="Open in Comparison Matrix"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
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

      <ClinicalDisclaimer />
    </div>
  );
};
