import {
  CandyGameDataStore,
  Category,
  ContactInfo,
  ContactSubmission,
  Game,
  GeneralSettings,
  NavigationConfig,
  PageContent,
  PageSlug,
  SiteSEOConfig,
  StudioInfo,
} from '../types/content';

export interface ContentRepository {
  getAll(): Promise<CandyGameDataStore>;
  resetToDefaults(): Promise<CandyGameDataStore>;

  getPage(slug: PageSlug): Promise<PageContent | null>;
  listPages(): Promise<Record<PageSlug, PageContent>>;
  updatePage(slug: PageSlug, data: Partial<PageContent>): Promise<PageContent>;

  listGames(): Promise<Game[]>;
  getGame(idOrSlug: string): Promise<Game | null>;
  createGame(data: Game): Promise<Game>;
  updateGame(id: string, data: Partial<Game>): Promise<Game>;
  deleteGame(id: string): Promise<void>;

  listCategories(): Promise<Category[]>;
  createCategory(data: Category): Promise<Category>;
  updateCategory(id: string, data: Partial<Category>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  getStudioInfo(): Promise<StudioInfo>;
  updateStudioInfo(data: Partial<StudioInfo>): Promise<StudioInfo>;

  getContactInfo(): Promise<ContactInfo>;
  updateContactInfo(data: Partial<ContactInfo>): Promise<ContactInfo>;

  getNavigation(): Promise<NavigationConfig>;
  updateNavigation(data: Partial<NavigationConfig>): Promise<NavigationConfig>;

  getSEOConfig(): Promise<SiteSEOConfig>;
  updateSEOConfig(data: Partial<SiteSEOConfig>): Promise<SiteSEOConfig>;

  getSettings(): Promise<GeneralSettings>;
  updateSettings(data: Partial<GeneralSettings>): Promise<GeneralSettings>;

  listContactSubmissions(): Promise<ContactSubmission[]>;
  addContactSubmission(
    submission: Omit<ContactSubmission, 'id' | 'submittedAt' | 'status'>
  ): Promise<ContactSubmission>;
  updateContactSubmissionStatus(
    id: string,
    status: ContactSubmission['status']
  ): Promise<void>;
}
