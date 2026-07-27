import React, { useState } from 'react';
import { sound } from '../sound';

export default function ResultScreen({ result, onOpenLeaderboard, onBackToMain }) {
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    const mili = String(ms % 1000).padStart(3, '0');
    return `${m}:${s}:${mili}`;
  };

  const handleSubmitScore = async (e) => {
    e && e.preventDefault();
    if (!playerName.trim() || isSubmitting || submitted) return;

    sound.playType();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_names: playerName.trim().slice(0, 15),
          score: result.totalMs,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '등록에 실패했습니다');
      }

      if (data.inserted === false) {
        setErrorMsg('아쉽게도 Top 20 기록에 미치지 못하여 DB에 저장되지 않았습니다!');
        sound.playWrong();
        return;
      }

      setSubmitted(true);
      sound.playCorrect();
      setTimeout(() => {
        onOpenLeaderboard();
      }, 600);
    } catch (err) {
      console.error(err);
      setErrorMsg('순위 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="result-screen">
      <div className="result-header">
        <h1 className="result-title">MISSION CLEAR!</h1>
        <p className="result-subtitle">20문제 구구단 스피드런 완료</p>
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

        <form className="register-form" onSubmit={handleSubmitScore}>
          <div className="input-group">
            <input
              type="text"
              className="name-input"
              placeholder="플레이어 이름 (최대 15자)"
              value={playerName}
              maxLength={15}
              onChange={(e) => {
                setPlayerName(e.target.value);
                sound.playType();
              }}
              disabled={isSubmitting || submitted}
              autoFocus
            />
            <button
              type="submit"
              className={`submit-btn ${!playerName.trim() ? 'disabled' : ''}`}
              disabled={!playerName.trim() || isSubmitting || submitted}
            >
              {isSubmitting ? '등록 중...' : submitted ? '등록 완료!' : '순위표에 등록'}
            </button>
          </div>
          {errorMsg && <p className="error-text">{errorMsg}</p>}
        </form>

        <div className="result-actions">
          <button
            className="secondary-btn"
            onClick={() => {
              sound.playType();
              onOpenLeaderboard();
            }}
          >
            순위표 바로보기
          </button>
          <button
            className="secondary-btn"
            onClick={() => {
              sound.playType();
              onBackToMain();
            }}
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
