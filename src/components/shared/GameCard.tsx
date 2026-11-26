import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, Smartphone } from 'lucide-react';
import { Category, Game } from '../../types/content';
import { Button } from '../ui/Button';
import { GameIcon } from './GameIcon';
import { GooglePlayIcon } from './GooglePlayIcon';

export interface GameCardProps {
  game: Game;
  category?: Category;
}

export const GameCard: React.FC<GameCardProps> = ({ game, category }) => {
  const detailPath = `/games/${game.slug}`;

  return (
    <article className="group candy-glass-card rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:border-[#BDA7FF]/40">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <GameIcon game={game} size="lg" />
          {category ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#7652D6]/15 text-[#BDA7FF] border border-[#BDA7FF]/20">
                {category.name}
              </span>
            </div>
          ) : null}
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs text-[#cbc3d6]">
            <Smartphone size={13} className="text-[#BDA7FF]" />
            <span>{game.platform.join(', ')}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5">
              {game.googlePlayUrl ? <GooglePlayIcon size={13} /> : null}
              <span>{game.storeName}</span>
            </span>
          </div>
          <h3 className="font-display text-2xl font-semibold text-white tracking-tight">
            {game.name}
          </h3>
          <p className="text-sm sm:text-[15px] text-[#cbc3d6] leading-relaxed">
            {game.shortDescription}
          </p>
        </div>
      </div>

      <div className="mt-7 pt-5 border-t border-white/10 flex flex-wrap items-center gap-3">
        <Link to={detailPath}>
          <Button variant="primary" size="sm" rightIcon={<ArrowRight size={15} />}>
            View Game
          </Button>
        </Link>

        {game.googlePlayUrl ? (
          <a
            href={game.googlePlayUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<GooglePlayIcon size={15} />}
              rightIcon={<ExternalLink size={14} />}
            >
              Google Play
            </Button>
          </a>
        ) : null}
      </div>
    </article>
  );
};
