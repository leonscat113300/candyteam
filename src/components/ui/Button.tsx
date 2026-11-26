import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className = '',
  children,
  type = 'button',
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cebdff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#151123]';

  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
      'bg-[#7652D6] text-white candy-glow-btn hover:bg-[#8462e0] hover:scale-[1.02] active:scale-[0.99]',
    secondary:
      'bg-[#272143]/70 text-[#BDA7FF] border border-[#BDA7FF]/25 backdrop-blur-md hover:border-[#BDA7FF] hover:text-white',
    ghost:
      'bg-transparent text-[#cbc3d6] hover:bg-[#272143]/70 hover:text-white',
    danger:
      'bg-[#93000a]/80 text-[#ffdad6] border border-[#ffb4ab]/30 hover:bg-[#b3141f] hover:text-white',
  };

  const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-sm',
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
    </button>
  );
};
