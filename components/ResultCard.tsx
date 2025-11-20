import React from 'react';

interface ResultCardProps {
  title: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
  subtext?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ title, value, unit, highlight, subtext }) => {
  return (
    <div className={`p-4 rounded-lg shadow-sm border ${highlight ? 'bg-cyan-50 border-cyan-200' : 'bg-white border-slate-100'}`}>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</h3>
      <div className="mt-1 flex items-baseline">
        <span className={`text-2xl font-bold ${highlight ? 'text-cyan-700' : 'text-slate-800'}`}>
          {value}
        </span>
        {unit && <span className="ml-1 text-sm text-slate-600">{unit}</span>}
      </div>
      {subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
    </div>
  );
};