import { INITIAL_CATEGORIES } from '../content/categories';
import { INITIAL_GAMES } from '../content/games';
import { INITIAL_NAVIGATION } from '../content/navigation';
import { INITIAL_PAGES } from '../content/pages';
import { INITIAL_SEO_CONFIG } from '../content/seo';
import { INITIAL_SETTINGS } from '../content/settings';
import { INITIAL_CONTACT_INFO, INITIAL_STUDIO_INFO } from '../content/studio';
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
import { ContentRepository } from './ContentRepository';

const LEGACY_STORAGE_KEY = 'candygame_cms_store_v1';
const STORAGE_KEY = 'candygame_cms_store_v2';

function normalizeAssetUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('/assets/') || url.startsWith('/src/assets/')) {
    return `.${url}`;
  }
  return url;
}

function cloneDefaults(): CandyGameDataStore {
  return structuredClone({
    games: INITIAL_GAMES,
    categories: INITIAL_CATEGORIES,
    pages: INITIAL_PAGES,
    studio: INITIAL_STUDIO_INFO,
    contact: INITIAL_CONTACT_INFO,
    navigation: INITIAL_NAVIGATION,
    seo: INITIAL_SEO_CONFIG,
    settings: INITIAL_SETTINGS,
    contactSubmissions: [],
  });
}

