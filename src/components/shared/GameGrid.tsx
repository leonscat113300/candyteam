import React from 'react';
import { Category, Game } from '../../types/content';
import { GameCard } from './GameCard';

export interface GameGridProps {
  games: Game[];
  categories: Category[];
  emptyMessage?: string;
}

export const GameGrid: React.FC<GameGridProps> = ({
  games,
  categories,
  emptyMessage = 'No games match your current selection.',
}) => {
  if (games.length === 0) {
    return (
      <div className="candy-glass-card rounded-[2rem] p-10 text-center">
        <p className="font-display text-xl font-semibold text-white">
          No Games Found
        </p>
        <p className="mt-2 text-sm text-[#cbc3d6]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {games.map((game) => {
        const category = categories.find((c) => c.id === game.categoryId);
        return <GameCard key={game.id} game={game} category={category} />;
      })}
    </div>
  );
};
