import { useState, useEffect, useRef, useCallback } from 'react';
import { Lightbulb } from 'lucide-react';
import { GameMode } from './types';
import { useWordle } from './hooks/useWordle';
import { Header } from './components/Header';
import { Board } from './components/Board';
import { Keyboard } from './components/Keyboard';
import { GameOverModal } from './components/GameOverModal';
import { HelpModal } from './components/HelpModal';

function App() {
  const isDebugMode = import.meta.env.DEV;
  const [gameMode, setGameMode] = useState<GameMode>('normal');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const {
    guesses,
    currentGuess,
    gameStatus,
    keyStatuses,
    shakeRow,
    revealRow,
    bounceRow,
    answer,
    addChar,
    removeChar,
    submitGuess,
    resetGame,
    revealHint,
    hintRevealed,
    toastMessage,
    isDaily,
    maxGuesses,
    wordLength,
    displayColumns,
  } = useWordle(gameMode);

  const [showHelp, setShowHelp] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const keyboardContainerRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);

  const focusInput = useCallback(() => {
    if (!showHelp && !showGameOver) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [showHelp, showGameOver]);

  useEffect(() => {
    focusInput();
  }, [showHelp, showGameOver, focusInput]);

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false;
    const text = e.data;
    if (text) {
      for (const char of text) {
        addChar(char);
      }
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleInputChange = () => {
    if (!isComposingRef.current && inputRef.current) {
      inputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (gameStatus === 'won' || gameStatus === 'lost') {
      const timer = setTimeout(() => setShowGameOver(true), 1600);
      return () => clearTimeout(timer);
    }
  }, [gameStatus]);

  useEffect(() => {
    setShowGameOver(false);
  }, [gameMode]);

  useEffect(() => {
    const keyboardElement = keyboardContainerRef.current;
    if (!keyboardElement) return;

    const updateKeyboardHeight = () => {
      const nextHeight = Math.ceil(keyboardElement.getBoundingClientRect().height);
      setKeyboardHeight(prevHeight => (prevHeight === nextHeight ? prevHeight : nextHeight));
    };

    updateKeyboardHeight();

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(updateKeyboardHeight);
      observer.observe(keyboardElement);
    }

    window.addEventListener('resize', updateKeyboardHeight);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateKeyboardHeight);
    };
  }, []);

  const handlePlayAgain = () => {
    setShowGameOver(false);
    resetGame();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" onClick={focusInput}>
      <Header
        onReset={() => {
          setShowGameOver(false);
          resetGame();
        }}
        onHelp={() => setShowHelp(true)}
        gameMode={gameMode}
        onModeChange={setGameMode}
      />

      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 toast-enter">
          <div className="bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg whitespace-nowrap">
            {toastMessage}
          </div>
        </div>
      )}

      {isDebugMode && (
        <div className="fixed top-20 right-3 z-40 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 shadow-sm">
          DEBUG: 答え {answer}
        </div>
      )}

      <input
        ref={inputRef}
        type="text"
        inputMode="none"
        autoFocus
        aria-hidden="true"
        tabIndex={-1}
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onChange={handleInputChange}
      />

      <main
        className="flex-1 overflow-y-auto py-4 px-2 max-w-lg mx-auto w-full"
        style={{
          paddingBottom: `calc(${keyboardHeight}px + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        <div className="min-h-full flex flex-col items-center justify-center gap-3">
          {gameMode === 'hard' && gameStatus === 'playing' && (
            <div className="flex justify-center">
              {!hintRevealed ? (
                <button
                  onClick={revealHint}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-xs font-bold hover:bg-amber-100 transition-colors active:scale-95"
                >
                  <Lightbulb size={14} />
                  ヒントを見る
                </button>
              ) : (
                <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-xs font-bold">
                  <Lightbulb size={14} />
                  {wordLength} 文字
                </div>
              )}
            </div>
          )}

          {gameMode === 'hard' && hintRevealed && gameStatus !== 'playing' && (
            <div className="flex justify-center">
              <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-xs font-bold">
                <Lightbulb size={14} />
                {wordLength} 文字
              </div>
            </div>
          )}

          <Board
            guesses={guesses}
            currentGuess={currentGuess}
            displayColumns={displayColumns}
            maxGuesses={maxGuesses}
            shakeRow={shakeRow}
            revealRow={revealRow}
            bounceRow={bounceRow}
            gameStatus={gameStatus}
          />
        </div>
      </main>

      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-gray-50 border-t border-gray-200"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div ref={keyboardContainerRef} className="max-w-lg mx-auto w-full px-2 py-2">
          <Keyboard
            keyStatuses={keyStatuses}
            onChar={addChar}
            onDelete={removeChar}
            onEnter={submitGuess}
          />
        </div>
      </div>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} gameMode={gameMode} />}
      {showGameOver && (gameStatus === 'won' || gameStatus === 'lost') && (
        <GameOverModal
          gameStatus={gameStatus}
          answer={answer}
          guessCount={guesses.length}
          onPlayAgain={handlePlayAgain}
          onClose={() => setShowGameOver(false)}
          gameMode={gameMode}
          isDaily={isDaily}
        />
      )}
    </div>
  );
}

export default App;
