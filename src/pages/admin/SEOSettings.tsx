import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save } from 'lucide-react';
import { AdminOutletContext } from '../../app/layouts/AdminLayout';
import { SEOForm } from '../../components/admin/SEOForm';
import { Button } from '../../components/ui/Button';
import { FormInput } from '../../components/ui/FormInput';
import { Tabs } from '../../components/ui/Tabs';
import { Toast } from '../../components/ui/Toast';
import { useContent } from '../../hooks/useContent';
import { PageSlug, SiteSEOConfig } from '../../types/content';

type SEOTab = 'default' | PageSlug;

const SEO_TABS: Array<{ id: SEOTab; label: string }> = [
  { id: 'default', label: 'Global Defaults' },
  { id: 'home', label: 'Home' },
  { id: 'games', label: 'Games' },
  { id: 'brain-challenge', label: 'Brain Challenge' },
  { id: 'color-world', label: 'Color World' },
  { id: 'about', label: 'About Us' },
  { id: 'contact', label: 'Contact' },
];

export const SEOSettings: React.FC = () => {
  const { setHeaderMeta } = useOutletContext<AdminOutletContext>();
  const { store, updateSEOConfig } = useContent();

  const [activeTab, setActiveTab] = useState<SEOTab>('default');
  const [seoDraft, setSeoDraft] = useState<SiteSEOConfig | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    setHeaderMeta({
      title: 'SEO Settings',
      subtitle: 'Configure page titles, meta descriptions, canonical URLs, and OpenGraph cards',
    });
  }, [setHeaderMeta]);

  useEffect(() => {
    if (!store) return;
    setSeoDraft(structuredClone(store.seo));
  }, [store]);

  if (!store || !seoDraft) return null;

  const handleSave = async () => {
    await updateSEOConfig(seoDraft);
    setToast('SEO settings saved.');
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <Tabs
          tabs={SEO_TABS}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as SEOTab)}
        />
        <Button
          variant="primary"
          size="md"
          leftIcon={<Save size={15} />}
          onClick={handleSave}
        >
          Save SEO Settings
        </Button>
      </div>

      <div className="candy-glass-card rounded-[2rem] p-6 sm:p-8 space-y-6">
        {activeTab === 'default' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Site Name"
                value={seoDraft.siteName}
                onChange={(e) =>
                  setSeoDraft({ ...seoDraft, siteName: e.target.value })
                }
              />
              <FormInput
                label="Title Template"
                value={seoDraft.titleTemplate}
                onChange={(e) =>
                  setSeoDraft({ ...seoDraft, titleTemplate: e.target.value })
                }
              />
            </div>

            <SEOForm
              value={seoDraft.defaultSeo}
              onChange={(defaultSeo) => setSeoDraft({ ...seoDraft, defaultSeo })}
              siteName={seoDraft.siteName}
            />
          </>
        ) : (
          <SEOForm
            value={seoDraft.pages[activeTab]}
            onChange={(nextPageSeo) =>
              setSeoDraft({
                ...seoDraft,
                pages: {
                  ...seoDraft.pages,
                  [activeTab]: nextPageSeo,
                },
              })
            }
            siteName={seoDraft.siteName}
          />
        )}
      </div>

      {toast ? <Toast message={toast} onDismiss={() => setToast('')} /> : null}
    </div>
  );
};
