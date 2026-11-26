import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Image as ImageIcon,
  Smartphone,
  Store,
} from 'lucide-react';
import { GameIcon } from '../../components/shared/GameIcon';
import { GooglePlayIcon } from '../../components/shared/GooglePlayIcon';
import { SEOHead } from '../../components/shared/SEOHead';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useContent } from '../../hooks/useContent';
import { PageSlug } from '../../types/content';

export interface GameDetailViewProps {
  slug: string;
}

function renderInlineBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function renderRichCopy(content: string): React.ReactNode {
  const blocks = content.split(/\n\n+/);
  return blocks.map((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    if (trimmed === '---') {
      return <hr key={idx} className="border-white/10 my-2" />;
    }

    if (trimmed.startsWith('### ')) {
      return (
        <h3
          key={idx}
          className="font-display text-lg font-semibold text-[#cebdff] pt-2"
        >
          {trimmed.slice(4)}
        </h3>
      );
    }

    if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      const text = trimmed.replace(/^#{1,2}\s+/, '');
      return (
        <h3 key={idx} className="font-display text-xl font-bold text-white">
          {text}
        </h3>
      );
    }

    const lines = trimmed.split('\n');
    const isList = lines.every((line) => line.trim().startsWith('- '));
    if (isList) {
      return (
        <ul key={idx} className="space-y-2 pl-1">
          {lines.map((line, liIdx) => (
            <li
              key={liIdx}
              className="flex items-start gap-2.5 text-sm sm:text-base text-[#cbc3d6]"
            >
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#BDA7FF] shrink-0" />
              <span>{renderInlineBold(line.trim().slice(2))}</span>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p
        key={idx}
        className="text-sm sm:text-base text-[#cbc3d6] leading-relaxed"
      >
        {renderInlineBold(trimmed)}
      </p>
    );
  });
}

export const GameDetailView: React.FC<GameDetailViewProps> = ({ slug }) => {
  const { store } = useContent();
  if (!store) return null;

  const game = store.games.find((g) => g.slug === slug);

  if (!game) {
    return (
      <section className="mx-auto max-w-4xl px-5 sm:px-8 py-20 text-center space-y-4">
        <h1 className="font-display text-3xl font-bold text-white">
          Game Not Found
        </h1>
        <p className="text-sm text-[#cbc3d6]">
          The requested game could not be found in the CandyGame catalog.
        </p>
        <Link to="/games" className="inline-block">
          <Button variant="primary" leftIcon={<ArrowLeft size={16} />}>
            Back to Games
          </Button>
        </Link>
      </section>
    );
  }

  const category = game.categoryId
    ? store.categories.find((c) => c.id === game.categoryId)
    : undefined;
  const pageContent =
    slug === 'brain-challenge' || slug === 'color-world'
      ? store.pages[slug as PageSlug]
      : undefined;

  const overviewHeading =
    pageContent?.sections.overview?.heading || 'About the Game';
  const highlightsHeading =
    pageContent?.sections.highlights?.heading || 'Key Features';
  const galleryHeading =
    pageContent?.sections.gallery?.heading || 'Media & Screenshots';

  return (
    <>
      <SEOHead
        seo={game.seo}
        fallbackTitle={`${game.name} — ${store.studio.studioName}`}
        fallbackDescription={game.shortDescription}
      />

      <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 pt-10 pb-20 space-y-12">
        <div>
          <Link
            to="/games"
            className="inline-flex items-center gap-2 text-sm text-[#cbc3d6] hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Games</span>
          </Link>
        </div>

        {/* Game Hero */}
        <div className="candy-glass-card rounded-[2.5rem] p-7 sm:p-10 lg:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <GameIcon game={game} size="xl" />
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  {category ? (
                    <StatusBadge status="tag" label={category.name} />
                  ) : null}
                  {game.featured ? (
                    <StatusBadge status="featured" label="Featured Title" />
                  ) : null}
                </div>

                <h1 className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight">
                  {pageContent?.hero.heading || game.name}
                </h1>

                <p className="text-sm sm:text-base text-[#cbc3d6] max-w-2xl leading-relaxed">
                  {game.shortDescription}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#cbc3d6] pt-1">
                  <span className="inline-flex items-center gap-1.5">
                    <Smartphone size={14} className="text-[#BDA7FF]" />
                    Platform: {game.platform.join(', ')}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    {game.googlePlayUrl ? (
                      <GooglePlayIcon size={14} />
                    ) : (
                      <Store size={14} className="text-[#BDA7FF]" />
                    )}
                    Store: {game.storeName}
                  </span>
                  {game.version ? (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">Version {game.version}</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {game.googlePlayUrl ? (
                <a
                  href={game.googlePlayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<GooglePlayIcon size={19} />}
                    rightIcon={<ExternalLink size={16} />}
                  >
                    {pageContent?.hero.primaryCtaLabel || 'Get on Google Play'}
                  </Button>
                </a>
              ) : (
                <div className="px-5 py-3 rounded-full bg-[#151123] border border-[#BDA7FF]/20 text-xs sm:text-sm text-[#cbc3d6]">
                  Google Play URL not configured yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overview & Features */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 candy-glass-card rounded-[2rem] p-7 sm:p-9 space-y-4">
            <h2 className="font-display text-2xl font-bold text-white">
              {overviewHeading}
            </h2>
            <div className="space-y-4">{renderRichCopy(game.fullDescription)}</div>
          </div>

          <div className="lg:col-span-5 candy-glass-card rounded-[2rem] p-7 sm:p-9 space-y-5">
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold text-white">
                {highlightsHeading}
              </h2>
              {game.featuresIntro ? (
                <p className="text-sm text-[#cbc3d6]">{game.featuresIntro}</p>
              ) : null}
            </div>

            <ul className="space-y-4">
              {game.features.map((feat, idx) => {
                const splitIdx = feat.indexOf(' — ');
                const title = splitIdx !== -1 ? feat.slice(0, splitIdx) : '';
                const desc = splitIdx !== -1 ? feat.slice(splitIdx + 3) : feat;
                return (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm text-[#e7defa]"
                  >
                    <CheckCircle2
                      size={18}
                      className="text-[#BDA7FF] shrink-0 mt-0.5"
                    />
                    <div className="space-y-0.5">
                      {title ? (
                        <p className="font-semibold text-white">{title}</p>
                      ) : null}
                      <p className="text-[#cbc3d6] leading-relaxed">{desc}</p>
                    </div>
                  </li>
                );
              })}
            </ul>

            {game.featuresOutro ? (
              <p className="pt-4 border-t border-white/10 text-sm font-medium text-[#cebdff] leading-relaxed">
                {game.featuresOutro}
              </p>
            ) : null}
          </div>
        </div>

        {/* Screenshots Gallery */}
        <div className="candy-glass-card rounded-[2rem] p-7 sm:p-9 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-bold text-white">
              {galleryHeading}
            </h2>
            {game.packageId ? (
              <span className="text-xs text-[#948e9f] font-mono">
                {game.packageId}
              </span>
            ) : null}
          </div>

          {game.screenshots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {game.screenshots.map((src, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl overflow-hidden bg-[#151123] border border-[#BDA7FF]/15 aspect-video"
                >
                  <img
                    src={src}
                    alt={`${game.name} screenshot ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-[#151123] border border-dashed border-[#BDA7FF]/20 p-10 text-center space-y-2">
              <ImageIcon size={28} className="mx-auto text-[#77718B]" />
              <p className="text-sm font-medium text-[#e7defa]">
                No gameplay screenshots attached yet
              </p>
              <p className="text-xs text-[#948e9f]">
                Add verified screenshots for {game.name} in the Admin Panel under
                Games Management.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};
