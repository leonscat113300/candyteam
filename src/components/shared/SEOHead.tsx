import React, { useEffect } from 'react';
import { SEOData } from '../../types/content';

export interface SEOHeadProps {
  seo?: Partial<SEOData>;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  seo,
  fallbackTitle = 'CandyGame — Mobile Game Development Studio',
  fallbackDescription = 'CandyGame mobile game development studio.',
}) => {
  useEffect(() => {
    const title = seo?.title || fallbackTitle;
    const description = seo?.description || fallbackDescription;

    document.title = title;

    const descTag = document.querySelector('meta[name="description"]');
    if (descTag) {
      descTag.setAttribute('content', description);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    }

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', description);
    }
  }, [seo?.title, seo?.description, fallbackTitle, fallbackDescription]);

  return null;
};
