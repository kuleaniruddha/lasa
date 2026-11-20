import React, { useState, useRef, useEffect } from 'react';
import { useRole } from '../../context/RoleContext';
import { ClinicalRole } from '../../types/lasa';
import { ChevronDown, Check, Sparkles, Stethoscope, Pill, FileCheck, ShieldAlert } from 'lucide-react';

const ROLE_ICONS: Record<ClinicalRole, React.ReactNode> = {
  Doctor: <Stethoscope className="w-3.5 h-3.5 text-emerald-500" />,
  Pharmacist: <Pill className="w-3.5 h-3.5 text-sky-500" />,
  Assistant: <FileCheck className="w-3.5 h-3.5 text-amber-500" />,
  Admin: <ShieldAlert className="w-3.5 h-3.5 text-purple-500" />
};

export const RoleSwitcher: React.FC = () => {
  const { currentRole, currentRoleConfig, setRole, availableRoles, isNaiveMode } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
          isNaiveMode
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
            : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 hover:border-health-400'
        }`}
        title="Switch clinical perspective / view"
      >
        <span className="flex items-center gap-1.5">
          {ROLE_ICONS[currentRole]}
          <span className="font-bold">{currentRoleConfig.name.split('/')[0].trim()}</span>
        </span>

        {isNaiveMode && (
          <span className="px-1.5 py-0.2 rounded-md bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 text-[10px] font-extrabold uppercase tracking-wider">
            Naive Mode
          </span>
        )}

        <ChevronDown className="w-3.5 h-3.5 text-surface-400 transition-transform duration-200" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-surface-850 rounded-2xl shadow-xl border border-surface-200 dark:border-surface-750 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-surface-100 dark:border-surface-750 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400 dark:text-surface-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-health-600" />
              <span>Switch Perspective / View</span>
            </span>
            <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-0.5">
              Adapts clinical terminology, alerts & workflows to user type.
            </p>
          </div>

          <div className="space-y-1">
            {availableRoles.map((role) => {
              const active = role.id === currentRole;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    setRole(role.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start justify-between cursor-pointer ${
                    active
                      ? 'bg-health-50 dark:bg-health-950/60 border border-health-200 dark:border-health-800/80 text-health-900 dark:text-health-100'
                      : 'hover:bg-surface-50 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      {ROLE_ICONS[role.id]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <strong className="font-bold text-xs truncate">{role.name}</strong>
                        {role.isNaiveMode && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-[9px] font-bold">
                            Naive Mode
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-surface-500 dark:text-surface-400 leading-tight mt-0.5">
                        {role.tagline}
                      </p>
                    </div>
                  </div>

                  {active && (
                    <Check className="w-4 h-4 text-health-600 dark:text-health-400 shrink-0 mt-0.5 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
