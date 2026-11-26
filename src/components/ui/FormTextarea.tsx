import React from 'react';

export interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  helperText,
  error,
  id,
  className = '',
  rows = 4,
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
      <textarea
        id={inputId}
        rows={rows}
        className={`w-full rounded-2xl bg-[#1F1A35] px-4 py-3 text-sm text-white placeholder-[#77718B] border transition-all duration-150 focus:outline-none focus:border-[#7652D6] focus:ring-[3px] focus:ring-[#7652D6]/35 resize-y ${
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
