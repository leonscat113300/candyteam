import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Menu } from 'lucide-react';
import { Button } from '../ui/Button';

export interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onOpenSidebar: () => void;
  action?: React.ReactNode;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  onOpenSidebar,
  action,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-[#BDA7FF]/10 bg-[#151123]/85 backdrop-blur-xl px-5 sm:px-8 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Open admin menu"
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#1F1A35] border border-[#BDA7FF]/20 text-white cursor-pointer shrink-0"
          >
            <Menu size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-white truncate">
              {title}
            </h1>
            {subtitle ? (
              <p className="text-xs sm:text-sm text-[#cbc3d6] truncate">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {action}
          <Link to="/" className="hidden sm:inline-block">
            <Button variant="secondary" size="sm" rightIcon={<ExternalLink size={14} />}>
              Public Site
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
