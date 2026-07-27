import React from 'react';
import { sound } from '../sound';

export default function ResultScreen({ result, onOpenLeaderboard }) {
  React.useEffect(() => {
    sound.playStart();
  }, []);

  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    const mili = String(ms % 1000).padStart(3, '0');
    return `${m}:${s}:${mili}`;
  };

  return (
    <div className="result-screen">
      <div className="result-header">
        <h1 className="result-title">MISSION CLEAR!</h1>
      </div>

      <div className="result-card">
        <div className="time-display">
          <span className="time-label">최종 기록</span>
          <span className="time-value">{formatTime(result.totalMs)}</span>
        </div>

        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-num correct">{result.correct}</span>
            <span className="stat-desc">정답 개수</span>
          </div>
          <div className="stat-box">
            <span className="stat-num wrong">{result.wrong}</span>
            <span className="stat-desc">오답 개수</span>
          </div>
          <div className="stat-box">
            <span className="stat-num penalty">+{result.penalties / 1000}s</span>
            <span className="stat-desc">패널티 시간</span>
          </div>
        </div>

        <div className="result-actions">
          <button
            className="next-btn"
            onClick={() => {
              sound.playType();
              onOpenLeaderboard();
            }}
            autoFocus
          >
            다음 &#10142;
          </button>
        </div>
      </div>
    </div>
  );
}
