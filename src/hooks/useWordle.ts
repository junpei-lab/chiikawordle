import { useState, useCallback, useEffect, useRef } from 'react';
import { TileData, KeyStatus, GameStatus, GameMode } from '../types';
import { ANSWER_WORDS, HARD_ANSWER_WORDS, isValidHiragana } from '../data/words';

const MAX_GUESSES = 6;
const HARD_MAX_COLUMNS = 5;

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

interface DailyState {
  date: string;
  guesses: TileData[][];
  gameStatus: GameStatus;
  keyStatuses: [string, KeyStatus][];
  hintRevealed: boolean;
}

function loadDailyState(mode: GameMode): DailyState | null {
  try {
    const raw = localStorage.getItem(`mojiate-${mode}`);
    if (!raw) return null;
    const state = JSON.parse(raw) as DailyState;
    if (state.date !== getTodayString()) return null;
    return state;
  } catch {
    return null;
  }
}

function saveDailyState(mode: GameMode, state: DailyState): void {
  try {
    localStorage.setItem(`mojiate-${mode}`, JSON.stringify(state));
  } catch { /* ignore */ }
}

function getDailyWord(mode: GameMode): string {
  const words = mode === 'hard' ? HARD_ANSWER_WORDS : ANSWER_WORDS;
  const epoch = new Date(2024, 0, 1).getTime();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = now.getTime() - epoch;
  const dayIndex = Math.floor(diff / 86400000);
  const offset = mode === 'hard' ? 137 : 0;
  return words[((dayIndex + offset) % words.length + words.length) % words.length];
}

function getRandomWord(mode: GameMode): string {
  const words = mode === 'hard' ? HARD_ANSWER_WORDS : ANSWER_WORDS;
  return words[Math.floor(Math.random() * words.length)];
}

function evaluate(guess: string[], answer: string[]): ('correct' | 'present' | 'absent')[] {
  const len = guess.length;
  const result: ('correct' | 'present' | 'absent')[] = new Array(len).fill('absent');
  const answerUsed = new Array(len).fill(false);
  const guessUsed = new Array(len).fill(false);

  for (let i = 0; i < len; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 'correct';
      answerUsed[i] = true;
      guessUsed[i] = true;
    }
  }

  for (let i = 0; i < len; i++) {
    if (guessUsed[i]) continue;
    for (let j = 0; j < len; j++) {
      if (answerUsed[j]) continue;
      if (guess[i] === answer[j]) {
        result[i] = 'present';
        answerUsed[j] = true;
        break;
      }
    }
  }

  return result;
}

function buildInitialState(mode: GameMode) {
  const saved = loadDailyState(mode);
  const dailyWord = getDailyWord(mode);

  if (saved) {
    return {
      answer: dailyWord.split(''),
      guesses: saved.guesses,
      gameStatus: saved.gameStatus as GameStatus,
      keyStatuses: new Map(saved.keyStatuses) as Map<string, KeyStatus>,
      hintRevealed: saved.hintRevealed ?? false,
      isDaily: true,
    };
  }

  return {
    answer: dailyWord.split(''),
    guesses: [] as TileData[][],
    gameStatus: 'playing' as GameStatus,
    keyStatuses: new Map() as Map<string, KeyStatus>,
    hintRevealed: false,
    isDaily: true,
  };
}

type InitialState = ReturnType<typeof buildInitialState>;

function getInitialGuess(mode: GameMode, answer: string[]): string[] {
  return mode === 'easy' && answer.length > 0 ? [answer[0]] : [];
}

