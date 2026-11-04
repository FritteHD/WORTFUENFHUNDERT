import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  gameMode: 'daily' | 'free';
  onChangeGameMode: (mode: 'daily' | 'free') => void;
  onNewGame?: () => void;
}

export const SettingsModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  darkMode, 
  onToggleDarkMode,
  gameMode,
  onChangeGameMode,
  onNewGame
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-panel text-fg border border-line rounded-2xl p-5 sm:p-6 max-w-sm w-full animate-slide-up shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-center flex-1">Einstellungen</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-control hover:bg-control-hover text-fg-muted hover:text-fg flex items-center justify-center transition-colors font-bold absolute right-6">
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-card p-3 rounded-xl border border-line">
            <span className="text-sm font-semibold text-fg-soft">Dunkler Modus</span>
            <button 
              onClick={onToggleDarkMode}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${darkMode ? 'bg-[#48bb78]' : 'bg-control-hover'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="bg-card p-3 rounded-xl border border-line">
            <span className="text-xs font-bold text-fg-muted uppercase tracking-wider block mb-2">Spielmodus</span>
            <div className="flex gap-2">
              <button 
                onClick={() => onChangeGameMode('daily')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  gameMode === 'daily'
                    ? 'bg-[#48bb78] text-white shadow-xs'
                    : 'bg-sunken text-fg-muted hover:text-fg border border-line'
                }`}
              >
                📅 Tägliches Rätsel
              </button>
              <button 
                onClick={() => onChangeGameMode('free')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  gameMode === 'free'
                    ? 'bg-[#dc4d47] text-white shadow-xs'
                    : 'bg-sunken text-fg-muted hover:text-fg border border-line'
                }`}
              >
                🎲 Freies Spiel
              </button>
            </div>
          </div>
        </div>

        <div className="h-px bg-line my-5"></div>

        {gameMode === 'free' && (
          <button 
            onClick={() => {
              if (onNewGame) onNewGame();
              onClose();
            }}
            className="w-full bg-control border border-line hover:bg-control-hover text-fg font-bold py-2.5 rounded-xl transition-all"
          >
            Neues Spiel starten
          </button>
        )}
      </div>
    </div>
  );
};
