import { useState, useEffect } from 'react';
import { Trophy, RefreshCw, Clock } from 'lucide-react';
import { GameMode } from '../types';

interface GameOverModalProps {
  gameStatus: 'won' | 'lost';
  answer: string;
  guessCount: number;
  onPlayAgain: () => void;
  gameMode: GameMode;
  isDaily: boolean;
}

function getTimeUntilMidnight(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function GameOverModal({ gameStatus, answer, guessCount, onPlayAgain, gameMode, isDaily }: GameOverModalProps) {
  const isWin = gameStatus === 'won';
  const [countdown, setCountdown] = useState(getTimeUntilMidnight);

  useEffect(() => {
    if (!isDaily) return;
    const interval = setInterval(() => {
      setCountdown(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, [isDaily]);

  const modeLabel = gameMode === 'hard' ? 'むずかしい' : 'ふつう';

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full modal-enter border border-gray-200 shadow-xl text-center">
        {isWin ? (
          <>
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="text-emerald-500" size={32} />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">
              正解！
            </h2>
            <p className="text-gray-600 mb-1">
              <span className="text-emerald-500 font-bold text-3xl">{guessCount}</span>
              <span className="text-gray-400 text-sm ml-1">回目で正解</span>
            </p>
            <p className="text-gray-400 text-sm mb-1">
              答え：
              <span className="text-gray-800 font-bold ml-1">{answer}</span>
            </p>
            <p className="text-xs text-gray-300 mb-5">
              {modeLabel}モード
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-rose-400 text-3xl font-black">X</span>
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">
              残念...
            </h2>
            <p className="text-gray-600 mb-1">
              答えは
              <span className="text-pink-400 font-bold text-lg mx-1">「{answer}」</span>
              でした
            </p>
            <p className="text-xs text-gray-300 mb-5">
              {modeLabel}モード
            </p>
          </>
        )}

        {isDaily && (
          <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs mb-4">
            <Clock size={12} />
            <span>次の問題まで</span>
            <span className="font-mono font-bold text-gray-600">{countdown}</span>
          </div>
        )}

        <button
          onClick={onPlayAgain}
          className="w-full py-3 bg-pink-400 hover:bg-pink-300 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 active:scale-95 shadow-sm"
        >
          <RefreshCw size={18} />
          もう一回（ランダム）
        </button>
      </div>
    </div>
  );
}
