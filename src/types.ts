export type GameMode = 'daily' | 'free';
export type GameStatus = 'playing' | 'won' | 'lost';
export type TileColor = 'default' | 'red' | 'yellow' | 'green';

export interface GuessResult {
  word: string;
  green: number;  // exact position matches
  yellow: number; // right letter, wrong position
  red: number;    // letter not in target
}

export interface GameState {
  targetWord: string;
  guesses: GuessResult[];
  currentGuess: string;
  gameStatus: GameStatus;
  maxAttempts: number;
  usedLetters: Set<string>;
}

export interface DailyState {
  date: string; // YYYY-MM-DD
  guesses: GuessResult[];
  gameStatus: GameStatus;
  targetWord: string;
}

export interface Statistics {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[]; // index 0 = won in 1 try, etc.
  lastPlayedDate?: string; // daily mode only: date (YYYY-MM-DD) of the last finished daily puzzle
}

export interface SavedColors {
  tileColors: Record<string, TileColor>;
  keyColors: Record<string, TileColor>;
}