export function useWordle(mode: GameMode) {
  const [initial] = useState(() => buildInitialState(mode));
  const [answer, setAnswer] = useState<string[]>(initial.answer);
  const [guesses, setGuesses] = useState<TileData[][]>(initial.guesses);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>(initial.gameStatus);
  const [keyStatuses, setKeyStatuses] = useState<Map<string, KeyStatus>>(initial.keyStatuses);
  const [shakeRow, setShakeRow] = useState(false);
  const [revealRow, setRevealRow] = useState(-1);
  const [bounceRow, setBounceRow] = useState(-1);
  const [hintRevealed, setHintRevealed] = useState(initial.hintRevealed);
  const [toastMessage, setToastMessage] = useState('');
  const [isDaily, setIsDaily] = useState(true);
  const prevModeRef = useRef(mode);
  const lastDateRef = useRef(getTodayString());

  const wordLength = answer.length;
  const displayColumns = mode === 'hard' && !hintRevealed ? HARD_MAX_COLUMNS : wordLength;

  const applyInitialState = useCallback((s: InitialState) => {
    setAnswer(s.answer);
    setGuesses(s.guesses);
    setCurrentGuess(getInitialGuess(mode, s.answer));
    setGameStatus(s.gameStatus);
    setKeyStatuses(s.keyStatuses);
    setHintRevealed(s.hintRevealed);
    setIsDaily(true);
    setShakeRow(false);
    setRevealRow(-1);
    setBounceRow(-1);
    setToastMessage('');
  }, [mode]);

  useEffect(() => {
    if (prevModeRef.current === mode) return;
    prevModeRef.current = mode;
    applyInitialState(buildInitialState(mode));
    lastDateRef.current = getTodayString();
  }, [mode, applyInitialState]);

  useEffect(() => {
    if (!isDaily) return;
    const interval = window.setInterval(() => {
      const today = getTodayString();
      if (today === lastDateRef.current) return;
      lastDateRef.current = today;
      applyInitialState(buildInitialState(mode));
      setToastMessage('今日の問題に切り替わりました');
    }, 30000);
    return () => window.clearInterval(interval);
  }, [isDaily, mode, applyInitialState]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(''), 2000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    lastDateRef.current = getTodayString();
  }, [mode, isDaily]);

  useEffect(() => {
    if (!isDaily) return;
    saveDailyState(mode, {
      date: getTodayString(),
      guesses,
      gameStatus,
      keyStatuses: Array.from(keyStatuses.entries()),
      hintRevealed,
    });
  }, [isDaily, guesses, gameStatus, keyStatuses, hintRevealed, mode]);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  const addChar = useCallback((char: string) => {
    if (gameStatus !== 'playing') return;
    if (!isValidHiragana(char)) return;
    setCurrentGuess(prev => {
      if (prev.length >= displayColumns) return prev;
      return [...prev, char];
    });
  }, [gameStatus, displayColumns]);

  const removeChar = useCallback(() => {
    if (gameStatus !== 'playing') return;
    setCurrentGuess(prev => {
      const minimumLength = mode === 'easy' ? 1 : 0;
      if (prev.length <= minimumLength) return prev;
      return prev.slice(0, -1);
    });
  }, [gameStatus, mode]);

  const submitGuess = useCallback(() => {
    if (gameStatus !== 'playing') return;

    if (mode === 'hard' && !hintRevealed) {
      if (currentGuess.length < 2) {
        setShakeRow(true);
        setTimeout(() => setShakeRow(false), 600);
        return;
      }
      if (currentGuess.length !== wordLength) {
        setShakeRow(true);
        showToast('文字数が違います');
        setTimeout(() => setShakeRow(false), 600);
        return;
      }
    } else {
      if (currentGuess.length !== wordLength) {
        setShakeRow(true);
        setTimeout(() => setShakeRow(false), 600);
        return;
      }
    }

    const statuses = evaluate(currentGuess, answer);
    const newGuess: TileData[] = currentGuess.map((char, i) => ({
      char,
      status: statuses[i],
    }));

    const newKeyStatuses = new Map(keyStatuses);
    currentGuess.forEach((char, i) => {
      const prev = newKeyStatuses.get(char);
      const curr = statuses[i];
      if (curr === 'correct') {
        newKeyStatuses.set(char, 'correct');
      } else if (curr === 'present' && prev !== 'correct') {
        newKeyStatuses.set(char, 'present');
      } else if (!prev) {
        newKeyStatuses.set(char, 'absent');
      }
    });

    const newGuessIndex = guesses.length;
    setRevealRow(newGuessIndex);
    setGuesses(prev => [...prev, newGuess]);
    setCurrentGuess(getInitialGuess(mode, answer));
    setKeyStatuses(newKeyStatuses);

    const isCorrect = statuses.every(s => s === 'correct');
    const revealDuration = wordLength * 250 + 400;

    if (isCorrect) {
      setTimeout(() => {
        setBounceRow(newGuessIndex);
        setGameStatus('won');
      }, revealDuration);
    } else if (newGuessIndex + 1 >= MAX_GUESSES) {
      setTimeout(() => setGameStatus('lost'), revealDuration);
    }

    setTimeout(() => setRevealRow(-1), revealDuration);
  }, [gameStatus, currentGuess, answer, guesses.length, keyStatuses, wordLength, mode, hintRevealed, showToast]);

  const revealHint = useCallback(() => {
    if (hintRevealed || gameStatus !== 'playing') return;
    setHintRevealed(true);
    setCurrentGuess(prev => prev.slice(0, wordLength));
    showToast(`この単語は ${wordLength} 文字です`);
  }, [hintRevealed, gameStatus, wordLength, showToast]);

  const resetGame = useCallback(() => {
    const newAnswer = getRandomWord(mode).split('');
    setAnswer(newAnswer);
    setIsDaily(false);
    setGuesses([]);
    setCurrentGuess(getInitialGuess(mode, newAnswer));
    setGameStatus('playing');
    setKeyStatuses(new Map());
    setShakeRow(false);
    setRevealRow(-1);
    setBounceRow(-1);
    setHintRevealed(false);
    setToastMessage('');
  }, [mode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      if (e.isComposing || e.keyCode === 229) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        submitGuess();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        removeChar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [submitGuess, removeChar]);

  return {
    guesses,
    currentGuess,
    gameStatus,
    keyStatuses,
    shakeRow,
    revealRow,
    bounceRow,
    answer: answer.join(''),
    addChar,
    removeChar,
    submitGuess,
    resetGame,
    revealHint,
    hintRevealed,
    toastMessage,
    isDaily,
    maxGuesses: MAX_GUESSES,
    wordLength,
    displayColumns,
  };
}
