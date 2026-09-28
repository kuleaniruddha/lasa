import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Sliders, 
  Server, 
  Database, 
  ShieldCheck, 
  Save, 
  CheckCircle2,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';

import { auth } from '../services/firebase';

export const SettingsPage: React.FC = () => {
  const [profile, setProfile] = useState({
    name: auth.currentUser?.displayName || 'Dr. Aniruddha Kule',
    email: auth.currentUser?.email || 'dr.aniruddha@lasasafe.hospital.org',
    role: 'Doctor (Medical Officer & AIML Healthcare Specialist)',
    department: 'Cardiology & Clinical Informatics',
    licenseId: 'MCI-2024-88492'
  });

  const [notifications, setNotifications] = useState({
    highRiskAlerts: true,
    mediumRiskAlerts: true,
    prescriptionScanAlerts: true,
    soundAlerts: false
  });

  const [aiSettings, setAiSettings] = useState({
    similarityThreshold: 70,
    riskSensitivity: 'Standard' as 'Permissive' | 'Standard' | 'High',
    pocaWeight: 0.45,
    phoneticAlgorithm: 'Double Metaphone'
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-2">
              <Settings className="w-3.5 h-3.5" />
              <span>System & Clinical Preferences</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-surface-900 tracking-tight">
              Platform Settings
            </h2>
            <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
              Manage clinician identity, notification rules, AI detection sensitivity, and inspect server cluster health.
            </p>
          </div>

          {isSaved && (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Settings updated successfully</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Clinician Profile Section */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-surface-100">
            <User className="w-4 h-4 text-health-600" />
            <h3 className="text-sm font-bold text-surface-900">Clinician Profile Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-surface-700 mb-1">Full Name & Title</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-xs text-surface-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-health-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-surface-700 mb-1">Clinical Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-xs text-surface-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-health-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-surface-700 mb-1">Clinical Role</label>
              <input
                type="text"
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-xs text-surface-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-health-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-surface-700 mb-1">Medical Registration / Council ID</label>
              <input
                type="text"
                value={profile.licenseId}
                onChange={(e) => setProfile({ ...profile, licenseId: e.target.value })}
                className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-xs text-surface-900 font-mono font-medium focus:outline-hidden focus:ring-2 focus:ring-health-500/20"
              />
            </div>
          </div>
        </div>

        {/* AI & Algorithm Settings */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-surface-100">
            <Sliders className="w-4 h-4 text-health-600" />
            <h3 className="text-sm font-bold text-surface-900">AI Similarity Engine Configuration</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-surface-700">
                  LASA Similarity Conflict Threshold
                </label>
                <span className="font-mono font-bold text-health-700 bg-health-50 px-2 py-0.5 rounded border border-health-200">
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
              <p className="text-[11px] text-surface-500 mt-1">
                Pairs with composite similarity scores exceeding this value trigger alert notices. Recommended: 70%.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-semibold text-surface-700 mb-1">Risk Sensitivity Profile</label>
                <select
                  value={aiSettings.riskSensitivity}
                  onChange={(e) => setAiSettings({ ...aiSettings, riskSensitivity: e.target.value as any })}
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-xs text-surface-900 font-medium focus:outline-hidden"
                >
                  <option value="High">High (Zero-Tolerance, Maximum Alerts)</option>
                  <option value="Standard">Standard (Hospital Default)</option>
                  <option value="Permissive">Permissive (Fewer warnings)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-surface-700 mb-1">Phonetic Algorithm</label>
                <select
                  value={aiSettings.phoneticAlgorithm}
                  onChange={(e) => setAiSettings({ ...aiSettings, phoneticAlgorithm: e.target.value })}
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-xs text-surface-900 font-medium focus:outline-hidden"
                >
                  <option value="Double Metaphone">Double Metaphone (Recommended)</option>
                  <option value="Soundex">Standard Soundex</option>
                  <option value="NYSIIS">NYSIIS Algorithm</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-surface-100">
            <Bell className="w-4 h-4 text-health-600" />
            <h3 className="text-sm font-bold text-surface-900">Clinical Notification Settings</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-200/80 cursor-pointer">
              <div>
                <span className="font-bold text-surface-900 block">High-Risk Alert Popups</span>
                <span className="text-[11px] text-surface-500">
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

            <label className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-200/80 cursor-pointer">
              <div>
                <span className="font-bold text-surface-900 block">Medium-Risk In-App Badges</span>
                <span className="text-[11px] text-surface-500">
                  Highlight warnings in orange for similarity between 65% and 79%
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifications.mediumRiskAlerts}
                onChange={(e) => setNotifications({ ...notifications, mediumRiskAlerts: e.target.checked })}
                className="w-4 h-4 text-health-600 rounded focus:ring-health-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-200/80 cursor-pointer">
              <div>
                <span className="font-bold text-surface-900 block">Prescription OCR Completion Alerts</span>
                <span className="text-[11px] text-surface-500">
                  Notify upon extraction and conflict screening of handwritten prescription batches
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

        {/* System & Database Cluster Status (Useful for final project demonstration) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-surface-100">
            <Server className="w-4 h-4 text-health-600" />
            <h3 className="text-sm font-bold text-surface-900">System Information & Database Status</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200/80">
              <span className="text-surface-400 font-medium block text-[11px]">Cloud Database</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Firebase (lasa-8b8a8)
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200/80">
              <span className="text-surface-400 font-medium block text-[11px]">Medicine Database</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Connected (257+ drugs)
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200/80">
              <span className="text-surface-400 font-medium block text-[11px]">AI Model</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Loaded (v1.0 Ensemble)
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200/80">
              <span className="text-surface-400 font-medium block text-[11px]">OCR Engine</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Available (EasyOCR)
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200/80">
              <span className="text-surface-400 font-medium block text-[11px]">Backend API</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Online (FastAPI Ready)
              </span>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-health-600 hover:bg-health-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2"
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
