import React from 'react';
import type { GuessResult, TileColor } from '../types';
import { PLACEHOLDER } from '../hooks/useGame';

interface Props {
  guesses: GuessResult[];
  currentGuess: string;
  currentRow: number;
  maxAttempts: number;
  shakeRow: number | null;
  revealRow: number | null;
  tileColors: Record<string, TileColor>;
  flipTiles?: Set<string>;
  /** Game over: tiles can no longer be recolored */
  locked?: boolean;
  onTileClick: (rowIndex: number, colIndex: number) => void;
}

export const GameBoard: React.FC<Props> = ({
  guesses,
  currentGuess,
  currentRow,
  maxAttempts,
  shakeRow,
  revealRow,
  tileColors,
  flipTiles,
  locked = false,
  onTileClick,
}) => {
  const getTileStyle = (rowIndex: number, colIndex: number, hasLetter: boolean) => {
    const key = `${rowIndex}-${colIndex}`;
    const color = tileColors[key] || 'default';

    switch (color) {
      case 'red':
        return 'bg-[#dc4d47] text-white border-2 border-[#ff6b65]/40 shadow-xs';
      case 'yellow':
        return 'bg-[#d4b149] text-white border-2 border-[#fae075]/40 shadow-xs';
      case 'green':
        return 'bg-[#48bb78] text-white border-2 border-[#6ee7b7]/40 shadow-xs';
      case 'default':
      default:
        return hasLetter
          ? 'bg-key text-fg border-2 border-transparent hover:border-line-strong'
          : 'bg-tile text-fg/90 border-2 border-transparent';
    }
  };

  const rows = Array.from({ length: maxAttempts });

  return (
    <div className="game-board flex flex-col items-center justify-center gap-1.5 sm:gap-2 w-full max-w-sm sm:max-w-md mx-auto select-none my-1">
      {rows.map((_, rowIndex) => {
        const isSubmitted = rowIndex < guesses.length;
        const isCurrent = rowIndex === currentRow && currentRow < maxAttempts;
        const isShaking = shakeRow === rowIndex;
        const isRevealing = revealRow === rowIndex;

        const guess = isSubmitted ? guesses[rowIndex] : null;
        const word = guess ? guess.word : isCurrent ? currentGuess : '';

        return (
          <div
            key={rowIndex}
            className={`flex items-center gap-1.5 sm:gap-2 w-full justify-center ${
              isShaking ? 'animate-shake' : ''
            }`}
          >
            {/* 5 Letter Tiles */}
            <div className="flex gap-1.5 sm:gap-2">
              {Array.from({ length: 5 }).map((_, colIndex) => {
                const letter = word[colIndex] || '';
                const isPlaceholder = letter === PLACEHOLDER;
                const hasLetter = letter.length > 0;
                const isClickable =
                  !locked && (isSubmitted || (isCurrent && hasLetter && !isPlaceholder));

                return (
                  <button
                    key={colIndex}
                    type="button"
                    disabled={!isClickable}
                    onClick={() => onTileClick(rowIndex, colIndex)}
                    className={`
                      game-tile w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center
                      font-black text-lg sm:text-2xl uppercase transition-all duration-150
                      ${getTileStyle(rowIndex, colIndex, hasLetter)}
                      ${isClickable ? 'cursor-pointer active:scale-95' : 'cursor-default'}
                      ${isCurrent && hasLetter ? 'animate-pop' : ''}
                      ${flipTiles?.has(`${rowIndex}-${colIndex}`) ? 'animate-flip-in' : ''}
                    `}
                    title={
                      isClickable
                        ? 'Klicken, um Farbe zu wechseln (Grau -> Rot -> Gelb -> Grün)'
                        : undefined
                    }
                  >
                    {isPlaceholder ? <span className="text-fg-faint">–</span> : letter}
                  </button>
                );
              })}
            </div>

            {/* Spacer separating letters from score columns */}
            <div className="w-1 sm:w-2" />

            {/* 3 Score Indicator Tiles: Green, Yellow, Red */}
            <div
              className={`flex gap-1.5 sm:gap-2 ${
                isRevealing ? 'animate-reveal' : ''
              }`}
            >
              {/* Green Score Square */}
              <div
                className="score-tile w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-black text-lg sm:text-2xl text-white bg-[#48bb78] shadow-xs"
                title="Richtige Position (Grün)"
              >
                {isSubmitted ? guess?.green : ''}
              </div>

              {/* Yellow Score Square */}
              <div
                className="score-tile w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-black text-lg sm:text-2xl text-white bg-[#d4b149] shadow-xs"
                title="Falsche Position (Gelb)"
              >
                {isSubmitted ? guess?.yellow : ''}
              </div>

              {/* Red Score Square */}
              <div
                className="score-tile w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-black text-lg sm:text-2xl text-white bg-[#dc4d47] shadow-xs"
                title="Nicht im Wort (Rot)"
              >
                {isSubmitted ? guess?.red : ''}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
