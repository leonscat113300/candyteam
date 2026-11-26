export interface SEOData {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  keywords?: string[];
}

export interface Game {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  categoryId: string;
  platform: string[];
  storeName: string;
  icon: string;
  featuredImage?: string;
  screenshots: string[];
  googlePlayUrl?: string;
  packageId?: string;
  version?: string;
  releaseDate?: string;
  featuresIntro?: string;
  features: string[];
  featuresOutro?: string;
  status: 'published' | 'draft';
  featured: boolean;
  displayOrder: number;
  seo: SEOData;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  displayOrder: number;
  status: 'active' | 'inactive';
}

export interface NavItem {
  id: string;
  label: string;
  path: string;
  external?: boolean;
  order: number;
  visible: boolean;
}

export interface FooterColumn {
  id: string;
  title: string;
  links: NavItem[];
}

export interface FooterContent {
  tagline: string;
  copyrightText: string;
  columns: FooterColumn[];
}

export interface NavigationConfig {
  headerItems: NavItem[];
  ctaLabel: string;
  ctaPath: string;
  footer: FooterContent;
}

export interface PageSectionItem {
  id: string;
  title: string;
  description: string;
  label?: string;
  image?: string;
}

export interface PageSection {
  id: string;
  heading: string;
  subheading?: string;
  body: string;
  image?: string;
  primaryCtaLabel?: string;
  primaryCtaPath?: string;
  secondaryCtaLabel?: string;
  secondaryCtaPath?: string;
  items?: PageSectionItem[];
}

export type PageSlug =
  | 'home'
  | 'games'
  | 'about'
  | 'contact'
  | 'brain-challenge'
  | 'color-world';

export interface PageContent {
  slug: PageSlug;
  title: string;
  subtitle?: string;
  hero: PageSection;
  sections: Record<string, PageSection>;
  seo: SEOData;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
}

export interface StudioInfo {
  studioName: string;
  tagline: string;
  shortBio: string;
  fullStory: string;
  mission: string;
  vision: string;
  location?: string;
  foundedYear?: string;
  logo: string;
}

export interface ContactInfo {
  email: string;
  supportEmail?: string;
  phone?: string;
  address?: string;
  businessHours?: string;
  socialLinks: SocialLink[];
  googlePlayDeveloperUrl?: string;
}

export interface SiteSEOConfig {
  siteName: string;
  titleTemplate: string;
  defaultSeo: SEOData;
  pages: Record<PageSlug, SEOData>;
}

export interface GeneralSettings {
  siteTitle: string;
  siteLanguage: string;
  primaryColor: string;
  maintenanceMode: boolean;
  showDraftGamesInAdminOnly: boolean;
  gamesPerPage: number;
  enableContactForm: boolean;
  googleAnalyticsId?: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  to?: string;
  subject: string;
  message: string;
  source?: 'contact-form' | 'inbound-email' | 'gmail';
  externalId?: string;
  submittedAt: string;
  status: 'new' | 'reviewed';
}

export interface CandyGameDataStore {
  games: Game[];
  categories: Category[];
  pages: Record<PageSlug, PageContent>;
  studio: StudioInfo;
  contact: ContactInfo;
  navigation: NavigationConfig;
  seo: SiteSEOConfig;
  settings: GeneralSettings;
  contactSubmissions: ContactSubmission[];
}
