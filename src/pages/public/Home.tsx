import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { GameGrid } from '../../components/shared/GameGrid';
import { SEOHead } from '../../components/shared/SEOHead';
import { Button } from '../../components/ui/Button';
import { useContent } from '../../hooks/useContent';

export const Home: React.FC = () => {
  const { store } = useContent();
  if (!store) return null;

  const page = store.pages.home;
  const publishedGames = store.games
    .filter((g) => g.status === 'published')
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const featuredGames = publishedGames.filter((g) => g.featured);
  const displayGames = featuredGames.length > 0 ? featuredGames : publishedGames;

  const featuredSection = page.sections.featuredGames;
  const pillarsSection = page.sections.craftPillars;
  const ctaSection = page.sections.studioCta;

  return (
    <>
      <SEOHead seo={store.seo.pages.home || page.seo} />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 pt-14 pb-16 lg:pt-20 lg:pb-24">
        <div className="max-w-4xl space-y-6">
          {page.hero.subheading ? (
            <p className="text-sm font-semibold text-[#BDA7FF] tracking-wide">
              {page.hero.subheading}
            </p>
          ) : null}

          <h1 className="font-display text-4xl sm:text-5xl lg:text-[64px] font-bold text-white leading-[1.1] tracking-[-0.03em] text-balance">
            {page.hero.heading}
          </h1>

          <p className="text-base sm:text-lg text-[#cbc3d6] leading-relaxed max-w-2xl">
            {page.hero.body}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {page.hero.primaryCtaLabel ? (
              <Link to={page.hero.primaryCtaPath || '/games'}>
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight size={17} />}
                >
                  {page.hero.primaryCtaLabel}
                </Button>
              </Link>
            ) : null}

            {page.hero.secondaryCtaLabel ? (
              <Link to={page.hero.secondaryCtaPath || '/about'}>
                <Button variant="secondary" size="lg">
                  {page.hero.secondaryCtaLabel}
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {/* Featured Games Section */}
      {featuredSection ? (
        <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-14 lg:py-20 border-t border-white/5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-2 max-w-2xl">
              {featuredSection.subheading ? (
                <p className="text-xs font-semibold text-[#BDA7FF]">
                  {featuredSection.subheading}
                </p>
              ) : null}
              <h2 className="font-display text-3xl sm:text-[40px] font-bold text-white leading-tight tracking-tight">
                {featuredSection.heading}
              </h2>
              <p className="text-sm sm:text-base text-[#cbc3d6]">
                {featuredSection.body}
              </p>
            </div>

            {featuredSection.primaryCtaLabel ? (
              <Link to={featuredSection.primaryCtaPath || '/games'}>
                <Button
                  variant="secondary"
                  size="md"
                  rightIcon={<ArrowRight size={15} />}
                >
                  {featuredSection.primaryCtaLabel}
                </Button>
              </Link>
            ) : null}
          </div>

          <GameGrid games={displayGames} categories={store.categories} />
        </section>
      ) : null}

      {/* Studio Craft Pillars */}
      {pillarsSection ? (
        <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-14 lg:py-20 border-t border-white/5">
          <div className="space-y-2 max-w-2xl mb-10">
            {pillarsSection.subheading ? (
              <p className="text-xs font-semibold text-[#BDA7FF]">
                {pillarsSection.subheading}
              </p>
            ) : null}
            <h2 className="font-display text-3xl sm:text-[40px] font-bold text-white leading-tight tracking-tight">
              {pillarsSection.heading}
            </h2>
            <p className="text-sm sm:text-base text-[#cbc3d6]">
              {pillarsSection.body}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(pillarsSection.items || []).map((item) => (
              <div
                key={item.id}
                className="candy-glass-card rounded-[2rem] overflow-hidden flex flex-col"
              >
                {item.image ? (
                  <div className="aspect-video w-full overflow-hidden bg-[#151123] border-b border-[#BDA7FF]/10">
                    <img
                      src={item.image}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                    />
                  </div>
                ) : null}
                <div className="p-7 space-y-3 flex-1">
                  <h3 className="font-display text-xl font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#cbc3d6] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Bottom CTA */}
      {ctaSection ? (
        <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 pb-20 pt-6">
          <div className="candy-glass-card rounded-[2.5rem] p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2 max-w-2xl">
              {ctaSection.subheading ? (
                <p className="text-xs font-semibold text-[#BDA7FF]">
                  {ctaSection.subheading}
                </p>
              ) : null}
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                {ctaSection.heading}
              </h2>
              <p className="text-sm sm:text-base text-[#cbc3d6]">
                {ctaSection.body}
              </p>
            </div>
            {ctaSection.primaryCtaLabel ? (
              <Link to={ctaSection.primaryCtaPath || '/contact'} className="shrink-0">
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight size={17} />}
                >
                  {ctaSection.primaryCtaLabel}
                </Button>
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  );
};
