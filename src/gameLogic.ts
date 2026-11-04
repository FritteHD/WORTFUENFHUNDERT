import type { Statistics, DailyState, GameMode, SavedColors, TileColor } from './types';

export function evaluateGuess(guess: string, target: string): { green: number; yellow: number; red: number } {
  guess = guess.toUpperCase();
  target = target.toUpperCase();

  let green = 0;
  let yellow = 0;
  
  const targetChars = target.split('');
  const guessChars = guess.split('');
  
  const targetUsed = new Array(targetChars.length).fill(false);
  const guessUsed = new Array(guessChars.length).fill(false);

  // First pass: exact matches
  for (let i = 0; i < guessChars.length; i++) {
    if (guessChars[i] === targetChars[i]) {
      green++;
      targetUsed[i] = true;
      guessUsed[i] = true;
    }
  }

  // Second pass: wrong positions
  for (let i = 0; i < guessChars.length; i++) {
    if (guessUsed[i]) continue;
    
    for (let j = 0; j < targetChars.length; j++) {
      if (!targetUsed[j] && guessChars[i] === targetChars[j]) {
        yellow++;
        targetUsed[j] = true;
        guessUsed[i] = true;
        break;
      }
    }
  }

  const red = guess.length - green - yellow;
  return { green, yellow, red };
}

/**
 * Per-letter colors for a guess, Wordle-style: exact matches are green, remaining
 * letters that still occur in the target are yellow (respecting letter counts), the rest red.
 */
export function letterColors(guess: string, target: string): TileColor[] {
  guess = guess.toUpperCase();
  target = target.toUpperCase();
  const colors: TileColor[] = new Array(guess.length).fill('red');
  const remaining: Record<string, number> = {};

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === target[i]) colors[i] = 'green';
    else remaining[target[i]] = (remaining[target[i]] || 0) + 1;
  }
  for (let i = 0; i < guess.length; i++) {
    if (colors[i] === 'green') continue;
    if (remaining[guess[i]] > 0) {
      colors[i] = 'yellow';
      remaining[guess[i]]--;
    }
  }
  return colors;
}

/** Keyboard color per letter: green if ever placed correctly, else yellow if in the word, else red */
export function keyboardColors(guesses: string[], target: string): Record<string, TileColor> {
  const rank: Record<TileColor, number> = { default: 0, red: 1, yellow: 2, green: 3 };
  const result: Record<string, TileColor> = {};
  for (const guess of guesses) {
    letterColors(guess, target).forEach((color, i) => {
      const letter = guess[i].toUpperCase();
      // A letter that occurs in the target is at least yellow, even if this occurrence was red
      const effective: TileColor = color === 'red' && target.toUpperCase().includes(letter) ? 'yellow' : color;
      if (rank[effective] > rank[result[letter] || 'default']) result[letter] = effective;
    });
  }
  return result;
}

export function getDailyWord(targetWords: string[], dateStr?: string): string {
  const date = dateStr || getTodayDateString();
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = (hash << 5) - hash + date.charCodeAt(i);
    hash = hash & hash;
  }
  const index = Math.abs(hash) % targetWords.length;
  return targetWords[index].toUpperCase();
}

export function getRandomWord(targetWords: string[]): string {
  const index = Math.floor(Math.random() * targetWords.length);
  return targetWords[index].toUpperCase();
}

let _validGuessSet: Set<string> | null = null;
let _validGuessList: string[] | null = null;

export function isValidGuess(word: string, validGuesses: string[]): boolean {
  // Cache the Set for performance (rebuild if list changes)
  if (_validGuessList !== validGuesses) {
    _validGuessList = validGuesses;
    _validGuessSet = new Set(validGuesses.map(w => w.toUpperCase()));
  }
  return _validGuessSet!.has(word.toUpperCase());
}

// Daily keeps the original key so existing statistics carry over
const STATS_KEYS: Record<GameMode, string> = {
  daily: 'word500-stats',
  free: 'word500-stats-free',
};

function emptyStatistics(): Statistics {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: new Array(8).fill(0), // max 8 attempts
  };
}

export function loadStatistics(mode: GameMode): Statistics {
  let stats = emptyStatistics();
  const data = localStorage.getItem(STATS_KEYS[mode]);
  if (data) {
    try {
      stats = { ...stats, ...JSON.parse(data) };
    } catch (e) {
      console.error('Failed to parse stats', e);
    }
  }
  // A daily streak breaks when a day was skipped
  if (mode === 'daily' && stats.lastPlayedDate) {
    const today = getTodayDateString();
    const yesterday = getDateString(addDays(new Date(), -1));
    if (stats.lastPlayedDate !== today && stats.lastPlayedDate !== yesterday) {
      stats.currentStreak = 0;
    }
  }
  return stats;
}

export function saveStatistics(mode: GameMode, stats: Statistics): void {
  localStorage.setItem(STATS_KEYS[mode], JSON.stringify(stats));
}

/** puzzleDate: the date of the daily puzzle that was finished (daily mode only) */
export function updateStatistics(
  mode: GameMode,
  won: boolean,
  attempts: number,
  puzzleDate?: string
): Statistics {
  const stats = loadStatistics(mode);
  if (mode === 'daily' && puzzleDate) stats.lastPlayedDate = puzzleDate;
  stats.gamesPlayed++;
  if (won) {
    stats.gamesWon++;
    stats.currentStreak++;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    
    while (stats.guessDistribution.length <= attempts - 1) {
      stats.guessDistribution.push(0);
    }
    stats.guessDistribution[attempts - 1]++;
  } else {
    stats.currentStreak = 0;
  }
  saveStatistics(mode, stats);
  return stats;
}

const DAILY_STATE_PREFIX = 'word500-daily-';

export function loadDailyState(date: string): DailyState | null {
  const data = localStorage.getItem(DAILY_STATE_PREFIX + date);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse daily state', e);
    }
  }
  return null;
}

export function saveDailyState(state: DailyState): void {
  localStorage.setItem(DAILY_STATE_PREFIX + state.date, JSON.stringify(state));
}

const COLORS_PREFIX = 'word500-colors-';

export function loadSavedColors(date: string): SavedColors {
  const data = localStorage.getItem(COLORS_PREFIX + date);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      return { tileColors: parsed.tileColors || {}, keyColors: parsed.keyColors || {} };
    } catch (e) {
      console.error('Failed to parse saved colors', e);
    }
  }
  return { tileColors: {}, keyColors: {} };
}

export function saveColors(date: string, colors: SavedColors): void {
  const empty =
    Object.keys(colors.tileColors).length === 0 && Object.keys(colors.keyColors).length === 0;
  if (empty) localStorage.removeItem(COLORS_PREFIX + date);
  else localStorage.setItem(COLORS_PREFIX + date, JSON.stringify(colors));
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function getTodayDateString(): string {
  return getDateString(new Date());
}

function getDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
