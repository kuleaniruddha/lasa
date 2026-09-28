import React from 'react';
import { 
  Search, 
  FileScan, 
  GitCompare, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  ArrowUpRight, 
  Server, 
  Database, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { SafetyAlert } from '../types/lasa';
import { RiskBadge } from '../components/common/RiskBadge';
import { TallManText } from '../components/common/TallManText';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import { WEEKLY_ACTIVITY, RISK_DISTRIBUTION } from '../data/analyticsData';

interface DashboardPageProps {
  alerts: SafetyAlert[];
  onNavigate: (tab: string, contextMedicine?: string) => void;
  onSelectAlert: (alert: SafetyAlert) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  alerts,
  onNavigate,
  onSelectAlert
}) => {
  const maxWeekly = Math.max(...WEEKLY_ACTIVITY.map(d => d.checks));

  return (
    <div className="space-y-6">
      {/* Top Banner Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-surface-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-health-50 text-health-700 text-[11px] font-semibold mb-1.5 border border-health-200">
            <Sparkles className="w-3 h-3 text-health-600" />
            <span>Honours AIML Clinical Safety Decision Platform</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-surface-900 tracking-tight">
            Good morning, Dr. Aniruddha <span className="text-amber-500">👋</span>
          </h2>
          <p className="text-xs text-surface-500 mt-0.5">
            Here's your clinical medication safety overview and active LASA surveillance metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('check-medicine')}
            className="px-4 py-2 rounded-xl bg-health-600 hover:bg-health-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Check Medicine</span>
          </button>
          <button
            onClick={() => onNavigate('scan-prescription')}
            className="px-4 py-2 rounded-xl border border-surface-200 bg-white hover:bg-surface-50 text-surface-700 text-xs font-semibold transition-all flex items-center gap-2"
          >
            <FileScan className="w-4 h-4 text-health-600" />
            <span>Scan Prescription</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-surface-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-surface-500">Medicines Checked</span>
            <div className="p-2 rounded-xl bg-health-50 text-health-600">
              <Search className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-surface-900 font-mono">1,284</span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14.8% this month</span>
            </div>
          </div>
          <p className="text-[11px] text-surface-400 mt-2 border-t border-surface-100 pt-2">
            Clinical queries across pharmacy & OPD
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-surface-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-surface-500">LASA Alerts</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">86</span>
            <p className="text-xs text-amber-700 font-medium mt-1">Potential conflicts detected</p>
          </div>
          <p className="text-[11px] text-surface-400 mt-2 border-t border-surface-100 pt-2">
            Flagged by orthographic & phonetic AI
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-surface-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-surface-500">High-Risk Alerts</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-red-600 font-mono">14</span>
            <p className="text-xs text-red-700 font-medium mt-1">Require immediate attention</p>
          </div>
          <p className="text-[11px] text-surface-400 mt-2 border-t border-surface-100 pt-2">
            Severe morbidity / ICU hazard pairs
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-surface-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-surface-500">Prescriptions Analyzed</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FileScan className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-surface-900 font-mono">324</span>
            <p className="text-xs text-blue-700 font-medium mt-1">OCR scanned this month</p>
          </div>
          <p className="text-[11px] text-surface-400 mt-2 border-t border-surface-100 pt-2">
            94.6% average text recognition accuracy
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500">
          Rapid Clinical Workflows
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('check-medicine')}
            className="text-left p-5 rounded-2xl bg-white border border-surface-200 hover:border-health-400 hover:shadow-hover transition-all group relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-health-50 text-health-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-surface-900 group-hover:text-health-700 transition-colors">
                Check Medicine
              </h4>
              <ChevronRight className="w-4 h-4 text-surface-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-surface-500 mt-1 leading-relaxed">
              Analyze a brand or generic drug name for orthographic, phonetic, and semantic LASA collisions.
            </p>
          </button>

          <button
            onClick={() => onNavigate('scan-prescription')}
            className="text-left p-5 rounded-2xl bg-white border border-surface-200 hover:border-health-400 hover:shadow-hover transition-all group relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileScan className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-surface-900 group-hover:text-health-700 transition-colors">
                Scan Prescription
              </h4>
              <ChevronRight className="w-4 h-4 text-surface-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-surface-500 mt-1 leading-relaxed">
              Upload prescription images or PDFs to batch-extract medications and screen for co-dispensing risks.
            </p>
          </button>

          <button
            onClick={() => onNavigate('medicine-comparison')}
            className="text-left p-5 rounded-2xl bg-white border border-surface-200 hover:border-health-400 hover:shadow-hover transition-all group relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <GitCompare className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-surface-900 group-hover:text-health-700 transition-colors">
                Compare Medicines
              </h4>
              <ChevronRight className="w-4 h-4 text-surface-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-surface-500 mt-1 leading-relaxed">
              Direct side-by-side evaluation of two conflicting drugs, checking dosage forms, Tall Man, and indications.
            </p>
          </button>
        </div>
      </div>

      {/* Two-Column Middle Layout: Recent Safety Alerts & Risk Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Safety Alerts Table (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-surface-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-surface-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-surface-900">Recent Safety Alerts</h3>
                <p className="text-xs text-surface-500">Live surveillance log of detected LASA pairs</p>
              </div>
              <button
                onClick={() => onNavigate('safety-alerts')}
                className="text-xs font-semibold text-health-600 hover:underline flex items-center gap-1"
              >
                <span>View All ({alerts.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {alerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => onSelectAlert(alert)}
                  className="p-3.5 rounded-xl border border-surface-200 hover:border-surface-300 hover:bg-surface-50/70 transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold text-surface-900">
                        {alert.pair[0]} ↔ {alert.pair[1]}
                      </span>
                      <RiskBadge level={alert.riskLevel} score={alert.lasaScore} size="sm" />
                    </div>
                    <p className="text-[11px] text-surface-500 truncate max-w-md">
                      {alert.reason}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-surface-400 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{alert.timestamp}</span>
                      <span>•</span>
                      <span>Source: {alert.detectionSource}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAlert(alert);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-surface-100 hover:bg-health-50 text-surface-700 hover:text-health-700 text-xs font-medium transition-colors shrink-0"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LASA Risk Overview & Weekly Activity (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Risk Distribution Card */}
          <div className="bg-white p-5 rounded-2xl border border-surface-200 shadow-xs">
            <h3 className="text-sm font-bold text-surface-900 mb-1">LASA Risk Overview</h3>
            <p className="text-xs text-surface-500 mb-4">Proportion of flagged medication pairs by severity</p>

            <div className="space-y-3">
              {RISK_DISTRIBUTION.map((item) => (
                <div key={item.level} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-surface-700">{item.level}</span>
                    <span className="font-mono text-surface-900 font-bold">
                      {item.count} alerts ({item.percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-surface-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Activity Bar Chart */}
          <div className="bg-white p-5 rounded-2xl border border-surface-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-surface-900">Weekly Activity</h3>
                <p className="text-xs text-surface-500">Daily medication safety verification volume</p>
              </div>
              <span className="text-xs font-mono font-bold text-health-700 bg-health-50 px-2 py-0.5 rounded border border-health-200">
                1,284 total
              </span>
            </div>

            <div className="flex items-end justify-between gap-2 h-28 pt-4">
              {WEEKLY_ACTIVITY.map((d) => {
                const heightPercent = Math.round((d.checks / maxWeekly) * 100);
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <div className="w-full bg-surface-100 rounded-t-md relative flex items-end justify-center h-20 overflow-hidden">
                      <div
                        className="w-full bg-health-500 group-hover:bg-health-600 transition-all rounded-t-md"
                        style={{ height: `${heightPercent}%` }}
                        title={`${d.day}: ${d.checks} checks, ${d.alerts} alerts`}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-surface-500">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* System Health Status Bar */}
      <div className="p-4 rounded-2xl bg-white border border-surface-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-health-600" />
          <span className="text-xs font-bold text-surface-900">System Health & Connected Services:</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-surface-700">
            <Server className="w-3.5 h-3.5 text-health-600" />
            <span>AI Engine:</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Online
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-surface-700">
            <Database className="w-3.5 h-3.5 text-health-600" />
            <span>Medicine Database:</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Connected (257+ drugs)
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-surface-700">
            <FileScan className="w-3.5 h-3.5 text-health-600" />
            <span>OCR Service:</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Ready
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-surface-700">
            <ShieldCheck className="w-3.5 h-3.5 text-health-600" />
            <span>Backend API:</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Healthy
            </span>
          </div>
        </div>
      </div>

      <ClinicalDisclaimer />
    </div>
  );
};
