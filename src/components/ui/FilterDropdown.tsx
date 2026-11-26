import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDropdownProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  className?: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  onChange,
  options,
  className = '',
}) => {
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {label ? (
        <span className="mr-2 text-xs font-medium text-[#cbc3d6] whitespace-nowrap">
          {label}
        </span>
      ) : null}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none rounded-2xl bg-[#1F1A35] pl-4 pr-9 py-2.5 text-sm text-[#e7defa] border border-[#77718B]/30 transition-all duration-150 focus:outline-none focus:border-[#7652D6] focus:ring-[3px] focus:ring-[#7652D6]/35 cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#1F1A35] text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#cbc3d6]"
        />
      </div>
    </div>
  );
};
