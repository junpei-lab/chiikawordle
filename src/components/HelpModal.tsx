import { X } from 'lucide-react';
import { GameMode } from '../types';

interface HelpModalProps {
  onClose: () => void;
  gameMode: GameMode;
}

export function HelpModal({ onClose, gameMode }: HelpModalProps) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full modal-enter border border-gray-200 shadow-xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-gray-800">あそびかた</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 text-sm text-gray-600">
          {gameMode === 'normal' ? (
            <p>
              5文字のひらがな単語を6回以内に当てよう！
            </p>
          ) : (
            <div className="space-y-2">
              <p>
                2〜5文字のひらがな単語を6回以内に当てよう！
              </p>
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-rose-600 text-xs">
                <p className="font-bold mb-1">むずかしいモード</p>
                <p>文字数が分からない状態でスタートします。「ヒントを見る」ボタンで文字数を確認できます。</p>
              </div>
            </div>
          )}

          <div>
            <p className="font-bold text-gray-800 mb-2">ヒントの見かた</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-lg shrink-0">
                  あ
                </div>
                <p className="text-gray-500">
                  正しい位置にある文字
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-400 flex items-center justify-center text-white font-black text-lg shrink-0">
                  き
                </div>
                <p className="text-gray-500">
                  含まれるが位置が違う文字
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-400 flex items-center justify-center text-white font-black text-lg shrink-0">
                  む
                </div>
                <p className="text-gray-500">
                  含まれない文字
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="font-bold text-gray-800 mb-1">キーボード</p>
            <p className="text-gray-500">
              「清音」と「濁音・小文字」タブで切り替えできます。
              ゃ・ゅ・ょ・っ のような小さい文字も1文字としてカウントします。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
