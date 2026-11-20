import React, { useState } from 'react';
import { X, ShieldAlert, FileCheck, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { lasaService } from '../../services/lasaService';
import { authService } from '../../services/authService';

interface OverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  drug1: string;
  drug2: string;
  onOverrideSuccess?: () => void;
}

export const OverrideModal: React.FC<OverrideModalProps> = ({
  isOpen,
  onClose,
  drug1,
  drug2,
  onOverrideSuccess
}) => {
  const currentUser = authService.getCurrentUser();
  const [reason, setReason] = useState("");
  const [clinicianName, setClinicianName] = useState(currentUser?.displayName || "Clinical Specialist");
  const [clinicianLicense, setClinicianLicense] = useState(currentUser?.licenseId || "CLIN-LIC-2026");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const quickReasons = [
    "Confirmed distinct therapeutic indication with prescribing physician.",
    "Formulations differ: Oral tablet vs topical/injectable form.",
    "Patient is in monitored telemetry unit with active vitals surveillance.",
    "Verified allergy profile and correct strength before dispensing."
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Clinical rationale justification is mandatory for institutional compliance audit.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await lasaService.submitClinicianOverride({
        drug1,
        drug2,
        reason: reason.trim(),
        clinicianName: clinicianName.trim(),
        clinicianLicense: clinicianLicense.trim()
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onOverrideSuccess) onOverrideSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Failed to record override');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-850 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-surface-200 dark:border-surface-750 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-300" />
            <h3 className="text-base sm:text-lg font-bold tracking-tight">Clinical Risk Override Authorization</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-surface-900 dark:text-surface-100">Override Authorized & Recorded</h4>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              Clinician rationale has been logged with cryptographic audit timestamp to compliance registry.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 rounded-r-lg text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                Authorizing formal risk override for collision pair:{' '}
                <strong>{drug1}</strong> ↔ <strong>{drug2}</strong>. This transaction is permanently logged to the pharmacy compliance trail.
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-surface-700 dark:text-surface-300 mb-1">
                  Authorizing Clinician Name
                </label>
                <input
                  type="text"
                  value={clinicianName}
                  onChange={(e) => setClinicianName(e.target.value)}
                  className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-surface-900 dark:text-surface-100"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-surface-700 dark:text-surface-300 mb-1">
                  License / Registration Number
                </label>
                <input
                  type="text"
                  value={clinicianLicense}
                  onChange={(e) => setClinicianLicense(e.target.value)}
                  className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-surface-900 dark:text-surface-100 font-mono"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-surface-700 dark:text-surface-300">
                    Clinical Justification & Safety Rationale *
                  </label>
                  <span className="text-[10px] text-surface-400">Institutional Audit Required</span>
                </div>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter medical justification for proceeding despite LASA similarity..."
                  className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl p-3 text-surface-900 dark:text-surface-100 focus:outline-hidden focus:ring-2 focus:ring-health-500/20"
                  required
                />
              </div>

              {/* Quick Rationale Chips */}
              <div>
                <span className="text-[10px] uppercase font-bold text-surface-400 block mb-1.5">
                  Or select standard rationale:
                </span>
                <div className="space-y-1">
                  {quickReasons.map((qr) => (
                    <button
                      key={qr}
                      type="button"
                      onClick={() => setReason(qr)}
                      className="w-full text-left p-1.5 px-2.5 rounded-lg bg-surface-100 dark:bg-surface-800 hover:bg-health-50 dark:hover:bg-health-950/60 text-[11px] text-surface-700 dark:text-surface-300 transition-colors cursor-pointer truncate"
                    >
                      • {qr}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-surface-100 dark:border-surface-750 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 text-xs font-semibold hover:bg-surface-50 dark:hover:bg-surface-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>{loading ? "Recording..." : "Authorize Override"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
