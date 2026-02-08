import { HelpCircle, RotateCcw } from 'lucide-react';
import { GameMode } from '../types';

interface HeaderProps {
  onReset: () => void;
  onHelp: () => void;
  gameMode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

export function Header({ onReset, onHelp, gameMode, onModeChange }: HeaderProps) {
  return (
    <header className="border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onHelp}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="ヘルプ"
        >
          <HelpCircle size={22} />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-black tracking-wider text-gray-800">
            ちいかわーどる
          </h1>
          <p className="text-[10px] text-gray-400 tracking-widest">
            JAPANESE WORDLE
          </p>
        </div>
        <button
          onClick={onReset}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="リセット"
        >
          <RotateCcw size={20} />
        </button>
      </div>
      <div className="flex gap-1 justify-center pb-2.5">
        <button
          onClick={() => onModeChange('normal')}
          className={`px-4 py-1 rounded-full text-xs font-bold tracking-wide transition-all ${
            gameMode === 'normal'
              ? 'bg-pink-400 text-white shadow-sm'
              : 'bg-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200'
          }`}
        >
          ふつう
        </button>
        <button
          onClick={() => onModeChange('hard')}
          className={`px-4 py-1 rounded-full text-xs font-bold tracking-wide transition-all ${
            gameMode === 'hard'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200'
          }`}
        >
          むずかしい
        </button>
      </div>
    </header>
  );
}
