import { NavigationConfig } from '../types/content';

export const INITIAL_NAVIGATION: NavigationConfig = {
  headerItems: [
    { id: 'nav-home', label: 'Home', path: '/', order: 1, visible: true },
    { id: 'nav-games', label: 'Games', path: '/games', order: 2, visible: true },
    { id: 'nav-about', label: 'About Us', path: '/about', order: 3, visible: true },
    { id: 'nav-contact', label: 'Contact', path: '/contact', order: 4, visible: true },
  ],
  ctaLabel: 'Explore Games',
  ctaPath: '/games',
  footer: {
    tagline:
      'Independent mobile game development studio crafting playful, polished Android experiences.',
    copyrightText: 'CandyGame Studio. All rights reserved.',
    columns: [
      {
        id: 'col-studio',
        title: 'Studio',
        links: [
          { id: 'f-home', label: 'Home', path: '/', order: 1, visible: true },
          { id: 'f-games', label: 'Games', path: '/games', order: 2, visible: true },
          { id: 'f-about', label: 'About Us', path: '/about', order: 3, visible: true },
          { id: 'f-contact', label: 'Contact', path: '/contact', order: 4, visible: true },
        ],
      },
      {
        id: 'col-games',
        title: 'Games',
        links: [
          {
            id: 'f-brain',
            label: 'Brain Challenge',
            path: '/games/brain-challenge',
            order: 1,
            visible: true,
          },
          {
            id: 'f-color',
            label: 'Color World',
            path: '/games/color-world',
            order: 2,
            visible: true,
          },
        ],
      },
    ],
  },
};
