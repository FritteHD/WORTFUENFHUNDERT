import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-panel text-fg border border-line rounded-2xl p-5 sm:p-6 max-w-sm w-full animate-slide-up shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md overflow-hidden grid grid-cols-2 grid-rows-2 text-[8px] font-black leading-none text-white">
              <div className="bg-[#48bb78] flex items-center justify-center">W</div>
              <div className="bg-[#48bb78] flex items-center justify-center">5</div>
              <div className="bg-[#d4b149] flex items-center justify-center">0</div>
              <div className="bg-[#dc4d47] flex items-center justify-center">0</div>
            </div>
            <h2 className="text-xl font-black">Spielanleitung</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-control hover:bg-control-hover text-fg-muted hover:text-fg flex items-center justify-center transition-colors font-bold"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-fg-soft mb-3 leading-relaxed">
          Errate das geheime deutsche 5-Buchstaben-Wort in maximal <span className="font-bold text-fg">8 Versuchen</span>.
        </p>

        <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">
          Auswertung pro Zeile
        </p>

        {/* 3 Indicators explanation */}
        <div className="space-y-2 mb-4 bg-card p-3 rounded-xl border border-line">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-[#48bb78] flex-shrink-0 flex items-center justify-center text-white font-black text-sm shadow-xs">
              ✓
            </div>
            <p className="text-xs text-fg-soft">
              <strong className="text-[#48bb78]">Grün:</strong> Richtige Buchstaben an der exakt <span className="underline">richtigen Position</span>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-[#d4b149] flex-shrink-0 flex items-center justify-center text-white font-black text-sm shadow-xs">
              ?
            </div>
            <p className="text-xs text-fg-soft">
              <strong className="text-[#d4b149]">Gelb:</strong> Richtige Buchstaben, aber an der <span className="underline">falschen Position</span>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-[#dc4d47] flex-shrink-0 flex items-center justify-center text-white font-black text-sm shadow-xs">
              ✗
            </div>
            <p className="text-xs text-fg-soft">
              <strong className="text-[#dc4d47]">Rot:</strong> Buchstaben, die <span className="underline">gar nicht</span> im Zielwort vorkommen.
            </p>
          </div>
        </div>

        {/* Manual coloring tip */}
        <div className="mb-4 bg-card p-3 rounded-xl border border-line">
          <p className="text-xs font-bold text-fg mb-1 flex items-center gap-1.5">
            <span>🎨</span> Buchstaben per Hand einfärben:
          </p>
          <p className="text-xs text-fg-soft leading-relaxed">
            Klicke auf einen Buchstaben im Spielfeld, um seine Farbe anzupassen:
          </p>
          <div className="flex items-center justify-between text-xs mt-2 px-1 py-1 bg-sunken rounded-lg">
            <span className="text-fg-muted">Grau</span>
            <span className="text-fg-faint">➜</span>
            <span className="text-[#dc4d47] font-bold">Rot</span>
            <span className="text-fg-faint">➜</span>
            <span className="text-[#d4b149] font-bold">Gelb</span>
            <span className="text-fg-faint">➜</span>
            <span className="text-[#48bb78] font-bold">Grün</span>
            <span className="text-fg-faint">➜</span>
            <span className="text-fg-muted">Grau</span>
          </div>
          <p className="text-[11px] text-fg-muted mt-1.5">
            Tipp: Über das <span className="text-fg font-bold">🧹 Radierer-Symbol</span> kannst du alle Markierungen wieder zurücksetzen.
          </p>
          <p className="text-[11px] text-fg-muted mt-1.5">
            Mit <span className="text-fg font-bold">SPACE</span> setzt du einen Platzhalter (–), um eine Stelle freizulassen.
            Ist die Zeile voll, füllen weitere Buchstaben die Platzhalter von links auf.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#48bb78] hover:bg-[#3ea76b] text-white font-black py-2.5 rounded-xl transition-all shadow-md active:scale-98"
        >
          Alles klar!
        </button>
      </div>
    </div>
  );
};
