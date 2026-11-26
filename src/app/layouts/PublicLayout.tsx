import React from 'react';
import { Outlet } from 'react-router-dom';
import { useContent } from '../../hooks/useContent';
import { PublicFooter } from '../../components/public/PublicFooter';
import { PublicHeader } from '../../components/public/PublicHeader';

export const PublicLayout: React.FC = () => {
  const { store, loading } = useContent();

  if (loading || !store) {
    return (
      <div className="min-h-screen bg-[#151123] flex items-center justify-center text-[#cbc3d6] text-sm">
        Loading CandyGame...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#151123] text-[#e7defa] relative overflow-x-clip">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(118,82,214,0.22),transparent_70%)]"
      />
      <PublicHeader />
      {store.settings.maintenanceMode ? (
        <div className="relative z-10 bg-amber-500/15 border-b border-amber-400/25 px-5 py-2.5 text-center text-xs text-amber-200">
          Maintenance Mode is currently enabled in General Settings.
        </div>
      ) : null}
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};
