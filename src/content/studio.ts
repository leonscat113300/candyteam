import { ContactInfo, StudioInfo } from '../types/content';
import { STUDIO_ASSETS } from './assets';

export const INITIAL_STUDIO_INFO: StudioInfo = {
  studioName: 'CandyGame',
  tagline: 'Playful Worlds. Precision Mobile Craft.',
  shortBio:
    'CandyGame is an independent mobile game development studio creating polished puzzle and casual experiences for Android players worldwide.',
  fullStory:
    'Founded with a passion for tactile, joyful mobile entertainment, CandyGame combines imaginative game design with clean engineering. Every release is crafted from the ground up for mobile ergonomics, combining vibrant visual worlds with intuitive, responsive gameplay.',
  mission:
    'To craft accessible, memorable Android games that spark curiosity, relaxation, and everyday joy.',
  vision:
    'Building a focused catalog of signature puzzle and casual mobile titles defined by enduring craft and player-first design.',
  location: '',
  foundedYear: '',
  logo: STUDIO_ASSETS.logo.url,
};

export const INITIAL_CONTACT_INFO: ContactInfo = {
  email: 'support@candygame.bond',
  supportEmail: 'support@candygame.bond',
  phone: '',
  address: '',
  businessHours: '',
  socialLinks: [
    {
      id: 'social-instagram',
      platform: 'Instagram',
      label: 'Instagram',
      url: 'https://www.instagram.com/candystudiogame?gwpx=ODJ6cWs0Z2owbDZk',
    },
    {
      id: 'social-youtube',
      platform: 'YouTube',
      label: 'YouTube',
      url: 'https://www.youtube.com/channel/UCIkhGA6X_ynyBiJ4RP2W2GA',
    },
  ],
  googlePlayDeveloperUrl: '',
};
