import { PageContent, PageSlug } from '../types/content';
import { STUDIO_ASSETS } from './assets';
import { INITIAL_SEO_CONFIG } from './seo';

export const INITIAL_PAGES: Record<PageSlug, PageContent> = {
  home: {
    slug: 'home',
    title: 'Home',
    subtitle: 'CandyGame Studio',
    hero: {
      id: 'home-hero',
      heading: 'Playful Mobile Worlds Crafted with Precision',
      subheading: 'Mobile Game Development Studio',
      body: 'CandyGame designs and develops expressive Android games that blend intuitive touch mechanics with imaginative visual worlds. Explore our signature releases.',
      image: STUDIO_ASSETS.homeHeroStudio.url,
      primaryCtaLabel: 'Explore Games',
      primaryCtaPath: '/games',
      secondaryCtaLabel: 'About Studio',
      secondaryCtaPath: '/about',
    },
    sections: {
      featuredGames: {
        id: 'home-featured-games',
        heading: 'Featured Android Titles',
        subheading: 'Current Studio Releases',
        body: 'Built exclusively with mobile players in mind, our catalog focuses on clarity, polish, and rewarding everyday sessions.',
        primaryCtaLabel: 'View All Games',
        primaryCtaPath: '/games',
      },
      craftPillars: {
        id: 'home-craft-pillars',
        heading: 'How We Build Games',
        subheading: 'Studio Philosophy',
        body: 'Every CandyGame release follows a disciplined design and engineering loop built around immediate player delight.',
        items: [
          {
            id: 'pillar-1',
            title: '01. Tactile Mobile Ergonomics',
            description:
              'Every tap, drag, and transition is tuned for single-handed and two-thumb Android play across phone and tablet screens.',
            image: STUDIO_ASSETS.pillarErgonomics.url,
          },
          {
            id: 'pillar-2',
            title: '02. Expressive Visual Identity',
            description:
              'Vibrant color palettes, clean spatial hierarchy, and distraction-free interfaces keep players immersed in the game.',
            image: STUDIO_ASSETS.pillarVisualIdentity.url,
          },
          {
            id: 'pillar-3',
            title: '03. Focused Replayability',
            description:
              'From brain-teasing puzzle logic to calming coloring sessions, our mechanics reward both quick breaks and longer play.',
            image: STUDIO_ASSETS.pillarReplayability.url,
          },
        ],
      },
      studioCta: {
        id: 'home-studio-cta',
        heading: 'Have a Question or Collaboration Idea?',
        subheading: 'Connect with CandyGame',
        body: 'Reach out to our team for player support, publishing inquiries, or studio updates.',
        primaryCtaLabel: 'Contact Studio',
        primaryCtaPath: '/contact',
      },
    },
    seo: INITIAL_SEO_CONFIG.pages.home,
  },
  games: {
    slug: 'games',
    title: 'Games',
    subtitle: 'Our Mobile Catalog',
    hero: {
      id: 'games-hero',
      heading: 'Our Android Game Catalog',
      subheading: 'Google Play Releases',
      body: 'Browse all titles developed by CandyGame. Search to explore game mechanics, platform details, and store availability.',
    },
    sections: {
      catalogIntro: {
        id: 'games-catalog-intro',
        heading: 'Designed for Android',
        body: 'Select any title below to inspect full game details, key features, and Google Play links.',
      },
    },
    seo: INITIAL_SEO_CONFIG.pages.games,
  },
  'brain-challenge': {
    slug: 'brain-challenge',
    title: 'Brain Challenge',
    subtitle: 'Android · Google Play',
    hero: {
      id: 'brain-challenge-hero',
      heading: 'Brain Challenge',
      subheading: 'Android · Google Play',
      body: 'Challenge your mind with creative puzzles, tricky brain teasers, and unexpected challenges! Test your logic, boost your creativity, think outside the box, and discover surprising solutions in a fun and addictive casual puzzle game. Play anytime, anywhere, even offline!',
      primaryCtaLabel: 'Get on Google Play',
      primaryCtaPath: '',
      secondaryCtaLabel: 'All Games',
      secondaryCtaPath: '/games',
    },
    sections: {
      overview: {
        id: 'brain-challenge-overview',
        heading: 'About the Game',
        body: 'Welcome to Brain Challenge, a fun and addictive casual puzzle game designed to test your creativity, challenge your thinking, and entertain you with clever puzzles and unexpected solutions!',
      },
      highlights: {
        id: 'brain-challenge-highlights',
        heading: 'Key Features',
        body: 'Discover what makes Brain Challenge a fun and exciting puzzle experience!',
      },
      gallery: {
        id: 'brain-challenge-gallery',
        heading: 'Media & Screenshots',
        body: 'Official gameplay screenshots managed through the studio repository.',
      },
    },
    seo: INITIAL_SEO_CONFIG.pages['brain-challenge'],
  },
  'color-world': {
    slug: 'color-world',
    title: 'Color World',
    subtitle: 'Android · Google Play',
    hero: {
      id: 'color-world-hero',
      heading: 'Color World',
      subheading: 'Android · Google Play',
      body: 'Explore a colorful world of creativity! Color adorable pictures, paint cute characters, choose your favorite colors, and enjoy a fun and relaxing coloring adventure designed for kids. Let your imagination shine with Color World!',
      primaryCtaLabel: 'Get on Google Play',
      primaryCtaPath: '',
      secondaryCtaLabel: 'All Games',
      secondaryCtaPath: '/games',
    },
    sections: {
      overview: {
        id: 'color-world-overview',
        heading: 'About the Game',
        body: 'Welcome to Color World, a fun and creative coloring game designed for kids! Explore a wonderful world of colorful pictures, adorable characters, and exciting coloring activities.',
      },
      highlights: {
        id: 'color-world-highlights',
        heading: 'Key Features',
        body: 'Discover a world full of colors, creativity, and fun with Color World!',
      },
      gallery: {
        id: 'color-world-gallery',
        heading: 'Media & Screenshots',
        body: 'Official gameplay screenshots managed through the studio repository.',
      },
    },
    seo: INITIAL_SEO_CONFIG.pages['color-world'],
  },
  about: {
    slug: 'about',
    title: 'About Us',
    subtitle: 'Inside CandyGame',
    hero: {
      id: 'about-hero',
      heading: 'Crafting Playful Digital Worlds',
      subheading: 'About CandyGame',
      body: 'We are a mobile game development studio focused on building intuitive, atmospheric, and enduring experiences for Android.',
      primaryCtaLabel: 'Explore Our Games',
      primaryCtaPath: '/games',
    },
    sections: {
      story: {
        id: 'about-story',
        heading: 'Our Studio Story',
        body: 'CandyGame was created around a straightforward goal: deliver mobile games that respect the player’s time while sparking genuine delight through thoughtful design and polished presentation.',
        image: STUDIO_ASSETS.aboutStudioStory.url,
      },
      missionVision: {
        id: 'about-mission-vision',
        heading: 'Mission',
        body: 'Guided by player-first craftsmanship and enduring creative joy.',
        image: STUDIO_ASSETS.aboutMissionVision.url,
      },
      vision: {
        id: 'about-vision',
        heading: 'Vision',
        body: 'Building a focused catalog of signature puzzle and casual mobile titles defined by enduring craft and player-first design.',
        image: STUDIO_ASSETS.aboutVision.url,
      },
      values: {
        id: 'about-values',
        heading: 'Core Studio Values',
        body: 'The principles guiding every prototype, art pass, and release.',
        items: [
          {
            id: 'val-1',
            title: 'Player-First Clarity',
            description:
              'Clean interfaces, intuitive onboarding, and responsive touch feedback from the very first tap.',
            image: STUDIO_ASSETS.aboutValueClarity.url,
          },
          {
            id: 'val-2',
            title: 'Creative Craftsmanship',
            description:
              'Cohesive color systems, playful geometry, and attention to subtle interactive polish.',
            image: STUDIO_ASSETS.aboutValueCraft.url,
          },
          {
            id: 'val-3',
            title: 'Dependable Engineering',
            description:
              'Smooth performance and lightweight builds tailored across a wide spectrum of Android devices.',
            image: STUDIO_ASSETS.aboutValueEngineering.url,
          },
        ],
      },
    },
    seo: INITIAL_SEO_CONFIG.pages.about,
  },
  contact: {
    slug: 'contact',
    title: 'Contact',
    subtitle: 'Get in Touch',
    hero: {
      id: 'contact-hero',
      heading: 'Connect with CandyGame',
      subheading: 'Studio Inquiries & Player Support',
      body: 'Have feedback about Brain Challenge or Color World, or want to reach the CandyGame team? Send us a message below or email us directly at support@candygame.bond.',
    },
    sections: {
      formIntro: {
        id: 'contact-form-intro',
        heading: 'Send a Message',
        body: 'Send your inquiry directly to CandyGame (support@candygame.bond). Messages are also logged in the Admin Panel inbox.',
      },
      directDetails: {
        id: 'contact-direct-details',
        heading: 'Studio Contact Information',
        body: 'Reach CandyGame directly via email or connect with us on our official social channels.',
      },
    },
    seo: INITIAL_SEO_CONFIG.pages.contact,
  },
};
