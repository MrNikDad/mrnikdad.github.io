import React from 'react';

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  helperText?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  value, 
  onChange, 
  unit, 
  step = 1, 
  min = 0,
  max,
  helperText 
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <div className="relative rounded-md shadow-sm">
        <input
          type="number"
          className="block w-full rounded-md border-slate-300 bg-white text-slate-900 placeholder-slate-400 pl-3 pr-12 py-2 focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm border font-medium"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          step={step}
          min={min}
          max={max}
        />
        {unit && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-slate-500 sm:text-sm font-medium">{unit}</span>
          </div>
        )}
      </div>
      {helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};