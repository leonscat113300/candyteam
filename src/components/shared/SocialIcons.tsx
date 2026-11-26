import React from 'react';

export interface SocialIconProps {
  size?: number;
  className?: string;
}

export const InstagramIcon: React.FC<SocialIconProps> = ({
  size = 18,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={`shrink-0 ${className}`}
  >
    <defs>
      <linearGradient id="cg-ig-grad" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F58529" />
        <stop offset="50%" stopColor="#DD2A7B" />
        <stop offset="100%" stopColor="#8134AF" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#cg-ig-grad)" />
    <circle cx="12" cy="12" r="4.2" stroke="#FFFFFF" strokeWidth="1.8" />
    <circle cx="17.2" cy="6.8" r="1.2" fill="#FFFFFF" />
  </svg>
);

export const YouTubeIcon: React.FC<SocialIconProps> = ({
  size = 18,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={`shrink-0 ${className}`}
  >
    <rect x="2" y="4.5" width="20" height="15" rx="4.5" fill="#FF0000" />
    <path d="M10 9L15.8 12L10 15V9Z" fill="#FFFFFF" />
  </svg>
);

export const SocialPlatformIcon: React.FC<{
  platform: string;
  size?: number;
  className?: string;
}> = ({ platform, size = 18, className = '' }) => {
  const normalized = platform.toLowerCase();
  if (normalized.includes('instagram')) {
    return <InstagramIcon size={size} className={className} />;
  }
  if (normalized.includes('youtube')) {
    return <YouTubeIcon size={size} className={className} />;
  }
  return null;
};
