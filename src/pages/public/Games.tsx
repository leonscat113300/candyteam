import React, { useMemo, useState } from 'react';
import { GameGrid } from '../../components/shared/GameGrid';
import { SEOHead } from '../../components/shared/SEOHead';
import { SearchInput } from '../../components/ui/SearchInput';
import { useContent } from '../../hooks/useContent';

export const Games: React.FC = () => {
  const { store } = useContent();
  const [search, setSearch] = useState('');

  const page = store?.pages.games;

  const filteredGames = useMemo(() => {
    const games = (store?.games || [])
      .filter((g) => g.status === 'published')
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const q = search.trim().toLowerCase();
    return games.filter((game) => {
      return (
        !q ||
        game.name.toLowerCase().includes(q) ||
        game.shortDescription.toLowerCase().includes(q) ||
        game.platform.some((p) => p.toLowerCase().includes(q))
      );
    });
  }, [store?.games, search]);

  if (!store || !page) return null;

  return (
    <>
      <SEOHead seo={store.seo.pages.games || page.seo} />

      <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 pt-14 pb-20 space-y-10">
        <div className="space-y-4 max-w-3xl">
          {page.hero.subheading ? (
            <p className="text-xs font-semibold text-[#BDA7FF]">
              {page.hero.subheading}
            </p>
          ) : null}
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
            {page.hero.heading}
          </h1>
          <p className="text-base sm:text-lg text-[#cbc3d6] leading-relaxed">
            {page.hero.body}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-[#1d192c] border border-[#BDA7FF]/12">
          <p className="text-sm font-medium text-[#cbc3d6] px-2 tabular-nums">
            Showing {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'}
          </p>

          <div className="w-full sm:w-80">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search games..."
            />
          </div>
        </div>

        <GameGrid
          games={filteredGames}
          categories={store.categories}
          emptyMessage="No published games match your search."
        />
      </section>
    </>
  );
};
