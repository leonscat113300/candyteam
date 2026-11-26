import React from 'react';
import { SEOData } from '../../types/content';
import { FormInput } from '../ui/FormInput';
import { FormTextarea } from '../ui/FormTextarea';
import { ImageUploader } from '../ui/ImageUploader';

export interface SEOFormProps {
  value: SEOData;
  onChange: (next: SEOData) => void;
  siteName?: string;
}

export const SEOForm: React.FC<SEOFormProps> = ({
  value,
  onChange,
  siteName = 'CandyGame',
}) => {
  return (
    <div className="space-y-5">
      <FormInput
        label="Meta Title"
        value={value.title}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
        placeholder={`${siteName} — Page Title`}
        helperText={`${value.title.length} / 60 recommended characters`}
      />

      <FormTextarea
        label="Meta Description"
        rows={3}
        value={value.description}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
        placeholder="Concise summary for search engines and social previews"
        helperText={`${value.description.length} / 160 recommended characters`}
      />

      <FormInput
        label="Canonical URL / Path"
        value={value.canonicalUrl || ''}
        onChange={(e) => onChange({ ...value, canonicalUrl: e.target.value })}
        placeholder="/games/brain-challenge"
      />

      <ImageUploader
        label="OpenGraph Social Image"
        value={value.ogImage || ''}
        onChange={(ogImage) => onChange({ ...value, ogImage })}
        helperText="Optional image path or uploaded asset used for social share cards."
      />

      <div className="rounded-2xl bg-[#151123] border border-[#BDA7FF]/15 p-4 space-y-1.5">
        <p className="text-xs font-semibold text-[#BDA7FF]">Search Result Preview</p>
        <p className="text-base font-medium text-[#cebdff] truncate">
          {value.title || 'Untitled Page'}
        </p>
        <p className="text-xs text-emerald-300/80 truncate">
          https://candygame.bond{value.canonicalUrl || '/'}
        </p>
        <p className="text-xs text-[#cbc3d6] line-clamp-2">
          {value.description || 'No meta description set yet.'}
        </p>
      </div>
    </div>
  );
};
