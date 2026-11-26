import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  ArrowRight,
  FolderKanban,
  Gamepad2,
  Link2,
  MessageSquare,
  PlusCircle,
} from 'lucide-react';
import { AdminOutletContext } from '../../app/layouts/AdminLayout';
import { GameIcon } from '../../components/shared/GameIcon';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useContent } from '../../hooks/useContent';
import { ContactSubmission } from '../../types/content';

export const Dashboard: React.FC = () => {
  const { adminToken, authenticated, setHeaderMeta } =
    useOutletContext<AdminOutletContext>();
  const { store } = useContent();
  const [serverMessages, setServerMessages] = useState<ContactSubmission[]>([]);

  useEffect(() => {
    setHeaderMeta({
      title: 'Admin Dashboard',
      subtitle: 'Overview of CandyGame catalog, categories, and store links',
      action: (
        <Link to="/admin/games/new">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle size={15} />}>
            Add Game
          </Button>
        </Link>
      ),
    });
  }, [setHeaderMeta]);

  useEffect(() => {
    if (!authenticated) return;
    let active = true;
    const headers: Record<string, string> = {};
    if (adminToken) {
      headers.Authorization = `Bearer ${adminToken}`;
    }
    fetch('/api/inbox', {
      credentials: 'same-origin',
      headers,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { messages?: ContactSubmission[] } | null) => {
        if (active && data && Array.isArray(data.messages)) {
          setServerMessages(data.messages);
        }
      })
      .catch(() => {
        // Ignore transient network errors
      });
    return () => {
      active = false;
    };
  }, [adminToken, authenticated]);

  if (!store) return null;

  const totalGames = store.games.length;
  const publishedGames = store.games.filter((g) => g.status === 'published').length;
  const activeCategories = store.categories.filter((c) => c.status === 'active').length;
  const configuredLinks = store.games.filter((g) => Boolean(g.googlePlayUrl)).length;
  const newMessages = serverMessages.filter((m) => m.status === 'new').length;

  const summaryCards = [
    {
      label: 'Total Games',
      value: totalGames,
      meta: `${publishedGames} published`,
      icon: Gamepad2,
      to: '/admin/games',
    },
    {
      label: 'Categories',
      value: store.categories.length,
      meta: `${activeCategories} active`,
      icon: FolderKanban,
      to: '/admin/categories',
    },
    {
      label: 'Google Play Links',
      value: `${configuredLinks}/${totalGames}`,
      meta: 'Configured store URLs',
      icon: Link2,
      to: '/admin/downloads',
    },
    {
      label: 'Inbox Messages',
      value: serverMessages.length,
      meta: `${newMessages} unread`,
      icon: MessageSquare,
      to: '/admin/studio-contact?tab=inbox',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.to}
              className="candy-glass-card rounded-[2rem] p-6 space-y-4 transition-all hover:-translate-y-0.5 hover:border-[#BDA7FF]/35"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#cbc3d6]">
                  {card.label}
                </span>
                <div className="p-2.5 rounded-2xl bg-[#7652D6]/20 text-[#cebdff]">
                  <Icon size={18} />
                </div>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-white tabular-nums">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-[#948e9f]">{card.meta}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 candy-glass-card rounded-[2rem] p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-xl font-bold text-white">
              Games Catalog
            </h2>
            <Link
              to="/admin/games"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#cebdff] hover:text-white"
            >
              <span>Manage All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-white/10">
            {store.games.map((game) => {
              const category = store.categories.find((c) => c.id === game.categoryId);
              return (
                <div
                  key={game.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <GameIcon game={game} size="sm" />
                    <div className="min-w-0">
                      <p className="font-display text-base font-semibold text-white truncate">
                        {game.name}
                      </p>
                      <p className="text-xs text-[#cbc3d6] truncate">
                        {category?.name ? `${category.name} · ` : ''}
                        {game.platform.join(', ')} · {game.storeName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <StatusBadge status={game.status} />
                    <Link to={`/admin/games/${game.id}/edit`}>
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 candy-glass-card rounded-[2rem] p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-xl font-bold text-white">
              Categories & Quick Links
            </h2>
            <Link
              to="/admin/categories"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#cebdff] hover:text-white"
            >
              <span>Manage</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {store.categories.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#151123] border border-[#BDA7FF]/12 text-xs text-[#948e9f]">
                No categories configured. Games are displayed directly without category tags.
              </div>
            ) : (
              store.categories.map((cat) => {
                const count = store.games.filter((g) => g.categoryId === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#151123] border border-[#BDA7FF]/12"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {cat.name}
                      </p>
                      <p className="text-xs text-[#948e9f] tabular-nums">
                        {count} {count === 1 ? 'game' : 'games'}
                      </p>
                    </div>
                    <StatusBadge status={cat.status} />
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to="/admin/content">
              <Button variant="secondary" size="sm" className="w-full">
                Edit Website Copy
              </Button>
            </Link>
            <Link to="/admin/seo">
              <Button variant="secondary" size="sm" className="w-full">
                SEO Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
