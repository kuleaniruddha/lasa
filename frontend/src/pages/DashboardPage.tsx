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
  Clock,
  Stethoscope,
  Pill,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { SafetyAlert, UserProfile } from '../types/lasa';
import { RiskBadge } from '../components/common/RiskBadge';
import { TallManText } from '../components/common/TallManText';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import { useRole } from '../context/RoleContext';

interface DashboardPageProps {
  alerts: SafetyAlert[];
  onNavigate: (tab: string, contextMedicine?: string) => void;
  onSelectAlert: (alert: SafetyAlert) => void;
  currentUser?: UserProfile | null;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  alerts,
  onNavigate,
  onSelectAlert,
  currentUser
}) => {
  const { currentRole, currentRoleConfig, isNaiveMode } = useRole();

  const totalAlerts = alerts.length;
  const highRiskAlerts = alerts.filter(a => a.riskLevel === 'High').length;
  const activeAlerts = alerts.filter(a => a.status === 'Active');
  const greetingName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Clinician';

  return (
    <div className="space-y-6">
      {/* Top Banner Greeting */}
      <div className="bg-white dark:bg-surface-850 p-6 sm:p-7 rounded-3xl border border-surface-200 dark:border-surface-750 shadow-xs transition-colors duration-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-health-50 dark:bg-health-950/60 text-health-700 dark:text-health-300 text-xs font-semibold mb-2 border border-health-200 dark:border-health-800/60">
              <Sparkles className="w-3.5 h-3.5 text-health-600 dark:text-health-400" />
              <span>{currentRoleConfig.name} Workspace</span>
              {isNaiveMode && (
                <span className="px-1.5 py-0.2 rounded-md bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 text-[10px] font-extrabold uppercase">
                  Naive Guided Mode
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-surface-900 dark:text-surface-100 tracking-tight">
              Hello, {greetingName} <span className="text-amber-500">👋</span>
            </h2>
            <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400 mt-1 max-w-2xl leading-relaxed">
              {currentRoleConfig.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('check-medicine')}
              className="px-4 py-2.5 rounded-xl bg-health-600 hover:bg-health-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Check Medicine</span>
            </button>
            <button
              onClick={() => onNavigate('scan-prescription')}
              className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 text-surface-800 dark:text-surface-200 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileScan className="w-4 h-4 text-health-600 dark:text-health-400" />
              <span>Scan Prescription</span>
            </button>
          </div>
        </div>

        {/* NAIVE USER GUIDED BANNER (Assistant Mode) */}
        {isNaiveMode && (
          <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
            <div className="flex items-center gap-2 mb-2 font-bold text-xs text-amber-900 dark:text-amber-200">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Pharmacy Assistant 3-Step Safety Protocol</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-surface-800 border border-amber-200/60 dark:border-amber-900/60 shadow-2xs">
                <span className="inline-block w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-center text-xs mb-1.5 leading-5">
                  1
                </span>
                <strong className="block text-surface-900 dark:text-surface-100 font-bold">Type or Scan Drug Name</strong>
                <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-0.5">
                  Enter the medication written on the prescription slip in "Check Medicine".
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-surface-800 border border-amber-200/60 dark:border-amber-900/60 shadow-2xs">
                <span className="inline-block w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-center text-xs mb-1.5 leading-5">
                  2
                </span>
                <strong className="block text-surface-900 dark:text-surface-100 font-bold">Check Traffic-Light Status</strong>
                <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-0.5">
                  🟢 <strong>Green</strong>: Clear. 🟡 <strong>Yellow</strong>: Double-check. 🔴 <strong>Red</strong>: Stop immediately!
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-surface-800 border border-amber-200/60 dark:border-amber-900/60 shadow-2xs">
                <span className="inline-block w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-center text-xs mb-1.5 leading-5">
                  3
                </span>
                <strong className="block text-surface-900 dark:text-surface-100 font-bold">Request Sign-Off</strong>
                <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-0.5">
                  If Red or Yellow, forward the alert to the supervising Pharmacist or Doctor before dispensing.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-surface-850 p-5 rounded-2xl border border-surface-200 dark:border-surface-750 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-surface-500 dark:text-surface-400">Total Catalog Drugs</span>
            <div className="p-2 rounded-xl bg-health-50 dark:bg-health-950/60 text-health-600 dark:text-health-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-surface-100 font-mono">761</span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ISMP & Pharmacopoeia Verified</span>
            </div>
          </div>
          <p className="text-[11px] text-surface-400 mt-2 border-t border-surface-100 dark:border-surface-750 pt-2">
            Active formulary database
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-surface-850 p-5 rounded-2xl border border-surface-200 dark:border-surface-750 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-surface-500 dark:text-surface-400">LASA Pairs Monitored</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <GitCompare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">123</span>
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mt-1">Known confusable collision pairs</p>
          </div>
          <p className="text-[11px] text-surface-400 mt-2 border-t border-surface-100 dark:border-surface-750 pt-2">
            FDA POCA & Lancet 2024 benchmarks
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-surface-850 p-5 rounded-2xl border border-surface-200 dark:border-surface-750 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-surface-500 dark:text-surface-400">Active High-Risk Alerts</span>
            <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-red-600 dark:text-red-400 font-mono">{highRiskAlerts}</span>
            <p className="text-xs text-red-700 dark:text-red-400 font-medium mt-1">
              {highRiskAlerts > 0 ? 'Require immediate clinical review' : 'No critical alerts pending'}
            </p>
          </div>
          <p className="text-[11px] text-surface-400 mt-2 border-t border-surface-100 dark:border-surface-750 pt-2">
            Severe morbidity risk collision pairs
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-surface-850 p-5 rounded-2xl border border-surface-200 dark:border-surface-750 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-surface-500 dark:text-surface-400">Total Safety Alerts</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-surface-100 font-mono">{totalAlerts}</span>
            <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-1">{activeAlerts.length} currently active</p>
          </div>
          <p className="text-[11px] text-surface-400 mt-2 border-t border-surface-100 dark:border-surface-750 pt-2">
            Logged across hospital terminals
          </p>
        </div>
      </div>

      {/* Role-Specific Priority Action Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400">
          {currentRoleConfig.name} Workflows
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Check Medicine */}
          <button
            onClick={() => onNavigate('check-medicine')}
            className="text-left p-5 rounded-2xl bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-750 hover:border-health-400 hover:shadow-xs transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-health-50 dark:bg-health-950/80 text-health-600 dark:text-health-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-surface-900 dark:text-surface-100 flex items-center justify-between">
              <span>{isNaiveMode ? 'Quick Drug Check' : 'Check Medicine'}</span>
              <ArrowRight className="w-4 h-4 text-surface-400 group-hover:translate-x-1 transition-transform" />
            </h4>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
              {isNaiveMode
                ? 'Check single medication name to see immediate green/yellow/red risk.'
                : 'POCA composite analysis with 6-metric NLP similarity and soft-voting ensemble.'}
            </p>
          </button>

          {/* Card 2: Scan Prescription */}
          <button
            onClick={() => onNavigate('scan-prescription')}
            className="text-left p-5 rounded-2xl bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-750 hover:border-health-400 hover:shadow-xs transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileScan className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-surface-900 dark:text-surface-100 flex items-center justify-between">
              <span>Scan Prescription</span>
              <ArrowRight className="w-4 h-4 text-surface-400 group-hover:translate-x-1 transition-transform" />
            </h4>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
              {isNaiveMode
                ? 'Upload prescription image or paste list to screen all drugs at once.'
                : 'OCR extraction & combinatorial pairwise screening across full formulary.'}
            </p>
          </button>

          {/* Card 3: Dual Comparison or Overrides */}
          <button
            onClick={() => onNavigate(currentRole === 'Admin' ? 'analytics' : 'medicine-comparison')}
            className="text-left p-5 rounded-2xl bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-750 hover:border-health-400 hover:shadow-xs transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              {currentRole === 'Admin' ? <Activity className="w-5 h-5" /> : <GitCompare className="w-5 h-5" />}
            </div>
            <h4 className="font-bold text-sm text-surface-900 dark:text-surface-100 flex items-center justify-between">
              <span>{currentRole === 'Admin' ? 'AIML Model Analytics' : 'Dual-Drug Comparator'}</span>
              <ArrowRight className="w-4 h-4 text-surface-400 group-hover:translate-x-1 transition-transform" />
            </h4>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
              {currentRole === 'Admin'
                ? 'Model classification benchmarks, ensemble evaluation metrics, and retraining.'
                : 'Side-by-side Tall Man lettering, indication mismatch, and clinical recommendations.'}
            </p>
          </button>
        </div>
      </div>

      {/* Active High Risk Alerts Feed */}
      <div className="bg-white dark:bg-surface-850 p-6 rounded-3xl border border-surface-200 dark:border-surface-750 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-surface-100 dark:border-surface-750 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">
              Active Critical Collision Alerts ({activeAlerts.length})
            </h3>
          </div>
          <button
            onClick={() => onNavigate('safety-alerts')}
            className="text-xs font-semibold text-health-600 dark:text-health-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Alerts</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeAlerts.length === 0 ? (
          <div className="text-center py-8 text-surface-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-surface-700 dark:text-surface-300">All alerts have been reviewed or resolved.</p>
            <p className="text-[11px] text-surface-400 mt-0.5">Use "Check Medicine" or "Scan Prescription" to screen new orders.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeAlerts.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                onClick={() => onSelectAlert(alert)}
                className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700/60 hover:border-health-400 dark:hover:border-health-500 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-surface-900 dark:text-surface-100 group-hover:text-health-700 dark:group-hover:text-health-400">
                      <TallManText text={alert.tallManPair[0]} /> ↔ <TallManText text={alert.tallManPair[1]} />
                    </span>
                    <RiskBadge level={alert.riskLevel} score={alert.lasaScore} size="sm" />
                  </div>
                  <p className="text-[11px] text-surface-500 dark:text-surface-400">
                    {alert.reason || alert.recommendation}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-surface-400 font-medium">
                    {alert.timestamp}
                  </span>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-health-50 dark:bg-health-950/80 text-health-700 dark:text-health-300 text-xs font-semibold hover:bg-health-100 transition-colors"
                  >
                    Review Alert
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ClinicalDisclaimer />
    </div>
  );
};
