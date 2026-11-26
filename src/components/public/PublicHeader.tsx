import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useContent } from '../../hooks/useContent';
import { BrandLogo } from '../shared/BrandLogo';
import { Button } from '../ui/Button';

export const PublicHeader: React.FC = () => {
  const { store } = useContent();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = (store?.navigation.headerItems || [])
    .filter((item) => item.visible)
    .sort((a, b) => a.order - b.order);

  const ctaLabel = store?.navigation.ctaLabel || 'Explore Games';
  const ctaPath = store?.navigation.ctaPath || '/games';

  return (
    <header className="sticky top-0 z-40 border-b border-[#BDA7FF]/10 bg-[#151123]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-10 h-18 py-3.5">
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cebdff] rounded-xl"
        >
          <BrandLogo />
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-[#cebdff]'
                    : 'text-[#cbc3d6] hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link to={ctaPath}>
            <Button variant="primary" size="sm">
              {ctaLabel}
            </Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#1F1A35] border border-[#BDA7FF]/20 text-white cursor-pointer"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="md:hidden border-t border-[#BDA7FF]/10 bg-[#1d192c]/95 backdrop-blur-xl px-5 py-5 space-y-4">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded-2xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#7652D6]/20 text-[#cebdff] border border-[#BDA7FF]/25'
                      : 'text-[#cbc3d6] hover:text-white hover:bg-[#272143]/70'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
            <Link to={ctaPath} onClick={() => setMobileOpen(false)}>
              <Button variant="primary" size="md" className="w-full">
                {ctaLabel}
              </Button>
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
};
