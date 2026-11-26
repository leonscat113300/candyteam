import React, { useRef } from 'react';
import { Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import { Button } from './Button';
import { FormInput } from './FormInput';

export interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  fallbackPreview?: React.ReactNode;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  onChange,
  helperText,
  fallbackPreview,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-2.5">
      <label className="block text-sm font-medium text-[#e7defa]">{label}</label>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-[#1F1A35] border border-[#BDA7FF]/15">
        <div className="w-20 h-20 rounded-2xl bg-[#151123] border border-[#BDA7FF]/20 flex items-center justify-center overflow-hidden shrink-0">
          {value ? (
            <img
              src={value}
              alt={label}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          ) : fallbackPreview ? (
            fallbackPreview
          ) : (
            <ImageIcon size={24} className="text-[#77718B]" />
          )}
        </div>

        <div className="flex-1 w-full space-y-2.5">
          <FormInput
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste image path/URL or upload PNG/JPG/WebP"
          />
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Upload size={14} />}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Image
            </Button>
            {value ? (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Trash2 size={14} />}
                onClick={() => onChange('')}
              >
                Clear
              </Button>
            ) : null}
          </div>
          {helperText ? (
            <p className="text-xs text-[#948e9f]">{helperText}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};
