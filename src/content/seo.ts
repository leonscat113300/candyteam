import { SiteSEOConfig } from '../types/content';

export const INITIAL_SEO_CONFIG: SiteSEOConfig = {
  siteName: 'CandyGame',
  titleTemplate: '%s | CandyGame',
  defaultSeo: {
    title: 'CandyGame — Mobile Game Development Studio',
    description:
      'CandyGame is a mobile game development studio building Brain Challenge and Color World for Android and Google Play.',
    canonicalUrl: '/',
    ogImage: '',
    keywords: ['CandyGame', 'Mobile Games', 'Android Games', 'Brain Challenge', 'Color World'],
  },
  pages: {
    home: {
      title: 'CandyGame — Mobile Game Development Studio',
      description:
        'Discover Brain Challenge and Color World, crafted by CandyGame for Android players on Google Play.',
      canonicalUrl: '/',
      ogImage: '',
    },
    games: {
      title: 'Games Catalog — Android & Google Play | CandyGame',
      description:
        'Browse CandyGame mobile titles including Brain Challenge and Color World across Puzzle and Casual Coloring genres.',
      canonicalUrl: '/games',
      ogImage: '',
    },
    'brain-challenge': {
      title: 'Brain Challenge — Puzzle Game for Android | CandyGame',
      description:
        'Explore Brain Challenge by CandyGame, an Android puzzle experience crafted for Google Play.',
      canonicalUrl: '/games/brain-challenge',
      ogImage: '',
    },
    'color-world': {
      title: 'Color World — Casual & Coloring Game for Android | CandyGame',
      description:
        'Explore Color World by CandyGame, a relaxing Android coloring game built for Google Play.',
      canonicalUrl: '/games/color-world',
      ogImage: '',
    },
    about: {
      title: 'About Us — CandyGame Mobile Studio',
      description:
        'Learn about CandyGame, our mobile game development philosophy, and how we design puzzle and casual Android games.',
      canonicalUrl: '/about',
      ogImage: '',
    },
    contact: {
      title: 'Contact — CandyGame Studio',
      description:
        'Get in touch with CandyGame for support, press inquiries, or partnership discussions.',
      canonicalUrl: '/contact',
      ogImage: '',
    },
  },
};
