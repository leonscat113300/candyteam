import React from 'react';
import { Gamepad2 } from 'lucide-react';
import { useContent } from '../../hooks/useContent';

export interface BrandLogoProps {
  compact?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ compact = false }) => {
  const { store } = useContent();
  const studioName = store?.studio.studioName || 'CandyGame';
  const logoSrc = store?.studio.logo || '';

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      {logoSrc ? (
        <img
          src={logoSrc}
          alt={studioName}
          referrerPolicy="no-referrer"
          className="h-10 sm:h-11 w-auto max-w-[140px] rounded-xl object-contain bg-black/70 border border-[#BDA7FF]/25 px-1.5 py-0.5 shadow-[0_0_16px_rgba(118,82,214,0.3)]"
        />
      ) : (
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7652D6] to-[#4f3887] border border-[#BDA7FF]/35 shadow-[0_0_20px_rgba(118,82,214,0.45)] text-white">
          <Gamepad2 size={18} />
        </span>
      )}
      {!compact ? (
        <span className="font-display text-lg font-bold tracking-tight text-white">
          {studioName}
        </span>
      ) : null}
    </span>
  );
};