export class LocalStorageRepository implements ContentRepository {
  private readStore(): CandyGameDataStore {
    const defaults = cloneDefaults();
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaults;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacyRaw) {
          try {
            const legacy = JSON.parse(legacyRaw) as Partial<CandyGameDataStore>;
            if (Array.isArray(legacy.games)) {
              defaults.games = defaults.games.map((g) => {
                const prev = legacy.games?.find(
                  (lg) => lg.id === g.id || lg.slug === g.slug
                );
                if (!prev) return g;
                return {
                  ...g,
                  googlePlayUrl: prev.googlePlayUrl || g.googlePlayUrl,
                  packageId: prev.packageId || g.packageId,
                  version: prev.version || g.version,
                  screenshots:
                    Array.isArray(prev.screenshots) && prev.screenshots.length > 0
                      ? prev.screenshots
                      : g.screenshots,
                };
              });
            }
            if (Array.isArray(legacy.contactSubmissions)) {
              defaults.contactSubmissions = legacy.contactSubmissions;
            }
          } catch {
            // Ignore malformed legacy store
          }
        }
        this.writeStore(defaults);
        return defaults;
      }

      const parsed = JSON.parse(raw) as Partial<CandyGameDataStore> | null;
      if (!parsed || typeof parsed !== 'object') {
        this.writeStore(defaults);
        return defaults;
      }

      const games = Array.isArray(parsed.games)
        ? parsed.games.map((g) => {
            const isLegacyIcon = !g.icon || g.icon.startsWith('/src/assets/images/');
            const fallbackGame = defaults.games.find(
              (d) => d.id === g.id || d.slug === g.slug
            );
            const icon = isLegacyIcon
              ? fallbackGame?.icon || g.icon
              : normalizeAssetUrl(g.icon);
            return {
              ...g,
              icon,
              featuredImage: g.featuredImage
                ? normalizeAssetUrl(g.featuredImage)
                : g.featuredImage,
            };
          })
        : defaults.games;

      const parsedLogo =
        parsed.studio && typeof parsed.studio === 'object' ? parsed.studio.logo : '';
      const isLegacyLogo = !parsedLogo || parsedLogo.startsWith('/src/assets/images/');

      const studio =
        parsed.studio && typeof parsed.studio === 'object'
          ? {
              ...defaults.studio,
              ...parsed.studio,
              logo: isLegacyLogo
                ? defaults.studio.logo
                : normalizeAssetUrl(parsedLogo),
            }
          : defaults.studio;

      const normalizeSections = (
        sections: Record<string, any> | undefined
      ): Record<string, any> => {
        if (!sections || typeof sections !== 'object') return {};
        const next: Record<string, any> = {};
        for (const [key, sec] of Object.entries(sections)) {
          if (!sec || typeof sec !== 'object') {
            next[key] = sec;
            continue;
          }
          next[key] = {
            ...sec,
            image: sec.image ? normalizeAssetUrl(sec.image) : sec.image,
            items: Array.isArray(sec.items)
              ? sec.items.map((item: any) => ({
                  ...item,
                  image: item?.image ? normalizeAssetUrl(item.image) : item?.image,
                }))
              : sec.items,
          };
        }
        return next;
      };

      const rawPages =
        parsed.pages && typeof parsed.pages === 'object'
          ? {
              ...defaults.pages,
              ...parsed.pages,
              about: {
                ...defaults.pages.about,
                ...(parsed.pages.about || {}),
                sections: {
                  ...defaults.pages.about.sections,
                  ...(parsed.pages.about?.sections || {}),
                  vision:
                    parsed.pages.about?.sections?.vision ||
                    defaults.pages.about.sections.vision,
                },
              },
            }
          : defaults.pages;

      const normalizedPages = Object.fromEntries(
        Object.entries(rawPages).map(([slug, page]) => [
          slug,
          {
            ...page,
            sections: normalizeSections(page.sections),
          },
        ])
      ) as CandyGameDataStore['pages'];

      const migrateLegacyEmail = (val?: string) =>
        typeof val === 'string'
          ? val.replace(/candyteam@info\.com/gi, 'support@candygame.bond')
          : val;

      const normalizedContact =
        parsed.contact && typeof parsed.contact === 'object'
          ? {
              ...defaults.contact,
              ...parsed.contact,
              email:
                !parsed.contact.email || parsed.contact.email === 'candyteam@info.com'
                  ? defaults.contact.email
                  : parsed.contact.email,
              supportEmail:
                !parsed.contact.supportEmail ||
                parsed.contact.supportEmail === 'candyteam@info.com'
                  ? defaults.contact.supportEmail
                  : parsed.contact.supportEmail,
            }
          : defaults.contact;

      if (normalizedPages.contact) {
        normalizedPages.contact = {
          ...normalizedPages.contact,
          hero: {
            ...normalizedPages.contact.hero,
            body: migrateLegacyEmail(normalizedPages.contact.hero.body) || '',
          },
          sections: {
            ...normalizedPages.contact.sections,
            formIntro: normalizedPages.contact.sections.formIntro
              ? {
                  ...normalizedPages.contact.sections.formIntro,
                  body:
                    migrateLegacyEmail(
                      normalizedPages.contact.sections.formIntro.body
                    ) || '',
                }
              : normalizedPages.contact.sections.formIntro,
          },
        };
      }

      return {
        games,
        categories: Array.isArray(parsed.categories)
          ? parsed.categories
          : defaults.categories,
        pages: normalizedPages,
        studio,
        contact: normalizedContact,
        navigation:
          parsed.navigation && typeof parsed.navigation === 'object'
            ? { ...defaults.navigation, ...parsed.navigation }
            : defaults.navigation,
        seo:
          parsed.seo && typeof parsed.seo === 'object'
            ? {
                ...defaults.seo,
                ...parsed.seo,
                defaultSeo: {
                  ...defaults.seo.defaultSeo,
                  ...(parsed.seo.defaultSeo || {}),
                },
                pages: {
                  ...defaults.seo.pages,
                  ...(parsed.seo.pages || {}),
                },
              }
            : defaults.seo,
        settings:
          parsed.settings && typeof parsed.settings === 'object'
            ? { ...defaults.settings, ...parsed.settings }
            : defaults.settings,
        contactSubmissions: Array.isArray(parsed.contactSubmissions)
          ? parsed.contactSubmissions
          : [],
      };
    } catch {
      this.writeStore(defaults);
      return defaults;
    }
  }

  private writeStore(store: CandyGameDataStore): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }

  async getAll(): Promise<CandyGameDataStore> {
    return this.readStore();
  }

  async resetToDefaults(): Promise<CandyGameDataStore> {
    const defaults = cloneDefaults();
    this.writeStore(defaults);
    return defaults;
  }

  async getPage(slug: PageSlug): Promise<PageContent | null> {
    const store = this.readStore();
    return store.pages[slug] ?? null;
  }

  async listPages(): Promise<Record<PageSlug, PageContent>> {
    const store = this.readStore();
    return store.pages;
  }

  async updatePage(slug: PageSlug, data: Partial<PageContent>): Promise<PageContent> {
    const store = this.readStore();
    const existing = store.pages[slug];
    if (!existing) {
      throw new Error(`Page "${slug}" not found`);
    }
    const updated: PageContent = {
      ...existing,
      ...data,
      hero: data.hero ? { ...existing.hero, ...data.hero } : existing.hero,
      sections: data.sections ? { ...existing.sections, ...data.sections } : existing.sections,
      seo: data.seo ? { ...existing.seo, ...data.seo } : existing.seo,
    };
    store.pages[slug] = updated;
    this.writeStore(store);
    return updated;
  }

  async listGames(): Promise<Game[]> {
    const store = this.readStore();
    return [...store.games].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getGame(idOrSlug: string): Promise<Game | null> {
    const store = this.readStore();
    return (
      store.games.find((g) => g.id === idOrSlug || g.slug === idOrSlug) ?? null
    );
  }

  async createGame(data: Game): Promise<Game> {
    const store = this.readStore();
    const duplicate = store.games.some(
      (g) => g.id === data.id || g.slug === data.slug
    );
    if (duplicate) {
      throw new Error('A game with this ID or slug already exists.');
    }
    store.games.push(data);
    this.writeStore(store);
    return data;
  }

  async updateGame(id: string, data: Partial<Game>): Promise<Game> {
    const store = this.readStore();
    const idx = store.games.findIndex((g) => g.id === id);
    if (idx === -1) {
      throw new Error(`Game "${id}" not found`);
    }
    const updated: Game = {
      ...store.games[idx],
      ...data,
      seo: data.seo
        ? { ...store.games[idx].seo, ...data.seo }
        : store.games[idx].seo,
    };
    store.games[idx] = updated;
    this.writeStore(store);
    return updated;
  }

  async deleteGame(id: string): Promise<void> {
    const store = this.readStore();
    store.games = store.games.filter((g) => g.id !== id);
    this.writeStore(store);
  }

  async listCategories(): Promise<Category[]> {
    const store = this.readStore();
    return [...store.categories].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async createCategory(data: Category): Promise<Category> {
    const store = this.readStore();
    store.categories.push(data);
    this.writeStore(store);
    return data;
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const store = this.readStore();
    const idx = store.categories.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new Error(`Category "${id}" not found`);
    }
    const updated: Category = { ...store.categories[idx], ...data };
    store.categories[idx] = updated;
    this.writeStore(store);
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    const store = this.readStore();
    store.categories = store.categories.filter((c) => c.id !== id);
    this.writeStore(store);
  }

  async getStudioInfo(): Promise<StudioInfo> {
    return this.readStore().studio;
  }

  async updateStudioInfo(data: Partial<StudioInfo>): Promise<StudioInfo> {
    const store = this.readStore();
    store.studio = { ...store.studio, ...data };
    this.writeStore(store);
    return store.studio;
  }

  async getContactInfo(): Promise<ContactInfo> {
    return this.readStore().contact;
  }

  async updateContactInfo(data: Partial<ContactInfo>): Promise<ContactInfo> {
    const store = this.readStore();
    store.contact = { ...store.contact, ...data };
    this.writeStore(store);
    return store.contact;
  }

  async getNavigation(): Promise<NavigationConfig> {
    return this.readStore().navigation;
  }

  async updateNavigation(data: Partial<NavigationConfig>): Promise<NavigationConfig> {
    const store = this.readStore();
    store.navigation = {
      ...store.navigation,
      ...data,
      footer: data.footer
        ? { ...store.navigation.footer, ...data.footer }
        : store.navigation.footer,
    };
    this.writeStore(store);
    return store.navigation;
  }

  async getSEOConfig(): Promise<SiteSEOConfig> {
    return this.readStore().seo;
  }

  async updateSEOConfig(data: Partial<SiteSEOConfig>): Promise<SiteSEOConfig> {
    const store = this.readStore();
    store.seo = {
      ...store.seo,
      ...data,
      defaultSeo: data.defaultSeo
        ? { ...store.seo.defaultSeo, ...data.defaultSeo }
        : store.seo.defaultSeo,
      pages: data.pages ? { ...store.seo.pages, ...data.pages } : store.seo.pages,
    };
    this.writeStore(store);
    return store.seo;
  }

  async getSettings(): Promise<GeneralSettings> {
    return this.readStore().settings;
  }

  async updateSettings(data: Partial<GeneralSettings>): Promise<GeneralSettings> {
    const store = this.readStore();
    store.settings = { ...store.settings, ...data };
    this.writeStore(store);
    return store.settings;
  }

  async listContactSubmissions(): Promise<ContactSubmission[]> {
    return this.readStore().contactSubmissions;
  }

  async addContactSubmission(
    submission: Omit<ContactSubmission, 'id' | 'submittedAt' | 'status'>
  ): Promise<ContactSubmission> {
    const store = this.readStore();
    const entry: ContactSubmission = {
      ...submission,
      id: `msg-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'new',
    };
    store.contactSubmissions = [entry, ...store.contactSubmissions];
    this.writeStore(store);
    return entry;
  }

  async updateContactSubmissionStatus(
    id: string,
    status: ContactSubmission['status']
  ): Promise<void> {
    const store = this.readStore();
    store.contactSubmissions = store.contactSubmissions.map((m) =>
      m.id === id ? { ...m, status } : m
    );
    this.writeStore(store);
  }

  async deleteContactSubmission(id: string): Promise<void> {
    const store = this.readStore();
    store.contactSubmissions = store.contactSubmissions.filter((m) => m.id !== id);
    this.writeStore(store);
  }

  async mergeExternalSubmissions(
    entries: ContactSubmission[]
  ): Promise<ContactSubmission[]> {
    const store = this.readStore();
    const existingKeys = new Set(
      store.contactSubmissions
        .map((m) => m.externalId || m.id)
        .filter(Boolean)
    );
    const fresh = entries.filter(
      (entry) => !existingKeys.has(entry.externalId || entry.id)
    );
    if (fresh.length > 0) {
      store.contactSubmissions = [...fresh, ...store.contactSubmissions].sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
      this.writeStore(store);
    }
    return store.contactSubmissions;
  }
}

export const contentRepository: ContentRepository = new LocalStorageRepository();
