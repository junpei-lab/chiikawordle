import { TileStatus } from '../types';

interface TileProps {
  char: string;
  status: TileStatus;
  isRevealing: boolean;
  isBouncing: boolean;
  delay: number;
  position: number;
}

const STATUS_COLORS: Record<TileStatus, string> = {
  empty: 'bg-white border-gray-300',
  tbd: 'bg-white border-gray-500',
  correct: 'bg-emerald-500 border-emerald-500 text-white',
  present: 'bg-amber-400 border-amber-400 text-white',
  absent: 'bg-gray-400 border-gray-400 text-white',
};

export function Tile({ char, status, isRevealing, isBouncing, delay, position }: TileProps) {
  const hasChar = char !== '';
  const isRevealed = status !== 'empty' && status !== 'tbd';
  const textColor = isRevealed ? '' : 'text-gray-800';

  return (
    <div
      className={`
        w-[52px] h-[52px] sm:w-[58px] sm:h-[58px] border-2 rounded-lg
        flex items-center justify-center
        text-xl sm:text-2xl font-black select-none
        transition-colors
        ${STATUS_COLORS[status]}
        ${textColor}
        ${hasChar && !isRevealed ? 'tile-pop' : ''}
        ${isRevealing ? 'tile-flip' : ''}
        ${isBouncing ? 'tile-bounce' : ''}
      `}
      style={{
        animationDelay: isRevealing || isBouncing ? `${delay}ms` : '0ms',
        ...(isRevealing ? { '--flip-delay': `${delay}ms` } as React.CSSProperties : {}),
      }}
      data-status={status}
      data-position={position}
    >
      <span
        className="tile-char"
        style={isRevealing ? { animationDelay: `${delay}ms` } : {}}
      >
        {char}
      </span>
    </div>
  );
}
