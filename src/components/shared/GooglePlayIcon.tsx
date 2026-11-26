import React from 'react';

export interface GooglePlayIconProps {
  size?: number;
  className?: string;
}

export const GooglePlayIcon: React.FC<GooglePlayIconProps> = ({
  size = 18,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <path
        d="M3.61 1.814L13.793 12L3.61 22.186a1.75 1.75 0 0 1-.61-1.34V3.154c0-.517.224-.998.61-1.34Z"
        fill="#4285F4"
      />
      <path
        d="M17.207 8.586L13.793 12l3.414 3.414l3.857-2.202c.78-.445.78-1.979 0-2.424l-3.857-2.202Z"
        fill="#FBBC05"
      />
      <path
        d="M3.61 22.186L13.793 12l3.414 3.414l-12.163 6.943c-.538.307-1.132.226-1.434-.171Z"
        fill="#EA4335"
      />
      <path
        d="M17.207 8.586L5.044 1.643c-.538-.307-1.132-.226-1.434.171L13.793 12l3.414-3.414Z"
        fill="#34A853"
      />
    </svg>
  );
};
