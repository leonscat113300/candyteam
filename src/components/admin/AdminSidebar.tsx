import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Building2,
  ExternalLink,
  FileText,
  FolderKanban,
  Gamepad2,
  Globe,
  LayoutDashboard,
  Link2,
  LogOut,
  PlusCircle,
  Settings,
  X,
} from 'lucide-react';
import { BrandLogo } from '../shared/BrandLogo';

export interface AdminSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  onSignOut?: () => void;
}

const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Games', path: '/admin/games', icon: Gamepad2, end: true },
  { label: 'Add Game', path: '/admin/games/new', icon: PlusCircle, end: true },
  { label: 'Categories', path: '/admin/categories', icon: FolderKanban, end: true },
  { label: 'Downloads & Links', path: '/admin/downloads', icon: Link2, end: true },
  { label: 'Website Content', path: '/admin/content', icon: FileText, end: true },
  { label: 'Studio & Contact', path: '/admin/studio-contact', icon: Building2, end: true },
  { label: 'SEO Settings', path: '/admin/seo', icon: Globe, end: true },
  { label: 'General Settings', path: '/admin/settings', icon: Settings, end: true },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  mobileOpen,
  onClose,
  onSignOut,
}) => {
  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#0f0b1e] border-r border-[#BDA7FF]/12 p-5">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 px-2">
          <Link to="/admin" onClick={onClose} className="inline-flex items-center gap-2">
            <BrandLogo />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close admin menu"
            className="lg:hidden p-1.5 rounded-full text-[#cbc3d6] hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <nav aria-label="Admin navigation" className="space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#7652D6] text-white candy-glow-btn'
                      : 'text-[#cbc3d6] hover:text-white hover:bg-[#1F1A35]'
                  }`
                }
              >
                <Icon size={17} className="shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-white/10 space-y-2">
        <Link
          to="/"
          className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-[#1F1A35] border border-[#BDA7FF]/15 text-sm font-medium text-[#cebdff] hover:text-white hover:border-[#BDA7FF]/40 transition-colors"
        >
          <span>View Public Site</span>
          <ExternalLink size={15} />
        </Link>
        {onSignOut ? (
          <button
            type="button"
            onClick={() => {
              onClose();
              onSignOut();
            }}
            className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-[#151123] border border-[#ffb4ab]/20 text-sm font-medium text-[#ffb4ab] hover:bg-[#93000a]/30 hover:text-white transition-colors cursor-pointer"
          >
            <span>Sign Out</span>
            <LogOut size={15} />
          </button>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-68 shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#0f0b1e]/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] h-full">
            {sidebarContent}
          </aside>
        </div>
      ) : null}
    </>
  );
};
