import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}) => {
  return (
    <div className={`relative w-full ${className}`}>
      <Search
        size={16}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#948e9f]"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl bg-[#1F1A35] pl-10 pr-10 py-2.5 text-sm text-white placeholder-[#77718B] border border-[#77718B]/30 transition-all duration-150 focus:outline-none focus:border-[#7652D6] focus:ring-[3px] focus:ring-[#7652D6]/35"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#948e9f] hover:text-white hover:bg-[#2c273b] cursor-pointer"
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
};
