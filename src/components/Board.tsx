import { TileData, GameStatus } from '../types';
import { Tile } from './Tile';

interface BoardProps {
  guesses: TileData[][];
  currentGuess: string[];
  displayColumns: number;
  maxGuesses: number;
  shakeRow: boolean;
  revealRow: number;
  bounceRow: number;
  gameStatus: GameStatus;
}

export function Board({
  guesses,
  currentGuess,
  displayColumns,
  maxGuesses,
  shakeRow,
  revealRow,
  bounceRow,
  gameStatus,
}: BoardProps) {
  const rows = [];

  for (let i = 0; i < maxGuesses; i++) {
    const isCompleted = i < guesses.length;
    const isCurrent = i === guesses.length;
    const isRevealing = revealRow === i;
    const isBouncing = bounceRow === i && gameStatus === 'won';
    const isShaking = isCurrent && shakeRow;

    const cols = isCompleted ? guesses[i].length : displayColumns;
    const tiles = [];
    for (let j = 0; j < cols; j++) {
      let char = '';
      let status: TileData['status'] = 'empty';

      if (isCompleted) {
        char = guesses[i][j].char;
        status = guesses[i][j].status;
      } else if (isCurrent && j < currentGuess.length) {
        char = currentGuess[j];
        status = 'tbd';
      }

      tiles.push(
        <Tile
          key={j}
          char={char}
          status={status}
          isRevealing={isRevealing}
          isBouncing={isBouncing}
          delay={j * 250}
          position={j}
        />
      );
    }

    rows.push(
      <div
        key={i}
        className={`flex justify-center gap-1.5 ${isShaking ? 'row-shake' : ''}`}
      >
        {tiles}
      </div>
    );
  }

  return <div className="flex flex-col gap-1.5">{rows}</div>;
}
