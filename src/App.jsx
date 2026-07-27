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

  const handleStartGame = () => {
    setGameResult(null);
    setCurrentScreen('game');
  };

  const handleGameOver = (resultData) => {
    setGameResult(resultData);
    setCurrentScreen('result');
  };

  const handleOpenLeaderboard = () => {
    setCurrentScreen('leaderboard');
  };

  const handleBackToMain = () => {
    setCurrentScreen('title');
  };

  return (
    <div className={`app-container screen-${currentScreen}`}>
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
      <BackgroundSpeedLines speed={currentScreen === 'game' ? 'fast' : 'normal'} />

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
            onGameOver={handleGameOver}
            onQuit={handleBackToMain}
          />
        )}

        {currentScreen === 'result' && gameResult && (
          <ResultScreen
            result={gameResult}
            onOpenLeaderboard={handleOpenLeaderboard}
            onBackToMain={handleBackToMain}
          />
        )}

        {currentScreen === 'leaderboard' && (
          <LeaderboardScreen
            onStartGame={handleStartGame}
            onBackToMain={handleBackToMain}
          />
        )}
      </main>
    </div>
  );
}
