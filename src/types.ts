export type TileStatus = 'empty' | 'tbd' | 'correct' | 'present' | 'absent';

export type KeyStatus = 'correct' | 'present' | 'absent' | 'unused';

export type GameStatus = 'playing' | 'won' | 'lost';

export type GameMode = 'easy' | 'normal' | 'hard';

export interface TileData {
  char: string;
  status: TileStatus;
}
