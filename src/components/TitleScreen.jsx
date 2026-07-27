import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../sound';

export default function TitleScreen({ onStartGame, onOpenLeaderboard }) {
  const [activeTab, setActiveTab] = useState('start'); // 'start' | 'hell' | 'leaderboard'
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const bubbleTimerRef = useRef(null);
  const tabs = ['start', 'hell', 'leaderboard'];

  useEffect(() => {
    return () => {
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Tab') {
        e.preventDefault();
        setActiveTab((prev) => {
          const next = tabs[(tabs.indexOf(prev) + 1) % tabs.length];
          sound.playSwoosh();
          return next;
        });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveTab((prev) => {
          const next = tabs[(tabs.indexOf(prev) - 1 + tabs.length) % tabs.length];
          sound.playSwoosh();
          return next;
        });
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (activeTab === 'start') {
          sound.playStart();
          onStartGame('normal');
        } else if (activeTab === 'hell') {
          sound.playStart();
          onStartGame('hell');
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
    }, 3000);
  };

  return (
    <div className="title-screen">
      <div className="title-logo-container">
        {showSpeechBubble && (
          <div className="speech-bubble">
            구구단 20문제를 빠르게 푸는 스피드런 게임! ⚡
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
            sound.playStart();
            onStartGame('normal');
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
          className={`menu-btn hell-btn ${activeTab === 'hell' ? 'active' : 'inactive'}`}
          onClick={() => {
            handleSelectTab('hell');
            sound.playStart();
            onStartGame('hell');
          }}
          onMouseEnter={() => handleSelectTab('hell')}
        >
          <span className="menu-btn-text">🔥 지옥모드 🔥</span>
          {activeTab === 'hell' && (
            <div className="menu-btn-decor hell-decor">
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
        <span>◀ ▶ 화살표 또는 TAB으로 모드를 선택하고 ENTER로 시작하세요</span>
      </div>
    </div>
  );
}
