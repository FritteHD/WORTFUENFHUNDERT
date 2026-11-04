import React from 'react';

interface Props {
  won: boolean;
  targetWord: string;
  attempts: number;
  onShowStats: () => void;
}

export const GameOverBanner: React.FC<Props> = ({ won, targetWord, attempts, onShowStats }) => {
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-panel rounded-2xl border border-line animate-slide-up mb-2 shadow-xl text-center max-w-sm w-full mx-auto select-none">
      {won ? (
        <p className="text-lg font-black text-[#48bb78] mb-2">
          🎉 Gelöst in {attempts} Versuch{attempts > 1 ? 'en' : ''}!
        </p>
      ) : (
        <div className="mb-2">
          <p className="text-xs text-fg-muted uppercase tracking-wider mb-0.5">Leider nicht erraten</p>
          <p className="text-lg font-black text-[#dc4d47]">
            Das Wort war: <span className="underline tracking-widest">{targetWord}</span>
          </p>
        </div>
      )}
      <button 
        onClick={onShowStats}
        className="px-5 py-1.5 bg-[#48bb78] hover:bg-[#3ea76b] text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-95"
      >
        Statistik anzeigen 📊
      </button>
    </div>
  );
};
