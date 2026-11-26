import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ExternalLink, Save } from 'lucide-react';
import { AdminOutletContext } from '../../app/layouts/AdminLayout';
import { GameIcon } from '../../components/shared/GameIcon';
import { GooglePlayIcon } from '../../components/shared/GooglePlayIcon';
import { Button } from '../../components/ui/Button';
import { FormInput } from '../../components/ui/FormInput';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Toast } from '../../components/ui/Toast';
import { useContent } from '../../hooks/useContent';

interface DraftLinkState {
  googlePlayUrl: string;
  packageId: string;
  storeName: string;
  version: string;
}

export const DownloadsManagement: React.FC = () => {
  const { setHeaderMeta } = useOutletContext<AdminOutletContext>();
  const { store, updateGame } = useContent();
  const [drafts, setDrafts] = useState<Record<string, DraftLinkState>>({});
  const [toast, setToast] = useState('');

  useEffect(() => {
    setHeaderMeta({
      title: 'Downloads & Links Management',
      subtitle: 'Configure Google Play URLs, Android package IDs, and versions',
    });
  }, [setHeaderMeta]);

  useEffect(() => {
    if (!store) return;
    const map: Record<string, DraftLinkState> = {};
    for (const game of store.games) {
      map[game.id] = {
        googlePlayUrl: game.googlePlayUrl || '',
        packageId: game.packageId || '',
        storeName: game.storeName || 'Google Play',
        version: game.version || '',
      };
    }
    setDrafts(map);
  }, [store]);

  if (!store) return null;

  const isValidUrlFormat = (url: string) => {
    if (!url.trim()) return false;
    try {
      const parsed = new URL(url.trim());
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  };

  const handleSaveGameLink = async (gameId: string, gameName: string) => {
    const entry = drafts[gameId];
    if (!entry) return;
    await updateGame(gameId, {
      googlePlayUrl: entry.googlePlayUrl.trim(),
      packageId: entry.packageId.trim(),
      storeName: entry.storeName.trim() || 'Google Play',
      version: entry.version.trim(),
    });
    setToast(`Updated store links for ${gameName}.`);
  };

  return (
    <div className="space-y-6">
      {store.games.map((game) => {
        const draft = drafts[game.id] || {
          googlePlayUrl: '',
          packageId: '',
          storeName: 'Google Play',
          version: '',
        };
        const hasUrl = Boolean(draft.googlePlayUrl.trim());
        const formatOk = isValidUrlFormat(draft.googlePlayUrl);

        return (
          <div
            key={game.id}
            className="candy-glass-card rounded-[2rem] p-6 sm:p-8 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <GameIcon game={game} size="md" />
                <div>
                  <h2 className="font-display text-xl font-bold text-white">
                    {game.name}
                  </h2>
                  <p className="text-xs text-[#cbc3d6]">
                    {game.platform.join(', ')} · {game.storeName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!hasUrl ? (
                  <StatusBadge status="draft" label="URL Not Set" />
                ) : formatOk ? (
                  <StatusBadge status="active" label="Valid URL Format" />
                ) : (
                  <StatusBadge status="inactive" label="Invalid URL Format" />
                )}

                {formatOk ? (
                  <a
                    href={draft.googlePlayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<GooglePlayIcon size={15} />}
                      rightIcon={<ExternalLink size={14} />}
                    >
                      Open Link
                    </Button>
                  </a>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Google Play Store URL"
                type="url"
                value={draft.googlePlayUrl}
                onChange={(e) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [game.id]: { ...draft, googlePlayUrl: e.target.value },
                  }))
                }
                placeholder="https://play.google.com/store/apps/details?id=..."
              />
              <FormInput
                label="Android Package ID"
                value={draft.packageId}
                onChange={(e) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [game.id]: { ...draft, packageId: e.target.value },
                  }))
                }
                placeholder="com.candygame.title"
              />
              <FormInput
                label="Store Label"
                value={draft.storeName}
                onChange={(e) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [game.id]: { ...draft, storeName: e.target.value },
                  }))
                }
              />
              <FormInput
                label="Release Version"
                value={draft.version}
                onChange={(e) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [game.id]: { ...draft, version: e.target.value },
                  }))
                }
                placeholder="1.0.0"
              />
            </div>

            <div className="flex justify-end">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Save size={15} />}
                onClick={() => handleSaveGameLink(game.id, game.name)}
              >
                Save Store Links
              </Button>
            </div>
          </div>
        );
      })}

      {toast ? <Toast message={toast} onDismiss={() => setToast('')} /> : null}
    </div>
  );
};
