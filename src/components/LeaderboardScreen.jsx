import React, { useState, useEffect } from 'react';
import { sound } from '../sound';

export default function LeaderboardScreen({ onBackToMain, onStartGame }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchScores = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/scores');
        if (!res.ok) throw new Error('순위표를 불러오는데 실패했습니다');
        const data = await res.json();
        if (isMounted) {
          setScores(data.scores || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error(err);
          setError('순위표 데이터를 불러올 수 없습니다. (DB 연결 설정을 확인해주세요)');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchScores();
    return () => { isMounted = false; };
  }, []);

  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    const mili = String(ms % 1000).padStart(3, '0');
    return `${m}:${s}:${mili}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="leaderboard-screen">
      <div className="leaderboard-header">
        <h1 className="leaderboard-title">순위표 (LEADERBOARD)</h1>
        <p className="leaderboard-subtitle">TYPO99 20문제 스피드런 명예의 전당</p>
      </div>

      <div className="leaderboard-container">
        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <p>TURSO DB에서 순위 데이터를 불러오는 중...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p className="error-text">{error}</p>
            <button className="retry-btn" onClick={() => window.location.reload()}>
              다시 시도
            </button>
          </div>
        )}

        {!loading && !error && scores.length === 0 && (
          <div className="empty-state">
            <p>아직 등록된 기록이 없습니다. 첫 번째 명예의 전당 주인공이 되어보세요!</p>
          </div>
        )}

        {!loading && !error && scores.length > 0 && (
          <div className="table-wrapper">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th className="th-rank">순위</th>
                  <th className="th-name">플레이어</th>
                  <th className="th-score">기록 (MS)</th>
                  <th className="th-date">달성 일시</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((row, idx) => {
                  const rank = idx + 1;
                  const isTop3 = rank <= 3;
                  return (
                    <tr key={row.id || idx} className={`rank-row ${isTop3 ? `top-${rank}` : ''}`}>
                      <td className="td-rank">
                        <span className="rank-badge">{rank}</span>
                      </td>
                      <td className="td-name">{row.player_names}</td>
                      <td className="td-score">{formatTime(row.score)}</td>
                      <td className="td-date">{formatDate(row.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="leaderboard-footer">
        <button
          className="main-action-btn"
          onClick={() => {
            sound.playType();
            onStartGame();
          }}
        >
          바로 게임 시작하기
        </button>
        <button
          className="back-btn"
          onClick={() => {
            sound.playType();
            onBackToMain();
          }}
        >
          메인 화면으로
        </button>
      </div>
    </div>
  );
}
