import React from 'react';

interface MetricGaugeProps {
  label: string;
  value: number; // 0 - 100
  subtitle?: string;
  type?: 'bar' | 'circle';
  variant?: 'danger' | 'warning' | 'primary' | 'success';
}

export const MetricGauge: React.FC<MetricGaugeProps> = ({
  label,
  value,
  subtitle,
  type = 'bar',
  variant
}) => {
  // Determine variant based on score if not explicitly set
  const activeVariant = variant || (value >= 80 ? 'danger' : value >= 65 ? 'warning' : 'primary');

  const colorStyles = {
    danger: {
      bar: 'bg-red-500',
      text: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-100',
      stroke: '#ef4444',
    },
    warning: {
      bar: 'bg-amber-500',
      text: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      stroke: '#f59e0b',
    },
    primary: {
      bar: 'bg-health-600',
      text: 'text-health-700',
      bg: 'bg-health-50',
      border: 'border-health-100',
      stroke: '#0284c7',
    },
    success: {
      bar: 'bg-emerald-500',
      text: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      stroke: '#10b981',
    },
  }[activeVariant];

  if (type === 'circle') {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-surface-200 bg-white shadow-xs">
        <div className="relative w-18 h-18 flex items-center justify-center">
          <svg className="w-18 h-18 transform -rotate-90" viewBox="0 0 70 70">
            <circle
              cx="35"
              cy="35"
              r={radius}
              stroke="#f1f5f9"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="35"
              cy="35"
              r={radius}
              stroke={colorStyles.stroke}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`text-base font-bold font-mono ${colorStyles.text}`}>
              {value}%
            </span>
          </div>
        </div>
        <span className="text-xs font-medium text-surface-700 mt-2 text-center">{label}</span>
        {subtitle && <span className="text-[10px] text-surface-500">{subtitle}</span>}
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-3 rounded-xl border border-surface-200 shadow-xs">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-surface-700">{label}</span>
        <span className={`text-xs font-bold font-mono ${colorStyles.text}`}>{value}%</span>
      </div>
      <div className="w-full bg-surface-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorStyles.bar}`}
          style={{ width: `${value}%` }}
        />
      </div>
      {subtitle && <p className="text-[11px] text-surface-500 mt-1">{subtitle}</p>}
    </div>
  );
};
