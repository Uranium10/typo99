import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../sound';

export default function TitleScreen({ onStartGame, onOpenLeaderboard }) {
  const [activeTab, setActiveTab] = useState('start'); // 'start' or 'leaderboard'
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const bubbleTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Tab') {
        e.preventDefault();
        setActiveTab((prev) => {
          const next = prev === 'start' ? 'leaderboard' : 'start';
          sound.playSwoosh();
          return next;
        });
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (activeTab === 'start') {
          sound.playType();
          onStartGame();
        } else {
          sound.playType();
          onOpenLeaderboard();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, onStartGame, onOpenLeaderboard]);

  const handleSelectTab = (tab) => {
    if (activeTab !== tab) {
      sound.playSwoosh();
      setActiveTab(tab);
    }
  };

  const handleLogoClick = () => {
    sound.playType();
    setShowSpeechBubble(true);
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = setTimeout(() => {
      setShowSpeechBubble(false);
    }, 3200);
  };

  return (
    <div className="title-screen">
      <div className="title-logo-container">
        {showSpeechBubble && (
          <div className="speech-bubble">
            극강의 구구단 스피드런! 20개의 문제를 밀리초(MS) 단위로 돌파하라. ⚡
          </div>
        )}
        {/* Decorative background stripes for the logo */}
        <div className="logo-line logo-line-top-1" />
        <div className="logo-line logo-line-top-2" />
        <div className="logo-box" onClick={handleLogoClick} title="클릭해보세요!">
          <h1 className="logo-text">타이포99</h1>
        </div>
        <div className="logo-line logo-line-bot-1" />
        <div className="logo-line logo-line-bot-2" />
      </div>

      <div className="menu-container">
        <button
          className={`menu-btn ${activeTab === 'start' ? 'active' : 'inactive'}`}
          onClick={() => {
            handleSelectTab('start');
            sound.playType();
            onStartGame();
          }}
          onMouseEnter={() => handleSelectTab('start')}
        >
          <span className="menu-btn-text">시작하기</span>
          {activeTab === 'start' && (
            <div className="menu-btn-decor">
              <span className="decor-strip strip-1" />
              <span className="decor-strip strip-2" />
            </div>
          )}
        </button>

        <button
          className={`menu-btn ${activeTab === 'leaderboard' ? 'active' : 'inactive'}`}
          onClick={() => {
            handleSelectTab('leaderboard');
            sound.playType();
            onOpenLeaderboard();
          }}
          onMouseEnter={() => handleSelectTab('leaderboard')}
        >
          <span className="menu-btn-text">순위표</span>
          {activeTab === 'leaderboard' && (
            <div className="menu-btn-decor">
              <span className="decor-strip strip-1" />
              <span className="decor-strip strip-2" />
            </div>
          )}
        </button>
      </div>

      <div className="title-footer-hint">
        <span>◀ ▶ 키보드 화살표로 선택하고 ENTER로 시작하세요</span>
      </div>
    </div>
  );
}
