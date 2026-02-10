import { useState } from 'react';
import { Delete, CornerDownLeft } from 'lucide-react';
import { KeyStatus } from '../types';
import { SEION_GRID, DAKUON_GRID } from '../data/keyboard';

interface KeyboardProps {
  keyStatuses: Map<string, KeyStatus>;
  onChar: (char: string) => void;
  onDelete: () => void;
  onEnter: () => void;
}

const STATUS_COLORS: Record<KeyStatus, string> = {
  unused: 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800',
  correct: 'bg-emerald-500 hover:bg-emerald-400 text-white',
  present: 'bg-amber-400 hover:bg-amber-300 text-white',
  absent: 'bg-gray-400 hover:bg-gray-500 text-white',
};

function CharKey({
  char,
  status,
  onPress,
}: {
  char: string;
  status: KeyStatus;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={`${char}を入力`}
      className={`
        flex-1 h-[38px] sm:h-[42px] rounded-md
        text-[13px] sm:text-base font-bold
        flex items-center justify-center
        transition-all duration-100 active:scale-90
        shadow-sm
        ${STATUS_COLORS[status]}
      `}
    >
      {char}
    </button>
  );
}

function EmptyCell() {
  return <div className="flex-1 h-[38px] sm:h-[42px]" />;
}

function ActionButton({
  type,
  onClick,
}: {
  type: 'delete' | 'enter';
  onClick: () => void;
}) {
  const label = type === 'delete' ? '1文字削除' : '入力を確定';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`
        flex-[1.5] h-[38px] sm:h-[42px] rounded-md
        text-[11px] sm:text-xs font-bold
        flex items-center justify-center gap-0.5
        transition-all duration-100 active:scale-95
        shadow-sm
        ${type === 'delete'
          ? 'bg-gray-300 hover:bg-gray-400 active:bg-gray-500 text-gray-700'
          : 'bg-pink-400 hover:bg-pink-300 active:bg-pink-200 text-white'}
      `}
    >
      {type === 'delete' ? (
        <>
          <Delete size={14} />
          <span className="hidden sm:inline ml-0.5">削除</span>
        </>
      ) : (
        <>
          <CornerDownLeft size={14} />
          <span className="hidden sm:inline ml-0.5">決定</span>
        </>
      )}
    </button>
  );
}

function ActionSpacer() {
  return <div className="flex-[1.5] h-[38px] sm:h-[42px]" />;
}

function KeyGrid({
  grid,
  keyStatuses,
  onChar,
  onDelete,
  onEnter,
}: {
  grid: (string | null)[][];
  keyStatuses: Map<string, KeyStatus>;
  onChar: (char: string) => void;
  onDelete: () => void;
  onEnter: () => void;
}) {
  const lastRowIdx = grid.length - 1;

  return (
    <div className="flex flex-col gap-[3px]">
      {grid.map((row, rowIdx) => (
        <div key={rowIdx} className="flex gap-[3px]">
          {row.map((char, colIdx) =>
            char === null ? (
              <EmptyCell key={colIdx} />
            ) : (
              <CharKey
                key={colIdx}
                char={char}
                status={keyStatuses.get(char) || 'unused'}
                onPress={() => onChar(char)}
              />
            )
          )}
          {rowIdx === 0 ? (
            <ActionButton type="delete" onClick={onDelete} />
          ) : rowIdx === lastRowIdx ? (
            <ActionButton type="enter" onClick={onEnter} />
          ) : (
            <ActionSpacer />
          )}
        </div>
      ))}
    </div>
  );
}

export function Keyboard({ keyStatuses, onChar, onDelete, onEnter }: KeyboardProps) {
  const [activeTab, setActiveTab] = useState<'seion' | 'dakuon'>('seion');

  return (
    <div className="w-full max-w-[480px] mx-auto px-1" role="group" aria-label="かなキーボード">
      <div className="flex gap-1 mb-2 justify-center">
        <button
          type="button"
          onClick={() => setActiveTab('seion')}
          aria-pressed={activeTab === 'seion'}
          aria-label="清音キーボードを表示"
          className={`
            px-5 py-1.5 rounded-md text-xs font-bold tracking-wider transition-all
            ${activeTab === 'seion'
              ? 'bg-pink-400 text-white shadow-sm'
              : 'bg-gray-200 text-gray-500 hover:text-gray-700'}
          `}
        >
          清音
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('dakuon')}
          aria-pressed={activeTab === 'dakuon'}
          aria-label="濁音・小文字キーボードを表示"
          className={`
            px-5 py-1.5 rounded-md text-xs font-bold tracking-wider transition-all
            ${activeTab === 'dakuon'
              ? 'bg-pink-400 text-white shadow-sm'
              : 'bg-gray-200 text-gray-500 hover:text-gray-700'}
          `}
        >
          濁音・小文字
        </button>
      </div>

      {activeTab === 'seion' ? (
        <KeyGrid
          grid={SEION_GRID}
          keyStatuses={keyStatuses}
          onChar={onChar}
          onDelete={onDelete}
          onEnter={onEnter}
        />
      ) : (
        <KeyGrid
          grid={DAKUON_GRID}
          keyStatuses={keyStatuses}
          onChar={onChar}
          onDelete={onDelete}
          onEnter={onEnter}
        />
      )}
    </div>
  );
}
