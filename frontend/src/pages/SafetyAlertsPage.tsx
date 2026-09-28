import React, { useState } from 'react';
import { 
  BellRing, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { SafetyAlert, RiskLevel } from '../types/lasa';
import { RiskBadge } from '../components/common/RiskBadge';
import { TallManText } from '../components/common/TallManText';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';

interface SafetyAlertsPageProps {
  alerts: SafetyAlert[];
  onSelectAlert: (alert: SafetyAlert) => void;
  onNavigateToComparison: (medA: string, medB: string) => void;
}

export const SafetyAlertsPage: React.FC<SafetyAlertsPageProps> = ({
  alerts,
  onSelectAlert,
  onNavigateToComparison
}) => {
  const [filter, setFilter] = useState<'All' | 'High' | 'Medium' | 'Low' | 'Resolved'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filterTabs = [
    { id: 'All', label: 'All Alerts', count: alerts.length },
    { id: 'High', label: 'High Risk', count: alerts.filter(a => a.riskLevel === 'High' && a.status !== 'Resolved').length },
    { id: 'Medium', label: 'Medium Risk', count: alerts.filter(a => a.riskLevel === 'Medium' && a.status !== 'Resolved').length },
    { id: 'Low', label: 'Low Risk', count: alerts.filter(a => a.riskLevel === 'Low' && a.status !== 'Resolved').length },
    { id: 'Resolved', label: 'Resolved', count: alerts.filter(a => a.status === 'Resolved').length },
  ];

  const filteredAlerts = alerts.filter(alert => {
    // Tab filter
    if (filter === 'Resolved') {
      if (alert.status !== 'Resolved') return false;
    } else if (filter !== 'All') {
      if (alert.riskLevel !== filter || alert.status === 'Resolved') return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchPair = alert.pair[0].toLowerCase().includes(q) || alert.pair[1].toLowerCase().includes(q);
      const matchReason = alert.reason.toLowerCase().includes(q);
      return matchPair || matchReason;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold mb-2">
              <BellRing className="w-3.5 h-3.5" />
              <span>Active Pharmacovigilance & Conflict Triage</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-surface-900 tracking-tight">
              Clinical Safety Alerts Center
            </h2>
            <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
              Review, verify, and resolve Look-Alike and Sound-Alike alerts generated across OPD prescriptions, searches, and automated OCR scans.
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-semibold text-surface-500 block">Active High Hazards:</span>
            <span className="text-2xl font-extrabold text-red-600 font-mono">
              {alerts.filter(a => a.riskLevel === 'High' && a.status !== 'Resolved').length}
            </span>
          </div>
        </div>

        {/* Controls: Search and Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-surface-100">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {filterTabs.map((tab) => {
              const isActive = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-health-600 text-white shadow-2xs'
                      : 'bg-surface-100 hover:bg-surface-200/70 text-surface-600'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-surface-200 text-surface-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-surface-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search medicine or alert..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-50 border border-surface-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-surface-900 placeholder:text-surface-400 focus:outline-hidden focus:ring-2 focus:ring-health-500/20 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Alerts Grid / Cards */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-surface-200 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-base font-bold text-surface-800">No alerts found in this view</h4>
            <p className="text-xs text-surface-500 max-w-sm mx-auto">
              All identified potential medication pairs for this filter have been addressed or no conflicts matched your search.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => onSelectAlert(alert)}
              className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs hover:shadow-hover group ${
                alert.status === 'Resolved'
                  ? 'border-surface-200 opacity-80'
                  : alert.riskLevel === 'High'
                  ? 'border-red-200 hover:border-red-300'
                  : 'border-surface-200 hover:border-surface-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <RiskBadge level={alert.riskLevel} score={alert.lasaScore} size="sm" />
                    {alert.status === 'Resolved' ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Resolved
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        Action Required
                      </span>
                    )}
                    <span className="text-xs font-mono text-surface-400">ID: {alert.id}</span>
                  </div>

                  {/* Conflicting Pair Header */}
                  <div className="flex items-center gap-2 text-base font-extrabold text-surface-900 flex-wrap">
                    <TallManText text={alert.tallManPair[0]} />
                    <span className="text-red-500 font-normal">↔</span>
                    <TallManText text={alert.tallManPair[1]} />
                  </div>

                  <p className="text-xs text-surface-600 leading-relaxed max-w-3xl">
                    {alert.reason}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-surface-400 flex-wrap pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {alert.timestamp}
                    </span>
                    <span>•</span>
                    <span>Detection: <strong>{alert.detectionSource}</strong></span>
                    <span>•</span>
                    <span>Indications: {alert.medA.category} vs {alert.medB.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToComparison(alert.pair[0], alert.pair[1]);
                    }}
                    className="p-2 rounded-xl text-surface-500 hover:text-health-700 hover:bg-surface-100 transition-colors"
                    title="Open Side-by-Side Comparison"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAlert(alert);
                    }}
                    className="px-4 py-2 rounded-xl bg-health-600 hover:bg-health-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
                  >
                    <span>Review Alert</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ClinicalDisclaimer />
    </div>
  );
};
