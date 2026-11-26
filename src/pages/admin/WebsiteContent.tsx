import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save } from 'lucide-react';
import { AdminOutletContext } from '../../app/layouts/AdminLayout';
import { ContentEditor } from '../../components/admin/ContentEditor';
import { Button } from '../../components/ui/Button';
import { FormInput } from '../../components/ui/FormInput';
import { FormTextarea } from '../../components/ui/FormTextarea';
import { Tabs } from '../../components/ui/Tabs';
import { Toast } from '../../components/ui/Toast';
import { useContent } from '../../hooks/useContent';
import { NavigationConfig, PageContent, PageSlug } from '../../types/content';

type ContentTab = PageSlug | 'footer';

const TABS: Array<{ id: ContentTab; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'games', label: 'Games' },
  { id: 'brain-challenge', label: 'Brain Challenge' },
  { id: 'color-world', label: 'Color World' },
  { id: 'about', label: 'About Us' },
  { id: 'contact', label: 'Contact' },
  { id: 'footer', label: 'Footer & Nav' },
];

export const WebsiteContent: React.FC = () => {
  const { setHeaderMeta } = useOutletContext<AdminOutletContext>();
  const { store, updatePage, updateNavigation } = useContent();

  const [activeTab, setActiveTab] = useState<ContentTab>('home');
  const [pageDraft, setPageDraft] = useState<PageContent | null>(null);
  const [navDraft, setNavDraft] = useState<NavigationConfig | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    setHeaderMeta({
      title: 'Website Content Management',
      subtitle: 'Edit headings, copy, call-to-actions, and footer text across all pages',
    });
  }, [setHeaderMeta]);

  useEffect(() => {
    if (!store) return;
    if (activeTab === 'footer') {
      setNavDraft(structuredClone(store.navigation));
    } else {
      setPageDraft(structuredClone(store.pages[activeTab]));
    }
  }, [store, activeTab]);

  if (!store) return null;

  const handleSave = async () => {
    if (activeTab === 'footer' && navDraft) {
      await updateNavigation(navDraft);
      setToast('Footer and navigation content saved.');
      return;
    }
    if (activeTab !== 'footer' && pageDraft) {
      await updatePage(activeTab, pageDraft);
      setToast(`${pageDraft.title} page content saved.`);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <Tabs
          tabs={TABS}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as ContentTab)}
        />
        <Button
          variant="primary"
          size="md"
          leftIcon={<Save size={15} />}
          onClick={handleSave}
        >
          Save Section
        </Button>
      </div>

      {activeTab === 'footer' && navDraft ? (
        <div className="space-y-6">
          <div className="candy-glass-card rounded-[2rem] p-6 sm:p-8 space-y-4">
            <h2 className="font-display text-xl font-bold text-white">
              Header CTA & Navigation Labels
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Header CTA Button Label"
                value={navDraft.ctaLabel}
                onChange={(e) =>
                  setNavDraft({ ...navDraft, ctaLabel: e.target.value })
                }
              />
              <FormInput
                label="Header CTA Path"
                value={navDraft.ctaPath}
                onChange={(e) =>
                  setNavDraft({ ...navDraft, ctaPath: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {navDraft.headerItems.map((item, idx) => (
                <FormInput
                  key={item.id}
                  label={`Nav Link ${idx + 1}`}
                  value={item.label}
                  onChange={(e) => {
                    const next = [...navDraft.headerItems];
                    next[idx] = { ...item, label: e.target.value };
                    setNavDraft({ ...navDraft, headerItems: next });
                  }}
                />
              ))}
            </div>
          </div>

          <div className="candy-glass-card rounded-[2rem] p-6 sm:p-8 space-y-4">
            <h2 className="font-display text-xl font-bold text-white">
              Footer Content
            </h2>
            <FormTextarea
              label="Footer Tagline"
              rows={2}
              value={navDraft.footer.tagline}
              onChange={(e) =>
                setNavDraft({
                  ...navDraft,
                  footer: { ...navDraft.footer, tagline: e.target.value },
                })
              }
            />
            <FormInput
              label="Copyright Notice"
              value={navDraft.footer.copyrightText}
              onChange={(e) =>
                setNavDraft({
                  ...navDraft,
                  footer: { ...navDraft.footer, copyrightText: e.target.value },
                })
              }
            />
          </div>
        </div>
      ) : pageDraft ? (
        <ContentEditor page={pageDraft} onChange={setPageDraft} />
      ) : null}

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          leftIcon={<Save size={16} />}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </div>

      {toast ? <Toast message={toast} onDismiss={() => setToast('')} /> : null}
    </div>
  );
};
