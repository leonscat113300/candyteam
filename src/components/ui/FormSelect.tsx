import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  options,
  helperText,
  error,
  id,
  className = '',
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label ? (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-[#e7defa]"
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full appearance-none rounded-2xl bg-[#1F1A35] px-4 py-3 pr-10 text-sm text-white border transition-all duration-150 focus:outline-none focus:border-[#7652D6] focus:ring-[3px] focus:ring-[#7652D6]/35 ${
            error ? 'border-[#ffb4ab]/60' : 'border-[#77718B]/30'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#1F1A35] text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#cbc3d6]"
        />
      </div>
      {error ? (
        <p className="text-xs text-[#ffb4ab]">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#948e9f]">{helperText}</p>
      ) : null}
    </div>
  );
};
