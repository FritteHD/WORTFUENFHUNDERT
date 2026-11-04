import React, { useEffect, useRef, useState } from 'react';

interface HeaderProps {
  onHelp: () => void;
  onSettings: () => void;
  onStats: () => void;
  gameMode: 'daily' | 'free';
  onChangeGameMode: (mode: 'daily' | 'free') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onHelp,
  onSettings,
  onStats,
  gameMode,
  onChangeGameMode,
}) => {
  const [showModeMenu, setShowModeMenu] = useState(false);
  const modeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeModeMenu = (event: PointerEvent) => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(event.target as Node)) {
        setShowModeMenu(false);
      }
    };

    document.addEventListener('pointerdown', closeModeMenu);
    return () => document.removeEventListener('pointerdown', closeModeMenu);
  }, []);

  return (
    <header className="w-full max-w-md mx-auto mb-2 sm:mb-4">
      <div className="bg-panel border border-line rounded-2xl px-3 sm:px-4 py-2.5 flex items-center justify-between shadow-md">
        {/* Left: Logo */}
        <div className="flex items-center gap-2.5 select-none cursor-pointer" onClick={onHelp} title="WORT500 Anleitung">
          {/* 2x2 Logo Grid */}
          <div className="w-8 h-8 rounded-lg overflow-hidden grid grid-cols-2 grid-rows-2 text-[11px] font-black leading-none text-white shadow-xs">
            <div className="bg-[#48bb78] flex items-center justify-center">W</div>
            <div className="bg-[#48bb78] flex items-center justify-center">5</div>
            <div className="bg-[#d4b149] flex items-center justify-center">0</div>
            <div className="bg-[#dc4d47] flex items-center justify-center">0</div>
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-wider text-fg">
            WORT500
          </span>
        </div>

        {/* Right: Actions matching screenshot */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-control p-1 rounded-xl border border-line">
          {/* Calendar Button (mode selection) */}
          <div ref={modeMenuRef} className="relative">
          <button
            onClick={() => setShowModeMenu((open) => !open)}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all ${
              gameMode === 'daily'
                ? 'bg-[#48bb78] text-white shadow-xs scale-102'
                : 'bg-[#dc4d47] text-white shadow-xs scale-102'
            }`}
            title="Spielmodus auswählen"
            aria-label="Spielmodus auswählen"
            aria-expanded={showModeMenu}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <circle cx="12" cy="15" r="1.5" fill="currentColor"/>
            </svg>
          </button>
          {showModeMenu && (
            <div className="absolute right-0 top-11 z-30 w-44 rounded-xl border border-line bg-panel p-1.5 shadow-xl">
              <button
                onClick={() => {
                  onChangeGameMode('daily');
                  setShowModeMenu(false);
                }}
                className={`w-full rounded-lg px-3 py-2 text-left text-xs font-bold transition-colors ${
                  gameMode === 'daily' ? 'bg-[#48bb78] text-white' : 'text-fg-soft hover:bg-control-hover hover:text-fg'
                }`}
              >
                Daily Rätsel
              </button>
              <button
                onClick={() => {
                  onChangeGameMode('free');
                  setShowModeMenu(false);
                }}
                className={`w-full rounded-lg px-3 py-2 text-left text-xs font-bold transition-colors ${
                  gameMode === 'free' ? 'bg-[#dc4d47] text-white' : 'text-fg-soft hover:bg-control-hover hover:text-fg'
                }`}
              >
                Freies Spiel
              </button>
            </div>
          )}
          </div>

          {/* Stats / Leaderboard Button */}
          <button
            onClick={onStats}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-fg-muted hover:text-fg hover:bg-control-hover transition-colors"
            title="Statistiken"
            aria-label="Statistiken"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </button>

          {/* Help Button */}
          <button
            onClick={onHelp}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-fg-muted hover:text-fg hover:bg-control-hover transition-colors font-bold text-sm"
            title="Spielanleitung"
            aria-label="Spielanleitung"
          >
            ?
          </button>

          {/* Settings Button */}
          <button
            onClick={onSettings}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-fg-muted hover:text-fg hover:bg-control-hover transition-colors"
            title="Einstellungen"
            aria-label="Einstellungen"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
