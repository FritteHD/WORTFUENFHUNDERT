import { useState, useEffect } from 'react';
import { GameBoard } from './components/GameBoard';
import { GameOverBanner } from './components/GameOverBanner';
import { Header } from './components/Header';
import { HelpModal } from './components/HelpModal';
import { Keyboard } from './components/Keyboard';
import { SettingsModal } from './components/SettingsModal';
import { StatsModal } from './components/StatsModal';
import { Toast } from './components/Toast';
import { EasterEggVideo } from './components/EasterEggVideo';
import { useGame } from './hooks/useGame';

const THEME_KEY = 'word500-theme';

async function fetchJson(url: string): Promise<string[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error(`${url}: leere oder ungültige Liste`);
  return data;
}

function App() {
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [validGuesses, setValidGuesses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem(THEME_KEY) !== 'light');

  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Load word lists
  useEffect(() => {
    Promise.all([fetchJson(`${import.meta.env.BASE_URL}target_words.json`),
      fetchJson(`${import.meta.env.BASE_URL}valid_guesses.json`),])
      .then(([targets, guesses]) => {
        setTargetWords(targets);
        setValidGuesses(guesses);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load word lists', err);
        setLoadError(true);
      });
  }, []);

  // Apply and remember the chosen theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', darkMode ? '#121214' : '#f2f2f5');
  }, [darkMode]);

  const game = useGame(targetWords, validGuesses);

  // Show stats automatically after game over (after the win animation, if one is running)
  const { gameStatus, solveAnimationMs } = game;
  useEffect(() => {
    if (gameStatus !== 'playing') {
      const timer = setTimeout(() => setShowStats(true), Math.max(1500, solveAnimationMs + 1000));
      return () => clearTimeout(timer);
    }
  }, [gameStatus, solveAnimationMs]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <div className="text-center">
          {/* Logo */}
          <div className="w-12 h-12 rounded-xl overflow-hidden grid grid-cols-2 grid-rows-2 text-sm font-black leading-none text-white shadow-lg mx-auto mb-4">
            <div className="bg-[#48bb78] flex items-center justify-center">W</div>
            <div className="bg-[#48bb78] flex items-center justify-center">5</div>
            <div className="bg-[#d4b149] flex items-center justify-center">0</div>
            <div className="bg-[#dc4d47] flex items-center justify-center">0</div>
          </div>
          <div className="text-2xl font-black text-fg tracking-widest mb-2">WORT500</div>
          {loadError ? (
            <>
              <div className="text-sm text-[#dc4d47] font-semibold mb-3">
                Das Wörterbuch konnte nicht geladen werden.
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2 bg-[#48bb78] hover:bg-[#3ea76b] text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-95"
              >
                Neu laden
              </button>
            </>
          ) : (
            <>
              <div className="text-sm text-fg-muted">Deutsches Wörterbuch wird geladen...</div>
              <div className="mt-4 w-8 h-8 border-3 border-[#48bb78] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-app min-h-screen flex flex-col bg-app text-fg p-2 sm:p-4 select-none">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-between">
        {/* Header */}
        <Header
          onHelp={() => setShowHelp(true)}
          onSettings={() => setShowSettings(true)}
          onStats={() => setShowStats(true)}
          gameMode={game.gameMode}
          onChangeGameMode={game.setGameMode}
        />

        {/* Game Board with 8 rows and manual coloring */}
        <main className="mobile-game-area flex-1 flex flex-col items-center justify-center my-1 sm:my-2 w-full">
          <GameBoard
            guesses={game.guesses}
            currentGuess={game.currentGuess}
            currentRow={game.guesses.length}
            maxAttempts={game.maxAttempts}
            shakeRow={game.shakeRow}
            revealRow={game.revealRow}
            tileColors={game.tileColors}
            flipTiles={game.flipTiles}
            locked={game.colorsLocked}
            onTileClick={game.cycleTileColor}
          />
        </main>

        {/* Game Over Banner */}
        {game.gameStatus !== 'playing' && (
          <GameOverBanner
            won={game.gameStatus === 'won'}
            targetWord={game.targetWord}
            attempts={game.guesses.length}
            onShowStats={() => setShowStats(true)}
          />
        )}

        {/* Keyboard matching screenshot layout */}
        <footer className="mobile-keyboard w-full mt-1">
          <Keyboard
            onKey={game.handleKey}
            usedLetters={game.usedLetters}
            keyColors={game.keyColors}
            onKeyColorCycle={game.cycleKeyColor}
            onClearColors={game.clearColors}
            onOpenHelp={() => setShowHelp(true)}
            colorsLocked={game.colorsLocked}
          />
        </footer>
      </div>

      {/* Toast Notification */}
      <Toast message={game.toastMessage} visible={game.toastVisible} />

      {/* Easter egg: guessing BOXEN */}
      {/* Mounted only while open so each showing starts fresh */}
      {game.easterEggOpen && <EasterEggVideo isOpen onClose={game.closeEasterEgg} />}

      {/* Modals */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        gameMode={game.gameMode}
        onChangeGameMode={game.setGameMode}
        onNewGame={game.startNewGame}
      />
      <StatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        statistics={game.statistics}
        gameOver={game.gameStatus !== 'playing'}
        won={game.gameStatus === 'won'}
        guesses={game.guesses}
        onShare={game.shareResult}
        onNewGame={game.startNewGame}
        gameMode={game.gameMode}
      />
    </div>
  );
}

export default App;
