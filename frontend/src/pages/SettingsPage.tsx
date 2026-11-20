import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Sliders, 
  Server, 
  Save, 
  CheckCircle2,
  ShieldCheck,
  Stethoscope,
  Pill,
  ClipboardList,
  AlertTriangle,
  RefreshCw,
  Info,
  Check
} from 'lucide-react';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import { UserProfile, ClinicalRole } from '../types/lasa';
import { useRole } from '../context/RoleContext';
import { authService } from '../services/authService';
import { apiFetch } from '../services/apiClient';

interface SettingsPageProps {
  currentUser?: UserProfile | null;
  onUpdateProfile?: (updated: UserProfile) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser, onUpdateProfile }) => {
  const { currentRole, setRole, isNaiveMode, currentRoleConfig } = useRole();

  const [profile, setProfile] = useState<UserProfile>({
    uid: currentUser?.uid || 'usr_current',
    displayName: currentUser?.displayName || 'Clinical User',
    email: currentUser?.email || 'user@lasaguard.health',
    role: currentUser?.role || currentRole || 'Doctor',
    title: currentUser?.title || 'Healthcare Professional',
    hospital: currentUser?.hospital || 'Metropolitan General Hospital',
    licenseId: currentUser?.licenseId || 'LIC-2026-0001'
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('lasaguard_notifications');
      return saved ? JSON.parse(saved) : {
        highRiskAlerts: true,
        mediumRiskAlerts: true,
        prescriptionScanAlerts: true,
        soundAlerts: false
      };
    } catch {
      return {
        highRiskAlerts: true,
        mediumRiskAlerts: true,
        prescriptionScanAlerts: true,
        soundAlerts: false
      };
    }
  });

  const [aiSettings, setAiSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('lasaguard_ai_settings');
      return saved ? JSON.parse(saved) : {
        similarityThreshold: 70,
        riskSensitivity: 'Standard' as 'Permissive' | 'Standard' | 'High',
        phoneticAlgorithm: 'Double Metaphone'
      };
    } catch {
      return {
        similarityThreshold: 70,
        riskSensitivity: 'Standard' as 'Permissive' | 'Standard' | 'High',
        phoneticAlgorithm: 'Double Metaphone'
      };
    }
  });

  const [backendHealth, setBackendHealth] = useState<{
    status: 'checking' | 'online' | 'offline';
    latencyMs: number | null;
    service: string;
    details: any;
  }>({
    status: 'checking',
    latencyMs: null,
    service: 'Flask LASA Safety Engine',
    details: null
  });

  const [isSaved, setIsSaved] = useState(false);

  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfile({
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        email: currentUser.email,
        role: currentUser.role,
        title: currentUser.title || '',
        hospital: currentUser.hospital || 'Metropolitan General Hospital',
        licenseId: currentUser.licenseId || 'LIC-2026-0001'
      });
    }
  }, [currentUser]);

  // Ping backend cluster health
  const checkHealth = async () => {
    setBackendHealth(prev => ({ ...prev, status: 'checking' }));
    const t0 = performance.now();
    try {
      const res = await apiFetch<any>('/api/health');
      const t1 = performance.now();
      const latency = Math.round(t1 - t0);
      setBackendHealth({
        status: 'online',
        latencyMs: latency,
        service: res.service || 'Flask ML LASA Engine',
        details: res
      });
    } catch {
      // Try fallback route
      try {
        const res2 = await apiFetch<any>('/health');
        const t1 = performance.now();
        setBackendHealth({
          status: 'online',
          latencyMs: Math.round(t1 - t0),
          service: res2.service || 'Flask ML LASA Engine',
          details: res2
        });
      } catch (err) {
        setBackendHealth({
          status: 'offline',
          latencyMs: null,
          service: 'Flask ML LASA Engine',
          details: null
        });
      }
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('lasaguard_notifications', JSON.stringify(notifications));
      localStorage.setItem('lasaguard_ai_settings', JSON.stringify(aiSettings));

      const updated = authService.updateCurrentUser(profile);
      if (updated) {
        onUpdateProfile?.(updated);
      }
      if (profile.role !== currentRole) {
        setRole(profile.role);
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3500);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-surface-900 p-6 sm:p-8 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-surface-800 border border-slate-200 dark:border-surface-700 text-slate-700 dark:text-slate-300 text-xs font-semibold mb-2">
              <Settings className="w-3.5 h-3.5 text-health-600" />
              <span>System & Clinical Preferences</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-surface-900 dark:text-surface-100 tracking-tight">
              Platform Settings & Role Configuration
            </h2>
            <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400 mt-0.5">
              Manage clinician identity, active role perspectives, AI detection thresholds, and real-time backend cluster health.
            </p>
          </div>

          {isSaved && (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Settings & Profile saved successfully!</span>
            </div>
          )}
        </div>
      </div>

      {/* Role-Specific Mode Banner */}
      {isNaiveMode ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              Assistant Mode Active (Naive/Technician Interface)
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 font-semibold">
                Simplified Workflows
              </span>
            </h4>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/80 mt-1 leading-relaxed">
              In this mode, technical machine learning metrics (BiSim, Levenshtein, TF-IDF weights) are simplified into intuitive 
              traffic-light safety cards (🟢 Safe, 🟡 Caution, 🔴 Stop & Ask Pharmacist). You can adjust your role below or switch using the top-bar role selector anytime.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5 rounded-2xl bg-brand-50/60 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-900 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-700 dark:text-brand-300 shrink-0">
            {profile.role === 'Doctor' ? <Stethoscope className="w-4 h-4" /> : profile.role === 'Pharmacist' ? <Pill className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
              {currentRoleConfig.name} Profile Active
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-health-100 dark:bg-health-950 text-health-700 dark:text-health-300 font-semibold">
                Full Clinical Decision Support
              </span>
            </h4>
            <p className="text-xs text-surface-600 dark:text-surface-400 mt-1 leading-relaxed">
              {currentRoleConfig.description} Full algorithmic telemetry, override signing authority, and Tall Man letter validation are enabled.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Clinician Profile Section */}
        <div className="bg-white dark:bg-surface-900 p-6 sm:p-8 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-surface-100 dark:border-surface-800">
            <User className="w-4 h-4 text-health-600" />
            <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">User Identity & Clinical Credentials</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-surface-700 dark:text-surface-300 mb-1">Full Name & Credentials</label>
              <input
                type="text"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-xs text-surface-900 dark:text-surface-100 font-medium focus:outline-hidden focus:ring-2 focus:ring-health-500/20"
                placeholder="e.g. Dr. John Doe, MD or Emily Watson, CPhT"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-surface-700 dark:text-surface-300 mb-1">Institutional Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-xs text-surface-900 dark:text-surface-100 font-medium focus:outline-hidden focus:ring-2 focus:ring-health-500/20"
                placeholder="clinician@hospital.org"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-surface-700 dark:text-surface-300 mb-1">Clinical Perspective / Role</label>
              <select
                value={profile.role}
                onChange={(e) => {
                  const newRole = e.target.value as ClinicalRole;
                  setProfile({ ...profile, role: newRole });
                }}
                className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-xs text-surface-900 dark:text-surface-100 font-medium focus:outline-hidden focus:ring-2 focus:ring-health-500/20"
              >
                <option value="Doctor">Doctor / Physician (Prescriber Decision Support)</option>
                <option value="Pharmacist">Pharmacist (Dispensing & Verification Support)</option>
                <option value="Assistant">Assistant / Technician (Naive Mode: Simple Stop/Go Alerts)</option>
                <option value="Admin">Safety Director / Admin (Surveillance & Formulary Audit)</option>
              </select>
              <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-1">
                Changing your role adapts the user interface, warning cards, and required sign-off levels.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-surface-700 dark:text-surface-300 mb-1">Professional License / Registration ID</label>
              <input
                type="text"
                value={profile.licenseId || ''}
                onChange={(e) => setProfile({ ...profile, licenseId: e.target.value })}
                className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-xs text-surface-900 dark:text-surface-100 font-mono font-medium focus:outline-hidden focus:ring-2 focus:ring-health-500/20"
                placeholder="e.g. MD-LIC-2026-9481 or CPHT-7194"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-surface-700 dark:text-surface-300 mb-1">Hospital / Clinical Facility</label>
              <input
                type="text"
                value={profile.hospital || ''}
                onChange={(e) => setProfile({ ...profile, hospital: e.target.value })}
                className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-xs text-surface-900 dark:text-surface-100 font-medium focus:outline-hidden focus:ring-2 focus:ring-health-500/20"
                placeholder="e.g. St. Jude Regional Hospital"
              />
            </div>
          </div>
        </div>

        {/* AI & Algorithm Settings */}
        <div className="bg-white dark:bg-surface-900 p-6 sm:p-8 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-surface-100 dark:border-surface-800">
            <Sliders className="w-4 h-4 text-health-600" />
            <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">AI Similarity Engine Configuration</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-surface-700 dark:text-surface-300">
                  LASA Similarity Conflict Trigger Threshold
                </label>
                <span className="font-mono font-bold text-health-700 dark:text-health-300 bg-health-50 dark:bg-health-950/60 px-2 py-0.5 rounded border border-health-200 dark:border-health-800">
                  {aiSettings.similarityThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="90"
                value={aiSettings.similarityThreshold}
                onChange={(e) => setAiSettings({ ...aiSettings, similarityThreshold: Number(e.target.value) })}
                className="w-full accent-health-600 cursor-pointer"
              />
              <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-1">
                Pairs with composite similarity scores exceeding this value trigger alert notices. Recommended default: 70%.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-semibold text-surface-700 dark:text-surface-300 mb-1">Risk Sensitivity Profile</label>
                <select
                  value={aiSettings.riskSensitivity}
                  onChange={(e) => setAiSettings({ ...aiSettings, riskSensitivity: e.target.value as any })}
                  className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-xs text-surface-900 dark:text-surface-100 font-medium focus:outline-hidden"
                >
                  <option value="High">High (Zero-Tolerance, Maximum Sensitivity)</option>
                  <option value="Standard">Standard (Hospital Default Protocol)</option>
                  <option value="Permissive">Permissive (Fewer alerts for low similarities)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-surface-700 dark:text-surface-300 mb-1">Phonetic Comparison Algorithm</label>
                <select
                  value={aiSettings.phoneticAlgorithm}
                  onChange={(e) => setAiSettings({ ...aiSettings, phoneticAlgorithm: e.target.value })}
                  className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-xs text-surface-900 dark:text-surface-100 font-medium focus:outline-hidden"
                >
                  <option value="Double Metaphone">Double Metaphone (Recommended for drug names)</option>
                  <option value="Soundex">Standard Soundex</option>
                  <option value="NYSIIS">NYSIIS Phonetic Index</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white dark:bg-surface-900 p-6 sm:p-8 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-surface-100 dark:border-surface-800">
            <Bell className="w-4 h-4 text-health-600" />
            <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">Clinical Notification Settings</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200/80 dark:border-surface-700 cursor-pointer">
              <div>
                <span className="font-bold text-surface-900 dark:text-surface-100 block">High-Risk Alert Interruption</span>
                <span className="text-[11px] text-surface-500 dark:text-surface-400">
                  Display immediate modal interruption for scores &ge; 80% (e.g. Hydroxyzine ↔ Hydralazine)
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifications.highRiskAlerts}
                onChange={(e) => setNotifications({ ...notifications, highRiskAlerts: e.target.checked })}
                className="w-4 h-4 text-health-600 rounded focus:ring-health-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200/80 dark:border-surface-700 cursor-pointer">
              <div>
                <span className="font-bold text-surface-900 dark:text-surface-100 block">Medium-Risk In-App Badges</span>
                <span className="text-[11px] text-surface-500 dark:text-surface-400">
                  Highlight cautionary warnings for similarity between 65% and 79%
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifications.mediumRiskAlerts}
                onChange={(e) => setNotifications({ ...notifications, mediumRiskAlerts: e.target.checked })}
                className="w-4 h-4 text-health-600 rounded focus:ring-health-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200/80 dark:border-surface-700 cursor-pointer">
              <div>
                <span className="font-bold text-surface-900 dark:text-surface-100 block">Prescription OCR Scan Alerts</span>
                <span className="text-[11px] text-surface-500 dark:text-surface-400">
                  Notify immediately upon detection of confused handwritten medications
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifications.prescriptionScanAlerts}
                onChange={(e) => setNotifications({ ...notifications, prescriptionScanAlerts: e.target.checked })}
                className="w-4 h-4 text-health-600 rounded focus:ring-health-500"
              />
            </label>
          </div>
        </div>

        {/* Live Backend System & Database Cluster Status */}
        <div className="bg-white dark:bg-surface-900 p-6 sm:p-8 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-100 dark:border-surface-800">
            <div className="flex items-center gap-2.5">
              <Server className="w-4 h-4 text-health-600" />
              <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">Live Backend Status & Architecture</h3>
            </div>
            <button
              type="button"
              onClick={checkHealth}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-health-600 hover:text-health-700 bg-health-50 dark:bg-health-950/50 px-2.5 py-1 rounded-lg border border-health-200 dark:border-health-800"
            >
              <RefreshCw className={`w-3 h-3 ${backendHealth.status === 'checking' ? 'animate-spin' : ''}`} />
              <span>Ping Health</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200/80 dark:border-surface-700">
              <span className="text-surface-400 font-medium block text-[11px]">Backend API</span>
              <span className={`font-bold flex items-center gap-1.5 mt-1 ${backendHealth.status === 'online' ? 'text-emerald-700 dark:text-emerald-400' : backendHealth.status === 'offline' ? 'text-rose-600' : 'text-amber-600'}`}>
                <span className={`w-2 h-2 rounded-full ${backendHealth.status === 'online' ? 'bg-emerald-500 animate-pulse' : backendHealth.status === 'offline' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                {backendHealth.status === 'online' ? `Online (${backendHealth.latencyMs}ms)` : backendHealth.status === 'offline' ? 'Offline' : 'Checking...'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200/80 dark:border-surface-700">
              <span className="text-surface-400 font-medium block text-[11px]">Core Service</span>
              <span className="text-surface-900 dark:text-surface-100 font-bold flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Flask REST Server
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200/80 dark:border-surface-700">
              <span className="text-surface-400 font-medium block text-[11px]">Formulary Dataset</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                761 Verified Drugs
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200/80 dark:border-surface-700">
              <span className="text-surface-400 font-medium block text-[11px]">ML Architecture</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Soft-Voting Ensemble
              </span>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-health-600 hover:bg-health-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      <ClinicalDisclaimer />
    </div>
  );
};

export default SettingsPage;
