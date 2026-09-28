import React from 'react';

interface TallManTextProps {
  text: string;
  className?: string;
}

export const TallManText: React.FC<TallManTextProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split into chunks of uppercase and lowercase letters to style uppercase with extra distinction
  const parts = text.match(/[A-Z]+|[a-z0-9\-\s\.]+/g) || [text];

  return (
    <span className={`inline-block font-mono font-medium tracking-tight ${className}`}>
      {parts.map((part, index) => {
        const isUpper = /^[A-Z]+$/.test(part) && part.length > 1;
        if (isUpper) {
          return (
            <span
              key={index}
              className="font-bold text-health-800 bg-health-50 px-1 py-0.5 rounded border border-health-200 tracking-wider shadow-2xs"
            >
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};
