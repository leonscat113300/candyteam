import React, { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Edit3, ExternalLink, PlusCircle, Trash2 } from 'lucide-react';
import { AdminOutletContext } from '../../app/layouts/AdminLayout';
import { GameIcon } from '../../components/shared/GameIcon';
import { Button } from '../../components/ui/Button';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { FilterDropdown } from '../../components/ui/FilterDropdown';
import { Pagination } from '../../components/ui/Pagination';
import { SearchInput } from '../../components/ui/SearchInput';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Toast } from '../../components/ui/Toast';
import { useContent } from '../../hooks/useContent';
import { Game } from '../../types/content';

export const GamesManagement: React.FC = () => {
  const { setHeaderMeta } = useOutletContext<AdminOutletContext>();
  const { store, updateGame, deleteGame } = useContent();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'order' | 'name-asc' | 'name-desc'>('order');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Game | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    setHeaderMeta({
      title: 'Games Management',
      subtitle: 'Search, filter, sort, publish, and edit CandyGame titles',
      action: (
        <Link to="/admin/games/new">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle size={15} />}>
            Add Game
          </Button>
        </Link>
      ),
    });
  }, [setHeaderMeta]);

  const pageSize = store?.settings.gamesPerPage || 8;

  const filtered = useMemo(() => {
    const list = [...(store?.games || [])].filter((g) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        g.name.toLowerCase().includes(q) ||
        g.slug.toLowerCase().includes(q) ||
        g.shortDescription.toLowerCase().includes(q);
      const matchesCategory =
        categoryFilter === 'all' || g.categoryId === categoryFilter;
      const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });

    if (sortBy === 'name-asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      list.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      list.sort((a, b) => a.displayOrder - b.displayOrder);
    }

    return list;
  }, [store?.games, search, categoryFilter, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  if (!store) return null;

  return (
    <div className="space-y-6">
      <div className="candy-glass-card rounded-[2rem] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="w-full lg:w-72">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search games..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {store.categories.length > 0 ? (
            <FilterDropdown
              label="Category"
              value={categoryFilter}
              onChange={(v) => {
                setCategoryFilter(v);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All Categories' },
                ...store.categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          ) : null}
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'published', label: 'Published' },
              { value: 'draft', label: 'Draft' },
            ]}
          />
          <FilterDropdown
            label="Sort"
            value={sortBy}
            onChange={(v) => setSortBy(v as typeof sortBy)}
            options={[
              { value: 'order', label: 'Display Order' },
              { value: 'name-asc', label: 'Name (A–Z)' },
              { value: 'name-desc', label: 'Name (Z–A)' },
            ]}
          />
        </div>
      </div>

      <div className="candy-glass-card rounded-[2rem] p-5 sm:p-6 overflow-hidden">
        {paginated.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="font-display text-lg font-semibold text-white">
              No Games Match Your Filters
            </p>
            <p className="text-sm text-[#cbc3d6]">
              Adjust your search or create a new game entry.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold text-[#948e9f]">
                  <th className="py-3 pr-4">Game</th>
                  {store.categories.length > 0 ? (
                    <th className="py-3 px-4">Category</th>
                  ) : null}
                  <th className="py-3 px-4">Platform / Store</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-sm">
                {paginated.map((game) => {
                  const category = store.categories.find(
                    (c) => c.id === game.categoryId
                  );
                  return (
                    <tr
                      key={game.id}
                      className="hover:bg-[#272143]/40 transition-colors"
                    >
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <GameIcon game={game} size="sm" />
                          <div>
                            <p className="font-display font-semibold text-white">
                              {game.name}
                            </p>
                            <p className="text-xs text-[#948e9f]">
                              /games/{game.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      {store.categories.length > 0 ? (
                        <td className="py-4 px-4 text-[#cbc3d6] whitespace-nowrap">
                          {category?.name || '—'}
                        </td>
                      ) : null}
                      <td className="py-4 px-4 text-[#cbc3d6] whitespace-nowrap">
                        {game.platform.join(', ')} · {game.storeName}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={async () => {
                            const nextStatus =
                              game.status === 'published' ? 'draft' : 'published';
                            await updateGame(game.id, { status: nextStatus });
                            setToast(`${game.name} marked as ${nextStatus}.`);
                          }}
                          title="Click to toggle Published/Draft"
                          className="cursor-pointer"
                        >
                          <StatusBadge status={game.status} />
                        </button>
                      </td>
                      <td className="py-4 pl-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/games/${game.slug}`}
                            aria-label={`View ${game.name}`}
                            className="p-2 rounded-full bg-[#151123] border border-[#BDA7FF]/20 text-[#cbc3d6] hover:text-white"
                          >
                            <ExternalLink size={14} />
                          </Link>
                          <Link
                            to={`/admin/games/${game.id}/edit`}
                            aria-label={`Edit ${game.name}`}
                            className="p-2 rounded-full bg-[#151123] border border-[#BDA7FF]/20 text-[#cebdff] hover:text-white"
                          >
                            <Edit3 size={14} />
                          </Link>
                          <button
                            type="button"
                            aria-label={`Delete ${game.name}`}
                            onClick={() => setDeleteTarget(game)}
                            className="p-2 rounded-full bg-[#151123] border border-[#ffb4ab]/20 text-[#ffb4ab] hover:bg-[#93000a]/50 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>

      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteGame(deleteTarget.id);
          setToast(`Deleted "${deleteTarget.name}".`);
        }}
        title="Delete Game"
        message={`Are you sure you want to remove "${deleteTarget?.name}" from the catalog? This action cannot be undone.`}
        confirmLabel="Delete Game"
      />

      {toast ? <Toast message={toast} onDismiss={() => setToast('')} /> : null}
    </div>
  );
};
