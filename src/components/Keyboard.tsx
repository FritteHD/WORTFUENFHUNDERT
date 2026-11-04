import React from 'react';
import type { TileColor } from '../types';

interface Props {
  onKey: (key: string) => void;
  usedLetters: Set<string>;
  keyColors?: Record<string, TileColor>;
  onKeyColorCycle?: (letter: string) => void;
  onClearColors?: () => void;
  onOpenHelp?: () => void;
  /** Game over: manual colors can no longer be changed */
  colorsLocked?: boolean;
}

export const Keyboard: React.FC<Props> = ({
  onKey,
  usedLetters,
  keyColors = {},
  onKeyColorCycle,
  onClearColors,
  onOpenHelp,
  colorsLocked = false,
}) => {
  const row1 = ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P'];
  const row2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  const row3 = ['Y', 'X', 'C', 'V', 'B', 'N', 'M'];

  const getKeyBg = (key: string) => {
    const customColor = keyColors[key];
    if (customColor === 'red') return 'bg-[#dc4d47] text-white';
    if (customColor === 'yellow') return 'bg-[#d4b149] text-white';
    if (customColor === 'green') return 'bg-[#48bb78] text-white';

    const isUsed = usedLetters.has(key);
    if (isUsed) {
      return 'bg-key-used text-fg/50';
    }
    return 'bg-key text-fg hover:bg-key-hover';
  };

  return (
    <div className="game-keyboard w-full max-w-md mx-auto bg-panel border border-line rounded-2xl p-2 sm:p-3 shadow-lg select-none">
      {/* Row 1 */}
      <div className="flex justify-center gap-1 sm:gap-1.5 w-full mb-1.5 touch-manipulation">
        {row1.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onKey(key)}
            onContextMenu={(e) => {
              e.preventDefault();
              onKeyColorCycle?.(key);
            }}
            className={`
              flex-1 h-11 sm:h-12 rounded-lg font-bold text-xs sm:text-base
              flex items-center justify-center transition-all duration-100 active:scale-95
              shadow-xs cursor-pointer ${getKeyBg(key)}
            `}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Row 2 */}
      <div className="flex justify-center gap-1 sm:gap-1.5 w-full mb-1.5 touch-manipulation">
        {row2.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onKey(key)}
            onContextMenu={(e) => {
              e.preventDefault();
              onKeyColorCycle?.(key);
            }}
            className={`
              flex-1 h-11 sm:h-12 rounded-lg font-bold text-xs sm:text-base
              flex items-center justify-center transition-all duration-100 active:scale-95
              shadow-xs cursor-pointer ${getKeyBg(key)}
            `}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Row 3 */}
      <div className="flex justify-center gap-1 sm:gap-1.5 w-full mb-1.5 touch-manipulation">
        {row3.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onKey(key)}
            onContextMenu={(e) => {
              e.preventDefault();
              onKeyColorCycle?.(key);
            }}
            className={`
              flex-1 h-11 sm:h-12 rounded-lg font-bold text-xs sm:text-base
              flex items-center justify-center transition-all duration-100 active:scale-95
              shadow-xs cursor-pointer ${getKeyBg(key)}
            `}
          >
            {key}
          </button>
        ))}

        {/* Backspace Key */}
        <button
          type="button"
          onClick={() => onKey('BACKSPACE')}
          className="px-3 h-11 sm:h-12 bg-key hover:bg-key-hover text-fg rounded-lg flex items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer"
          title="Löschen"
          aria-label="Löschen"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z"/>
          </svg>
        </button>
      </div>

      {/* Row 4: Controls matching the reference image */}
      <div className="flex justify-between gap-1.5 sm:gap-2 w-full touch-manipulation">
        {/* Eraser button (clears manual colors) */}
        <button
          type="button"
          onClick={onClearColors}
          className={`w-12 sm:w-14 h-11 sm:h-12 bg-control hover:bg-control-hover text-fg/80 hover:text-fg rounded-lg flex items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer ${
            colorsLocked ? 'opacity-40' : ''
          }`}
          title={colorsLocked ? 'Spiel beendet – Farben sind fest' : 'Farbmarkierungen zurücksetzen'}
          aria-label="Farben löschen"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/>
            <path d="M22 21H7"/>
            <path d="m5 11 9 9"/>
          </svg>
        </button>

        {/* Hint / Help button */}
        <button
          type="button"
          onClick={onOpenHelp}
          className="w-12 sm:w-14 h-11 sm:h-12 bg-control hover:bg-control-hover text-fg/80 hover:text-fg rounded-lg flex items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer"
          title="Hilfe / Regeln"
          aria-label="Hilfe"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
            <path d="M9 18h6"/>
            <path d="M10 22h4"/>
          </svg>
        </button>

        {/* SPACE bar */}
        <button
          type="button"
          onClick={() => onKey('SPACE')}
          className="flex-1 h-11 sm:h-12 bg-control hover:bg-control-hover text-fg/70 hover:text-fg rounded-lg font-bold text-xs sm:text-sm tracking-widest flex items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer"
          title="Platzhalter (–) einfügen"
          aria-label="Platzhalter einfügen"
        >
          SPACE –
        </button>

        {/* Checkmark (ENTER / Submit) button */}
        <button
          type="button"
          onClick={() => onKey('ENTER')}
          className="w-14 sm:w-16 h-11 sm:h-12 bg-enter hover:bg-enter-hover text-[#48bb78] hover:text-[#68d391] rounded-lg flex items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer font-black"
          title="Wort abschicken (Enter)"
          aria-label="Bestätigen"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </button>
      </div>
    </div>
  );
};
