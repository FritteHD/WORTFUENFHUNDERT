import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameMode, GameStatus, GuessResult, Statistics, TileColor } from '../types';
import {
  evaluateGuess,
  getDailyWord,
  getRandomWord,
  isValidGuess,
  loadStatistics,
  updateStatistics,
  loadDailyState,
  saveDailyState,
  loadSavedColors,
  saveColors,
  getTodayDateString,
} from '../gameLogic';

const MAX_ATTEMPTS = 8;
const WORD_LENGTH = 5;
/** Character the SPACE key inserts as a placeholder in the current guess */
export const PLACEHOLDER = '-';
/** How often to check whether a new daily puzzle is available */
const DAY_CHECK_INTERVAL_MS = 30_000;

interface UseGameReturn {
  guesses: GuessResult[];
  currentGuess: string;
  gameStatus: GameStatus;
  maxAttempts: number;
  usedLetters: Set<string>;
  gameMode: GameMode;
  targetWord: string;
  statistics: Statistics;
  shakeRow: number | null;
  revealRow: number | null;
  toastMessage: string;
  toastVisible: boolean;
  tileColors: Record<string, TileColor>;
  keyColors: Record<string, TileColor>;
  cycleTileColor: (rowIndex: number, colIndex: number) => void;
  cycleKeyColor: (letter: string) => void;
  clearColors: () => void;
  handleKey: (key: string) => void;
  setGameMode: (mode: GameMode) => void;
  startNewGame: () => void;
  shareResult: () => void;
}

function loadInitialMode(): GameMode {
  return localStorage.getItem('word500-mode') === 'free' ? 'free' : 'daily';
}

// Grau -> Rot -> Gelb -> Grün -> Grau
function nextColor(current: TileColor): TileColor {
  if (current === 'default') return 'red';
  if (current === 'red') return 'yellow';
  if (current === 'yellow') return 'green';
  return 'default';
}

function cycleInRecord(prev: Record<string, TileColor>, key: string): Record<string, TileColor> {
  const color = nextColor(prev[key] || 'default');
  const next = { ...prev };
  if (color === 'default') delete next[key];
  else next[key] = color;
  return next;
}

