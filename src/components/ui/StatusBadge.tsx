import React from 'react';

export interface StatusBadgeProps {
  status: 'published' | 'draft' | 'active' | 'inactive' | 'featured' | 'new' | 'reviewed' | 'tag';
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className = '',
}) => {
  const styles: Record<StatusBadgeProps['status'], string> = {
    published: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/25',
    active: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/25',
    draft: 'bg-amber-500/15 text-amber-200 border-amber-400/25',
    inactive: 'bg-[#363247] text-[#cbc3d6] border-[#948e9f]/25',
    featured: 'bg-[#BDA7FF] text-[#252033] border-[#BDA7FF]',
    new: 'bg-[#7652D6]/25 text-[#cebdff] border-[#BDA7FF]/30',
    reviewed: 'bg-[#363247] text-[#cbc3d6] border-[#948e9f]/25',
    tag: 'bg-[#7652D6]/15 text-[#BDA7FF] border-[#BDA7FF]/20',
  };

  const defaultLabels: Record<StatusBadgeProps['status'], string> = {
    published: 'Published',
    active: 'Active',
    draft: 'Draft',
    inactive: 'Inactive',
    featured: 'Featured',
    new: 'New',
    reviewed: 'Reviewed',
    tag: 'Tag',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap shrink-0 ${styles[status]} ${className}`}
    >
      {label ?? defaultLabels[status]}
    </span>
  );
};
