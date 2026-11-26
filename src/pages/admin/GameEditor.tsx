import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { AdminOutletContext } from '../../app/layouts/AdminLayout';
import { SEOForm } from '../../components/admin/SEOForm';
import { GameIcon } from '../../components/shared/GameIcon';
import { Button } from '../../components/ui/Button';
import { FormInput } from '../../components/ui/FormInput';
import { FormSelect } from '../../components/ui/FormSelect';
import { FormTextarea } from '../../components/ui/FormTextarea';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { Toast } from '../../components/ui/Toast';
import { useContent } from '../../hooks/useContent';
import { Game } from '../../types/content';

export const GameEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { setHeaderMeta } = useOutletContext<AdminOutletContext>();
  const { store, createGame, updateGame } = useContent();

  const existingGame = isEditing
    ? store?.games.find((g) => g.id === id)
    : undefined;

  const [form, setForm] = useState<Game>({
    id: `game-${Date.now()}`,
    name: '',
    slug: '',
    shortDescription: '',
    fullDescription: '',
    categoryId: store?.categories[0]?.id || '',
    platform: ['Android'],
    storeName: 'Google Play',
    icon: '',
    featuredImage: '',
    screenshots: [],
    googlePlayUrl: '',
    packageId: '',
    version: '',
    releaseDate: '',
    features: [''],
    status: 'published',
    featured: false,
    displayOrder: (store?.games.length || 0) + 1,
    seo: {
      title: '',
      description: '',
      canonicalUrl: '',
      ogImage: '',
    },
  });

  const [newScreenshotUrl, setNewScreenshotUrl] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    setHeaderMeta({
      title: isEditing
        ? `Edit Game: ${existingGame?.name || 'Game'}`
        : 'Add New Game',
      subtitle: 'Configure game metadata, store links, assets, and SEO',
      action: (
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<ArrowLeft size={14} />}
          onClick={() => navigate('/admin/games')}
        >
          Back to Games
        </Button>
      ),
    });
  }, [setHeaderMeta, isEditing, existingGame?.name, navigate]);

  useEffect(() => {
    if (isEditing && existingGame) {
      setForm(structuredClone(existingGame));
    }
  }, [isEditing, existingGame]);

  if (!store) return null;

  if (isEditing && !existingGame) {
    return (
      <div className="candy-glass-card rounded-[2rem] p-8 text-center space-y-4">
        <p className="font-display text-xl font-bold text-white">Game Not Found</p>
        <Button variant="primary" onClick={() => navigate('/admin/games')}>
          Return to Games Management
        </Button>
      </div>
    );
  }

  const slugify = (val: string) =>
    val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.slug.trim()) {
      setError('Game name and URL slug are required.');
      return;
    }

    const cleanedFeatures = form.features.map((f) => f.trim()).filter(Boolean);
    const payload: Game = {
      ...form,
      name: form.name.trim(),
      slug: slugify(form.slug),
      features: cleanedFeatures,
      seo: {
        ...form.seo,
        title: form.seo.title || `${form.name.trim()} | CandyGame`,
        description: form.seo.description || form.shortDescription,
        canonicalUrl: form.seo.canonicalUrl || `/games/${slugify(form.slug)}`,
      },
    };

    try {
      if (isEditing) {
        await updateGame(form.id, payload);
        setToast('Game updated successfully.');
      } else {
        await createGame(payload);
        setToast('New game created.');
        navigate(`/admin/games/${payload.id}/edit`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save game.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-10">
      <div className="candy-glass-card rounded-[2rem] p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-bold text-white">
            Basic Information
          </h2>
          <GameIcon game={form} size="md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Game Name"
            value={form.name}
            onChange={(e) => {
              const nextName = e.target.value;
              setForm((prev) => ({
                ...prev,
                name: nextName,
                slug: isEditing ? prev.slug : slugify(nextName),
              }));
            }}
            placeholder="e.g. Brain Challenge"
            required
          />
          <FormInput
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="brain-challenge"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormSelect
            label="Category"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            options={[
              { value: '', label: 'None' },
              ...store.categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <FormSelect
            label="Status"
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value as Game['status'],
              })
            }
            options={[
              { value: 'published', label: 'Published' },
              { value: 'draft', label: 'Draft' },
            ]}
          />
          <FormInput
            label="Display Order"
            type="number"
            min={1}
            value={form.displayOrder}
            onChange={(e) =>
              setForm({ ...form, displayOrder: Number(e.target.value) || 1 })
            }
          />
        </div>

        <FormTextarea
          label="Short Description"
          rows={2}
          value={form.shortDescription}
          onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
          placeholder="Concise summary displayed on game cards"
        />

        <FormTextarea
          label="Full Description"
          rows={5}
          value={form.fullDescription}
          onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
          placeholder="Detailed overview shown on the game detail page"
        />

        <label className="inline-flex items-center gap-3 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            className="w-4 h-4 accent-[#7652D6] rounded"
          />
          <span className="text-sm font-medium text-[#e7defa]">
            Feature this game on the Home screen
          </span>
        </label>
      </div>

      {/* Platform & Store */}
      <div className="candy-glass-card rounded-[2rem] p-6 sm:p-8 space-y-5">
        <h2 className="font-display text-xl font-bold text-white">
          Platform & Store Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Platforms (comma-separated)"
            value={form.platform.join(', ')}
            onChange={(e) =>
              setForm({
                ...form,
                platform: e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Android"
          />
          <FormInput
            label="Store Name"
            value={form.storeName}
            onChange={(e) => setForm({ ...form, storeName: e.target.value })}
            placeholder="Google Play"
          />
          <FormInput
            label="Google Play URL"
            type="url"
            value={form.googlePlayUrl || ''}
            onChange={(e) => setForm({ ...form, googlePlayUrl: e.target.value })}
            placeholder="https://play.google.com/store/apps/details?id=..."
          />
          <FormInput
            label="Android Package ID"
            value={form.packageId || ''}
            onChange={(e) => setForm({ ...form, packageId: e.target.value })}
            placeholder="com.candygame.brainchallenge"
          />
          <FormInput
            label="Version"
            value={form.version || ''}
            onChange={(e) => setForm({ ...form, version: e.target.value })}
            placeholder="1.0.0"
          />
          <FormInput
            label="Release Date"
            type="date"
            value={form.releaseDate || ''}
            onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
          />
        </div>
      </div>

      {/* Assets & Screenshots */}
      <div className="candy-glass-card rounded-[2rem] p-6 sm:p-8 space-y-6">
        <h2 className="font-display text-xl font-bold text-white">
          Icons & Screenshots
        </h2>

        <ImageUploader
          label="Game Icon"
          value={form.icon}
          onChange={(icon) => setForm({ ...form, icon })}
          helperText="Upload the official game icon PNG or provide an asset path."
          fallbackPreview={<GameIcon game={form} size="md" />}
        />

        <div className="space-y-3">
          <label className="block text-sm font-medium text-[#e7defa]">
            Gameplay Screenshots
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <FormInput
              value={newScreenshotUrl}
              onChange={(e) => setNewScreenshotUrl(e.target.value)}
              placeholder="Paste screenshot path or URL"
            />
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Plus size={15} />}
              onClick={() => {
                if (!newScreenshotUrl.trim()) return;
                setForm({
                  ...form,
                  screenshots: [...form.screenshots, newScreenshotUrl.trim()],
                });
                setNewScreenshotUrl('');
              }}
            >
              Add Screenshot
            </Button>
          </div>

          {form.screenshots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {form.screenshots.map((shot, idx) => (
                <div
                  key={idx}
                  className="relative rounded-2xl overflow-hidden bg-[#151123] border border-[#BDA7FF]/20 aspect-video"
                >
                  <img
                    src={shot}
                    alt={`Screenshot ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    aria-label="Remove screenshot"
                    onClick={() =>
                      setForm({
                        ...form,
                        screenshots: form.screenshots.filter((_, i) => i !== idx),
                      })
                    }
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-[#151123]/80 text-[#ffb4ab] hover:text-white cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#948e9f]">
              No screenshots added yet.
            </p>
          )}
        </div>
      </div>

      {/* Key Features */}
      <div className="candy-glass-card rounded-[2rem] p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-white">
            Key Features
          </h2>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setForm({ ...form, features: [...form.features, ''] })}
          >
            Add Feature
          </Button>
        </div>

        <FormTextarea
          label="Features Intro Text"
          rows={2}
          value={form.featuresIntro || ''}
          onChange={(e) => setForm({ ...form, featuresIntro: e.target.value })}
          placeholder="Optional introductory text before the Key Features list"
        />

        <div className="space-y-3">
          {form.features.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <FormInput
                value={feat}
                onChange={(e) => {
                  const next = [...form.features];
                  next[idx] = e.target.value;
                  setForm({ ...form, features: next });
                }}
                placeholder={`Feature ${idx + 1}`}
              />
              <button
                type="button"
                aria-label="Remove feature"
                onClick={() =>
                  setForm({
                    ...form,
                    features: form.features.filter((_, i) => i !== idx),
                  })
                }
                className="p-2.5 rounded-2xl bg-[#151123] border border-white/10 text-[#ffb4ab] hover:bg-[#93000a]/40 cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        <FormTextarea
          label="Features Closing Text"
          rows={3}
          value={form.featuresOutro || ''}
          onChange={(e) => setForm({ ...form, featuresOutro: e.target.value })}
          placeholder="Optional closing text after the Key Features list"
        />
      </div>

      {/* Game SEO */}
      <div className="candy-glass-card rounded-[2rem] p-6 sm:p-8 space-y-5">
        <h2 className="font-display text-xl font-bold text-white">
          Game SEO Metadata
        </h2>
        <SEOForm
          value={form.seo}
          onChange={(seo) => setForm({ ...form, seo })}
          siteName={store.studio.studioName}
        />
      </div>

      {error ? <p className="text-sm text-[#ffb4ab]">{error}</p> : null}

      <div className="flex items-center justify-end gap-3">
        <Button
          variant="secondary"
          size="lg"
          onClick={() => navigate('/admin/games')}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="lg" leftIcon={<Save size={16} />}>
          {isEditing ? 'Save Changes' : 'Create Game'}
        </Button>
      </div>

      {toast ? <Toast message={toast} onDismiss={() => setToast('')} /> : null}
    </form>
  );
};
