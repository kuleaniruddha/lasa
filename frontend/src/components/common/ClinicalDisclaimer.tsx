import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface ClinicalDisclaimerProps {
  compact?: boolean;
  className?: string;
}

export const ClinicalDisclaimer: React.FC<ClinicalDisclaimerProps> = ({ 
  compact = false,
  className = ''
}) => {
  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-surface-500 bg-surface-100/70 px-3 py-1.5 rounded-lg border border-surface-200/80 ${className}`}>
        <ShieldCheck className="w-3.5 h-3.5 text-health-600 shrink-0" />
        <span>Clinical decision-support tool. Does not replace professional clinical judgment.</span>
      </div>
    );
  }

  return (
    <div className={`p-3.5 rounded-xl bg-health-50/50 border border-health-100 flex items-start gap-3 text-xs text-surface-600 ${className}`}>
      <div className="p-1 rounded-md bg-health-100 text-health-700 shrink-0 mt-0.5">
        <ShieldCheck className="w-4 h-4" />
      </div>
      <div>
        <p className="font-semibold text-health-900">Clinical Safety Notice</p>
        <p className="mt-0.5 leading-relaxed">
          LASA-SAFE is an artificial intelligence-assisted clinical decision-support system intended to assist healthcare professionals in identifying look-alike and sound-alike risks. It is not an automated prescriber and does not replace the professional clinical judgment, diagnosis, or pharmacovigilance responsibilities of a registered doctor or pharmacist.
        </p>
      </div>
    </div>
  );
};
