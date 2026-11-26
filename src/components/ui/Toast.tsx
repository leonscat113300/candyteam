import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onDismiss,
}) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#272143]/95 border border-[#BDA7FF]/30 shadow-2xl backdrop-blur-xl text-sm text-white">
      {type === 'success' ? (
        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
      ) : (
        <AlertCircle size={18} className="text-[#ffb4ab] shrink-0" />
      )}
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="p-1 rounded-full text-[#cbc3d6] hover:text-white hover:bg-white/10 cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  );
};
