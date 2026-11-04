import React from 'react';
import type { Statistics, GuessResult } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  statistics: Statistics;
  gameOver: boolean;
  won: boolean;
  guesses: GuessResult[];
  onShare: () => void;
  onNewGame: () => void;
  gameMode: 'daily' | 'free';
}

export const StatsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  statistics,
  gameOver,
  won,
  guesses,
  onShare,
  onNewGame,
  gameMode
}) => {
  if (!isOpen) return null;

  const totalGames = statistics.gamesPlayed || 0;
  const winPercent = totalGames > 0 ? Math.round((statistics.gamesWon / totalGames) * 100) : 0;
  
  const dist = statistics.guessDistribution || new Array(8).fill(0);
  const maxDistribution = Math.max(...dist, 1);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-panel text-fg border border-line rounded-2xl p-5 sm:p-6 max-w-sm w-full animate-slide-up shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <div className="flex-1 text-center">
            <h2 className="text-xl font-black">Statistik</h2>
            <p className="text-[11px] text-fg-muted font-semibold">
              {gameMode === 'daily' ? '📅 Tägliches Rätsel' : '🎲 Freies Spiel'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-control hover:bg-control-hover text-fg-muted hover:text-fg flex items-center justify-center transition-colors font-bold absolute right-6">
            ✕
          </button>
        </div>
        
        {/* 4 Stat Boxes */}
        <div className="grid grid-cols-4 gap-2 text-center mb-6 bg-card p-3 rounded-xl border border-line">
          <div>
            <div className="text-2xl font-black text-fg">{statistics.gamesPlayed}</div>
            <div className="text-[10px] text-fg-muted uppercase tracking-wider font-semibold">Gespielt</div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#48bb78]">{winPercent}%</div>
            <div className="text-[10px] text-fg-muted uppercase tracking-wider font-semibold">Gewonnen</div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#d4b149]">{statistics.currentStreak}</div>
            <div className="text-[10px] text-fg-muted uppercase tracking-wider font-semibold">Akt. Serie</div>
          </div>
          <div>
            <div className="text-2xl font-black text-fg">{statistics.maxStreak}</div>
            <div className="text-[10px] text-fg-muted uppercase tracking-wider font-semibold">Rekord</div>
          </div>
        </div>

        <h3 className="text-xs font-bold text-fg-muted uppercase tracking-wider mb-2">Versuchsverteilung</h3>
        <div className="space-y-1.5 mb-6 bg-card p-3 rounded-xl border border-line">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(attempt => {
            const count = dist[attempt - 1] || 0;
            const isWinningAttempt = won && guesses.length === attempt;
            const width = maxDistribution > 0 ? Math.max((count / maxDistribution) * 100, 7) : 7;
            
            return (
              <div key={attempt} className="flex items-center text-xs">
                <div className="w-4 font-bold text-fg-muted pr-1 text-right">{attempt}</div>
                <div className="flex-1 bg-sunken rounded-md overflow-hidden">
                  <div 
                    className={`text-right px-2 py-0.5 font-bold rounded-md transition-all duration-300 ${
                      isWinningAttempt ? 'bg-[#48bb78] text-white' : count > 0 ? 'bg-bar text-fg' : 'bg-transparent text-fg-faint'
                    }`}
                    style={{ width: `${width}%` }}
                  >
                    {count}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {gameOver && (
          <div className="flex flex-col gap-2.5">
            <button 
              onClick={onShare}
              className="w-full flex items-center justify-center gap-2 bg-[#48bb78] hover:bg-[#3ea76b] text-white font-black py-2.5 rounded-xl transition-all shadow-md active:scale-98"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Ergebnis teilen
            </button>
            
            {gameMode === 'free' && (
              <button 
                onClick={() => {
                  onNewGame();
                  onClose();
                }}
                className="w-full bg-control border border-line hover:bg-control-hover text-fg font-bold py-2.5 rounded-xl transition-all"
              >
                Neues Spiel starten
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
