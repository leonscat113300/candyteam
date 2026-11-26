import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  if (totalItems === 0) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  const pages = Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-white/10">
      <p className="text-xs text-[#cbc3d6] tabular-nums">
        Showing <span className="font-semibold text-white">{start}</span>–
        <span className="font-semibold text-white">{end}</span> of{' '}
        <span className="font-semibold text-white">{totalItems}</span>
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#1F1A35] border border-[#BDA7FF]/20 text-[#cbc3d6] hover:text-white hover:border-[#BDA7FF]/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-full text-xs font-semibold tabular-nums transition-all cursor-pointer ${
              page === currentPage
                ? 'bg-[#7652D6] text-white candy-glow-btn'
                : 'bg-[#1F1A35] text-[#cbc3d6] border border-[#BDA7FF]/15 hover:text-white hover:border-[#BDA7FF]/40'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#1F1A35] border border-[#BDA7FF]/20 text-[#cbc3d6] hover:text-white hover:border-[#BDA7FF]/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
