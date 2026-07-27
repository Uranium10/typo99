import React, { useState } from 'react';
import './App.css';
import BackgroundSpeedLines from './components/BackgroundSpeedLines';
import TitleScreen from './components/TitleScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import LeaderboardScreen from './components/LeaderboardScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('title'); // 'title' | 'game' | 'result' | 'leaderboard'
  const [gameResult, setGameResult] = useState(null);
  const [gameMode, setGameMode] = useState('normal'); // 'normal' | 'hell'

  const handleStartGame = (mode = 'normal') => {
    const targetMode = typeof mode === 'string' ? mode : (gameResult?.mode || gameMode || 'normal');
    setGameMode(targetMode);
    setGameResult(null);
    setCurrentScreen('game');
  };

  const handleGameOver = (resultData) => {
    setGameResult({ ...resultData, mode: gameMode });
    setCurrentScreen('result');
  };

  const handleOpenLeaderboard = () => {
    setCurrentScreen('leaderboard');
  };

  const handleBackToMain = () => {
    setGameResult(null);
    setCurrentScreen('title');
  };

  return (
    <div className={`app-container screen-${currentScreen} mode-${gameMode}`}>
      {/* Inline SVG filters for Motion Blur */}
      <svg className="svg-filters" width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <filter id="motion-blur-x" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="35, 0" />
          </filter>
          <filter id="motion-blur-y" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0, 35" />
          </filter>
          <filter id="motion-blur-diagonal" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="25, 12" />
          </filter>
        </defs>
      </svg>

      {/* Dynamic Background Speed Lines */}
      <BackgroundSpeedLines
        speed={currentScreen === 'game' ? 'fast' : 'normal'}
        mode={currentScreen === 'game' ? gameMode : 'normal'}
      />

      {/* Main Content Area */}
      <main className="main-viewport">
        {currentScreen === 'title' && (
          <TitleScreen
            onStartGame={handleStartGame}
            onOpenLeaderboard={handleOpenLeaderboard}
          />
        )}

        {currentScreen === 'game' && (
          <GameScreen
            mode={gameMode}
            onGameOver={handleGameOver}
            onQuit={handleBackToMain}
          />
        )}

        {currentScreen === 'result' && gameResult && (
          <ResultScreen
            result={gameResult}
            onOpenLeaderboard={handleOpenLeaderboard}
          />
        )}

        {currentScreen === 'leaderboard' && (
          <LeaderboardScreen
            result={gameResult}
            onScoreSubmitted={() => setGameResult(null)}
            onStartGame={() => handleStartGame(gameResult?.mode || gameMode || 'normal')}
            onBackToMain={handleBackToMain}
          />
        )}
      </main>
    </div>
  );
}
