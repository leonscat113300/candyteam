import React from 'react';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  helperText,
  error,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label ? (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[#e7defa]"
        >
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={`w-full rounded-2xl bg-[#1F1A35] px-4 py-3 text-sm text-white placeholder-[#77718B] border transition-all duration-150 focus:outline-none focus:border-[#7652D6] focus:ring-[3px] focus:ring-[#7652D6]/35 ${
          error ? 'border-[#ffb4ab]/60' : 'border-[#77718B]/30'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-[#ffb4ab]">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#948e9f]">{helperText}</p>
      ) : null}
    </div>
  );
};