export function useGame(targetWords: string[], validGuesses: string[]): UseGameReturn {
  const [gameMode, setGameModeState] = useState<GameMode>(loadInitialMode);
  const [targetWord, setTargetWord] = useState<string>('');
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [usedLetters, setUsedLetters] = useState<Set<string>>(new Set());
  const [statistics, setStatistics] = useState<Statistics>(() => loadStatistics(loadInitialMode()));
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [revealRow, setRevealRow] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Manual coloring of tiles and keyboard keys
  const [tileColors, setTileColors] = useState<Record<string, TileColor>>({});
  const [keyColors, setKeyColors] = useState<Record<string, TileColor>>({});
  // Date under which manual colors are persisted (daily mode only, null = don't persist)
  const [colorsDate, setColorsDate] = useState<string | null>(null);

  const isProcessing = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Date of the daily puzzle currently loaded
  const dailyDateRef = useRef<string | null>(null);

  const showToast = useCallback((msg: string, duration = 2000) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage(msg);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), duration);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const cycleTileColor = useCallback((rowIndex: number, colIndex: number) => {
    setTileColors((prev) => cycleInRecord(prev, `${rowIndex}-${colIndex}`));
  }, []);

  const cycleKeyColor = useCallback((letter: string) => {
    setKeyColors((prev) => cycleInRecord(prev, letter));
  }, []);

  const clearColors = useCallback(() => {
    setTileColors({});
    setKeyColors({});
    showToast('Farbmarkierungen gelöscht');
  }, [showToast]);

  // Persist manual colors for the daily puzzle
  useEffect(() => {
    if (colorsDate) saveColors(colorsDate, { tileColors, keyColors });
  }, [colorsDate, tileColors, keyColors]);

  // Initialize game
  const initGame = useCallback(
    (mode: GameMode) => {
      if (targetWords.length === 0) return;

      setStatistics(loadStatistics(mode));

      if (mode === 'daily') {
        const today = getTodayDateString();
        dailyDateRef.current = today;
        const word = getDailyWord(targetWords, today);
        const savedState = loadDailyState(today);
        const savedColors = loadSavedColors(today);
        setTileColors(savedColors.tileColors);
        setKeyColors(savedColors.keyColors);
        setColorsDate(today);

        if (savedState && savedState.targetWord === word) {
          setTargetWord(savedState.targetWord);
          setGuesses(savedState.guesses);
          setGameStatus(savedState.gameStatus);
          const used = new Set<string>();
          savedState.guesses.forEach((g) => {
            for (const c of g.word) used.add(c);
          });
          setUsedLetters(used);
        } else {
          setTargetWord(word);
          setGuesses([]);
          setGameStatus('playing');
          setUsedLetters(new Set());
        }
      } else {
        dailyDateRef.current = null;
        setColorsDate(null);
        setTileColors({});
        setKeyColors({});
        setTargetWord(getRandomWord(targetWords));
        setGuesses([]);
        setGameStatus('playing');
        setUsedLetters(new Set());
      }
      setCurrentGuess('');
      isProcessing.current = false;
    },
    [targetWords]
  );

  useEffect(() => {
    initGame(gameMode);
  }, [gameMode, initGame]);

  // A free game left unfinished after at least one guess counts as a loss
  const abandonActiveFreeGame = useCallback(() => {
    if (gameMode !== 'free' || gameStatus !== 'playing' || guesses.length === 0) return;
    updateStatistics('free', false, guesses.length);
    showToast(`Spiel abgebrochen – das Wort war: ${targetWord}`, 3000);
  }, [gameMode, gameStatus, guesses.length, targetWord, showToast]);

  const setGameMode = useCallback(
    (mode: GameMode) => {
      if (mode === gameMode) return;
      abandonActiveFreeGame();
      localStorage.setItem('word500-mode', mode);
      setGameModeState(mode);
    },
    [gameMode, abandonActiveFreeGame]
  );

  const startNewGame = useCallback(() => {
    if (gameMode === 'free') {
      abandonActiveFreeGame();
      initGame('free');
    }
  }, [gameMode, initGame, abandonActiveFreeGame]);

  // Switch to the new daily puzzle after midnight (unless a game is in progress)
  useEffect(() => {
    if (gameMode !== 'daily') return;

    const check = () => {
      const loaded = dailyDateRef.current;
      if (!loaded || loaded === getTodayDateString()) return;
      if (isProcessing.current) return;
      if (gameStatus === 'playing' && guesses.length > 0) return;
      initGame('daily');
      showToast('📅 Neues Tagesrätsel ist da!', 3000);
    };

    const interval = setInterval(check, DAY_CHECK_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', check);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', check);
    };
  }, [gameMode, gameStatus, guesses.length, initGame, showToast]);

  const rejectGuess = useCallback(
    (msg: string) => {
      setShakeRow(guesses.length);
      setTimeout(() => setShakeRow(null), 500);
      showToast(msg);
    },
    [guesses.length, showToast]
  );

  const submitGuess = useCallback(() => {
    if (isProcessing.current) return;
    if (currentGuess.includes(PLACEHOLDER)) {
      rejectGuess('Platzhalter (–) erst durch Buchstaben ersetzen!');
      return;
    }
    if (currentGuess.length !== WORD_LENGTH) {
      rejectGuess('Wort muss 5 Buchstaben haben!');
      return;
    }

    const upperGuess = currentGuess.toUpperCase();
    if (!isValidGuess(upperGuess, validGuesses)) {
      rejectGuess('Wort nicht in der Wortliste!');
      return;
    }

    isProcessing.current = true;
    const result = evaluateGuess(upperGuess, targetWord);
    const guessResult: GuessResult = { word: upperGuess, ...result };

    const newGuesses = [...guesses, guessResult];
    setGuesses(newGuesses);
    setRevealRow(guesses.length);

    const newUsed = new Set(usedLetters);
    for (const c of upperGuess) newUsed.add(c);
    setUsedLetters(newUsed);

    setCurrentGuess('');

    const puzzleDate = dailyDateRef.current;

    // Check win/lose after reveal animation
    setTimeout(() => {
      setRevealRow(null);
      let newStatus: GameStatus = 'playing';

      if (result.green === WORD_LENGTH) {
        newStatus = 'won';
        setGameStatus('won');
        setStatistics(updateStatistics(gameMode, true, newGuesses.length, puzzleDate ?? undefined));
        showToast('🎉 Fantastisch!', 3000);
      } else if (newGuesses.length >= MAX_ATTEMPTS) {
        newStatus = 'lost';
        setGameStatus('lost');
        setStatistics(updateStatistics(gameMode, false, newGuesses.length, puzzleDate ?? undefined));
        showToast(`Das Wort war: ${targetWord}`, 4000);
      }

      // Save under the puzzle's own date, even if midnight passed meanwhile
      if (gameMode === 'daily' && puzzleDate) {
        saveDailyState({
          date: puzzleDate,
          guesses: newGuesses,
          gameStatus: newStatus,
          targetWord,
        });
      }

      isProcessing.current = false;
    }, 450);
  }, [currentGuess, guesses, targetWord, validGuesses, usedLetters, gameMode, showToast, rejectGuess]);

  const handleKey = useCallback(
    (key: string) => {
      if (gameStatus !== 'playing') return;
      if (isProcessing.current) return;

      if (key === 'ENTER') {
        submitGuess();
      } else if (key === 'BACKSPACE') {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (key === 'SPACE') {
        setCurrentGuess((prev) => (prev.length >= WORD_LENGTH ? prev : prev + PLACEHOLDER));
      } else if (/^[A-Z]$/.test(key)) {
        setCurrentGuess((prev) => {
          if (prev.length < WORD_LENGTH) return prev + key;
          // Row is full: fill the first placeholder instead
          const idx = prev.indexOf(PLACEHOLDER);
          if (idx === -1) return prev;
          return prev.slice(0, idx) + key + prev.slice(idx + 1);
        });
      }
    },
    [gameStatus, submitGuess]
  );

  // Physical keyboard handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        handleKey('ENTER');
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleKey('BACKSPACE');
      } else if (e.key === ' ' || e.key === '-') {
        e.preventDefault();
        handleKey('SPACE');
      } else {
        const upper = e.key.toUpperCase();
        if (/^[A-Z]$/.test(upper)) {
          e.preventDefault();
          handleKey(upper);
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKey]);

  const shareResult = useCallback(() => {
    if (gameStatus === 'playing') return;

    const dateStr = gameMode === 'daily' ? dailyDateRef.current ?? getTodayDateString() : 'Freies Spiel';
    const wonStr = gameStatus === 'won' ? `${guesses.length}/${MAX_ATTEMPTS}` : `X/${MAX_ATTEMPTS}`;

    let text = `Word500 (${dateStr}) ${wonStr}\n\n`;
    for (const g of guesses) {
      text += `${'🟩'.repeat(g.green)}${'🟨'.repeat(g.yellow)}${'🟥'.repeat(g.red)}\n`;
    }
    // Link back to wherever the game is hosted (e.g. GitHub Pages)
    text += `\n${window.location.origin}${import.meta.env.BASE_URL}`;

    navigator.clipboard
      .writeText(text)
      .then(() => showToast('Ergebnis in die Zwischenablage kopiert! 📋'))
      .catch(() => showToast('Kopieren fehlgeschlagen'));
  }, [gameStatus, gameMode, guesses, showToast]);

  return {
    guesses,
    currentGuess,
    gameStatus,
    maxAttempts: MAX_ATTEMPTS,
    usedLetters,
    gameMode,
    targetWord,
    statistics,
    shakeRow,
    revealRow,
    toastMessage,
    toastVisible,
    tileColors,
    keyColors,
    cycleTileColor,
    cycleKeyColor,
    clearColors,
    handleKey,
    setGameMode,
    startNewGame,
    shareResult,
  };
}
