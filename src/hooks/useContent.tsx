import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { contentRepository } from '../data/LocalStorageRepository';
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

interface ContentContextValue {
  store: CandyGameDataStore | null;
  loading: boolean;
  refresh: () => Promise<void>;
  resetToDefaults: () => Promise<void>;
  updatePage: (slug: PageSlug, data: Partial<PageContent>) => Promise<void>;
  createGame: (data: Game) => Promise<void>;
  updateGame: (id: string, data: Partial<Game>) => Promise<void>;
  deleteGame: (id: string) => Promise<void>;
  createCategory: (data: Category) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateStudioInfo: (data: Partial<StudioInfo>) => Promise<void>;
  updateContactInfo: (data: Partial<ContactInfo>) => Promise<void>;
  updateNavigation: (data: Partial<NavigationConfig>) => Promise<void>;
  updateSEOConfig: (data: Partial<SiteSEOConfig>) => Promise<void>;
  updateSettings: (data: Partial<GeneralSettings>) => Promise<void>;
  addContactSubmission: (
    submission: Omit<ContactSubmission, 'id' | 'submittedAt' | 'status'>
  ) => Promise<void>;
  updateContactSubmissionStatus: (
    id: string,
    status: ContactSubmission['status']
  ) => Promise<void>;
  deleteContactSubmission: (id: string) => Promise<void>;
  mergeExternalSubmissions: (
    entries: ContactSubmission[]
  ) => Promise<ContactSubmission[]>;
}

const ContentContext = createContext<ContentContextValue | null>(null);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [store, setStore] = useState<CandyGameDataStore | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await contentRepository.getAll();
    setStore(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const resetToDefaults = useCallback(async () => {
    const defaults = await contentRepository.resetToDefaults();
    setStore(defaults);
  }, []);

  const updatePage = useCallback(
    async (slug: PageSlug, data: Partial<PageContent>) => {
      await contentRepository.updatePage(slug, data);
      await refresh();
    },
    [refresh]
  );

  const createGame = useCallback(
    async (data: Game) => {
      await contentRepository.createGame(data);
      await refresh();
    },
    [refresh]
  );

  const updateGame = useCallback(
    async (id: string, data: Partial<Game>) => {
      await contentRepository.updateGame(id, data);
      await refresh();
    },
    [refresh]
  );

  const deleteGame = useCallback(
    async (id: string) => {
      await contentRepository.deleteGame(id);
      await refresh();
    },
    [refresh]
  );

  const createCategory = useCallback(
    async (data: Category) => {
      await contentRepository.createCategory(data);
      await refresh();
    },
    [refresh]
  );

  const updateCategory = useCallback(
    async (id: string, data: Partial<Category>) => {
      await contentRepository.updateCategory(id, data);
      await refresh();
    },
    [refresh]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      await contentRepository.deleteCategory(id);
      await refresh();
    },
    [refresh]
  );

  const updateStudioInfo = useCallback(
    async (data: Partial<StudioInfo>) => {
      await contentRepository.updateStudioInfo(data);
      await refresh();
    },
    [refresh]
  );

  const updateContactInfo = useCallback(
    async (data: Partial<ContactInfo>) => {
      await contentRepository.updateContactInfo(data);
      await refresh();
    },
    [refresh]
  );

  const updateNavigation = useCallback(
    async (data: Partial<NavigationConfig>) => {
      await contentRepository.updateNavigation(data);
      await refresh();
    },
    [refresh]
  );

  const updateSEOConfig = useCallback(
    async (data: Partial<SiteSEOConfig>) => {
      await contentRepository.updateSEOConfig(data);
      await refresh();
    },
    [refresh]
  );

  const updateSettings = useCallback(
    async (data: Partial<GeneralSettings>) => {
      await contentRepository.updateSettings(data);
      await refresh();
    },
    [refresh]
  );

  const addContactSubmission = useCallback(
    async (
      submission: Omit<ContactSubmission, 'id' | 'submittedAt' | 'status'>
    ) => {
      await contentRepository.addContactSubmission(submission);
      await refresh();
    },
    [refresh]
  );

  const updateContactSubmissionStatus = useCallback(
    async (id: string, status: ContactSubmission['status']) => {
      await contentRepository.updateContactSubmissionStatus(id, status);
      await refresh();
    },
    [refresh]
  );

  const deleteContactSubmission = useCallback(
    async (id: string) => {
      await contentRepository.deleteContactSubmission(id);
      await refresh();
    },
    [refresh]
  );

  const mergeExternalSubmissions = useCallback(
    async (entries: ContactSubmission[]) => {
      const updated = await contentRepository.mergeExternalSubmissions(entries);
      await refresh();
      return updated;
    },
    [refresh]
  );

  return (
    <ContentContext.Provider
      value={{
        store,
        loading,
        refresh,
        resetToDefaults,
        updatePage,
        createGame,
        updateGame,
        deleteGame,
        createCategory,
        updateCategory,
        deleteCategory,
        updateStudioInfo,
        updateContactInfo,
        updateNavigation,
        updateSEOConfig,
        updateSettings,
        addContactSubmission,
        updateContactSubmissionStatus,
        deleteContactSubmission,
        mergeExternalSubmissions,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export function useContent(): ContentContextValue {
  const ctx = useContext(ContentContext);
  if (!ctx) {
    throw new Error('useContent must be used inside ContentProvider');
  }
  return ctx;
}
