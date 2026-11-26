import React from 'react';
import { Brain, Gamepad2, Palette } from 'lucide-react';
import { Game } from '../../types/content';

export interface GameIconProps {
  game: Pick<Game, 'name' | 'slug' | 'icon'>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const GameIcon: React.FC<GameIconProps> = ({
  game,
  size = 'md',
  className = '',
}) => {
  const sizeClasses: Record<NonNullable<GameIconProps['size']>, string> = {
    sm: 'w-11 h-11 rounded-xl',
    md: 'w-16 h-16 rounded-2xl',
    lg: 'w-24 h-24 rounded-3xl',
    xl: 'w-32 h-32 rounded-[2rem]',
  };

  const iconSizeMap: Record<NonNullable<GameIconProps['size']>, number> = {
    sm: 20,
    md: 28,
    lg: 42,
    xl: 56,
  };

  const isBrain = game.slug === 'brain-challenge';
  const isColor = game.slug === 'color-world';

  const fallbackGradient = isBrain
    ? 'from-[#7652D6] via-[#5027af] to-[#38206F]'
    : isColor
      ? 'from-[#8a65e8] via-[#7652D6] to-[#4d3988]'
      : 'from-[#4f3887] to-[#272143]';

  if (game.icon) {
    return (
      <div
        className={`${sizeClasses[size]} shrink-0 flex items-center justify-center overflow-hidden ${className}`}
      >
        <img
          src={game.icon}
          alt={game.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(118,82,214,0.35)]"
        />
      </div>
    );
  }

  return (
    <div
      aria-label={game.name}
      className={`${sizeClasses[size]} bg-gradient-to-br ${fallbackGradient} border border-[#BDA7FF]/30 shadow-[0_8px_24px_rgba(118,82,214,0.35)] shrink-0 flex items-center justify-center text-[#f2eaff] ${className}`}
    >
      {isBrain ? (
        <Brain size={iconSizeMap[size]} strokeWidth={1.8} />
      ) : isColor ? (
        <Palette size={iconSizeMap[size]} strokeWidth={1.8} />
      ) : (
        <Gamepad2 size={iconSizeMap[size]} strokeWidth={1.8} />
      )}
    </div>
  );
};
