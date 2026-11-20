import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  FileCheck,
  Clock,
  UserCheck
} from 'lucide-react';
import { AnalysisHistoryItem, RiskLevel, ClinicianOverrideRecord } from '../types/lasa';
import { lasaService } from '../services/lasaService';
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
  const [activeTab, setActiveTab] = useState<'screenings' | 'overrides'>('screenings');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [overrides, setOverrides] = useState<ClinicianOverrideRecord[]>([]);

  useEffect(() => {
    lasaService.getAuditOverrides().then(data => setOverrides(data));
  }, []);

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

  const handleExportCSV = () => {
    if (activeTab === 'screenings') {
      const headers = ['Date', 'Queried Medicine', 'Confused With', 'LASA Score', 'Risk Level', 'Source', 'User', 'Status'];
      const rows = filteredHistory.map(h => [
        `"${h.date}"`, `"${h.medicine}"`, `"${h.confusedWith || 'None'}"`, `${h.lasaScore}%`, `"${h.riskLevel}"`, `"${h.source}"`, `"${h.user}"`, `"${h.status}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `LASA_Screening_Audit_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ['Timestamp', 'Drug 1', 'Drug 2', 'Clinician Name', 'License Number', 'Clinical Rationale'];
      const rows = overrides.map(o => [
        `"${o.timestamp}"`, `"${o.drug1}"`, `"${o.drug2}"`, `"${o.clinicianName}"`, `"${o.clinicianLicense}"`, `"${o.reason.replace(/"/g, '""')}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `LASA_Clinician_Overrides_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-2">
              <History className="w-3.5 h-3.5" />
              <span>Institutional Compliance & Verification Logs</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-surface-900 tracking-tight">
              Clinical Audit Trail & Override Log
            </h2>
            <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
              FDA/ISMP-grade audit log of all screened prescriptions, multi-modal queries, and authorized clinician risk overrides.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl border border-surface-200 bg-white hover:bg-surface-50 text-surface-700 text-xs font-semibold transition-colors flex items-center gap-2 self-start sm:self-auto shadow-2xs"
          >
            <Download className="w-4 h-4 text-surface-500" />
            <span>Export to CSV</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex space-x-2 border-b border-surface-200 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('screenings')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'screenings'
                ? 'border-health-600 text-health-700'
                : 'border-transparent text-surface-500 hover:text-surface-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Screened Orders ({filteredHistory.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('overrides')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'overrides'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-surface-500 hover:text-surface-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>Clinician Overrides ({overrides.length})</span>
          </button>
        </div>

        {/* Filter Toolbar (Active for screenings) */}
        {activeTab === 'screenings' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
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
        )}
      </div>

      {/* Tab 1: History Screenings Table */}
      {activeTab === 'screenings' && (
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
      )}

      {/* Tab 2: Clinician Overrides Table */}
      {activeTab === 'overrides' && (
        <div className="space-y-4">
          {overrides.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-surface-200 text-surface-500 text-xs">
              No clinician risk overrides authorized in current audit session.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {overrides.map((ov) => (
                <div key={ov.id} className="p-6 rounded-2xl bg-white border-l-4 border-l-red-600 border border-surface-200 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-surface-100 gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                      <h4 className="text-sm font-bold text-surface-900">
                        Override Authorized: <span className="text-red-700">{ov.drug1}</span> vs <span className="text-red-700">{ov.drug2}</span>
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-surface-400">
                      Logged at: {ov.timestamp}
                    </span>
                  </div>

                  <div className="p-3 bg-red-50/70 border border-red-200/80 rounded-xl text-xs text-red-950 font-medium">
                    <span className="font-bold block uppercase text-[10px] text-red-700 mb-0.5">Clinical Justification Rationale:</span>
                    {ov.reason}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-surface-600 pt-1">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-health-600" />
                      <span>Authorizing Clinician: <strong>{ov.clinicianName}</strong></span>
                    </div>
                    <div className="font-mono text-slate-500">
                      License / NPI: <strong>{ov.clinicianLicense}</strong>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Audit Verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ClinicalDisclaimer />
    </div>
  );
};
