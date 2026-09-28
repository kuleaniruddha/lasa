import React from 'react';
import { RiskLevel } from '../../types/lasa';
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ 
  level, 
  score, 
  size = 'md',
  showIcon = true 
}) => {
  const config = {
    High: {
      bg: 'bg-red-50 text-red-700 border-red-200 ring-red-500/10',
      pill: 'bg-red-600',
      label: 'HIGH RISK',
      icon: AlertTriangle,
    },
    Medium: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10',
      pill: 'bg-amber-500',
      label: 'MEDIUM RISK',
      icon: AlertCircle,
    },
    Low: {
      bg: 'bg-yellow-50 text-yellow-800 border-yellow-200 ring-yellow-500/10',
      pill: 'bg-yellow-500',
      label: 'LOW RISK',
      icon: Info,
    },
    Clear: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10',
      pill: 'bg-emerald-600',
      label: 'CLEAR / NO CONFLICT',
      icon: CheckCircle2,
    },
  }[level] || {
    bg: 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/10',
    pill: 'bg-slate-500',
    label: level,
    icon: Info,
  };

  const Icon = config.icon;
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs ring-1 ${config.bg} ${sizeClasses} transition-all`}
    >
      {showIcon && <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="opacity-75 font-mono text-[11px] ml-0.5">({score}%)</span>
      )}
    </span>
  );
};
