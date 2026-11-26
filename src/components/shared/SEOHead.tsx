import React, { useEffect } from 'react';
import { SEOData } from '../../types/content';

export const SITE_ORIGIN = 'https://leonscat113300.github.io/candyteam';

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
    const rawCanonical = (seo?.canonicalUrl || '/').trim();
    const resolvedCanonical = /^https?:\/\//i.test(rawCanonical)
      ? rawCanonical
      : `${SITE_ORIGIN}${rawCanonical.startsWith('/') ? rawCanonical : `/${rawCanonical}`}`;

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

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', resolvedCanonical);
    }

    const canonicalTag = document.querySelector('link[rel="canonical"]');
    if (canonicalTag) {
      canonicalTag.setAttribute('href', resolvedCanonical);
    }
  }, [seo?.title, seo?.description, seo?.canonicalUrl, fallbackTitle, fallbackDescription]);

  return null;
};
