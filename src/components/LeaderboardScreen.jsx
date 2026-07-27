import React, { useState, useEffect } from 'react';
import { sound } from '../sound';

export default function LeaderboardScreen({ result, onScoreSubmitted, onBackToMain, onStartGame }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [myRank, setMyRank] = useState(null);
  const [myScoreId, setMyScoreId] = useState(null);

  const loadScores = async (isMounted = true) => {
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
        setError('순위표 데이터를 불러올 수 없습니다.');
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    loadScores(isMounted);
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

  const getEstimatedRank = () => {
    if (!result || loading) return 1;
    let rank = 1;
    for (let i = 0; i < scores.length; i++) {
      if (result.totalMs >= scores[i].score) {
        rank = i + 2;
      } else {
        break;
      }
    }
    return rank;
  };

  const estimatedRank = getEstimatedRank();
  const isTop20 = !loading && result && (scores.length < 20 || estimatedRank <= 20);

  const handleSubmitScore = async (e) => {
    e && e.preventDefault();
    if (isSubmitting || submitted) return;

    const finalName = playerName.trim() || 'AAAA';
    sound.playType();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_names: finalName.slice(0, 15),
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

      if (data.rank) setMyRank(data.rank);
      if (data.insertedId) setMyScoreId(data.insertedId);
      setSubmitted(true);
      sound.playCorrect();
      await loadScores(true);
      if (onScoreSubmitted) {
        onScoreSubmitted();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('순위 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDisplayScores = () => {
    if (loading || error) return [];
    if (!result || !isTop20) {
      return scores.map((row) => ({ ...row, isNewBadge: false, isPreview: false }));
    }

    if (submitted) {
      return scores.map((row) => {
        const isMy = (myScoreId && Number(row.id) === Number(myScoreId)) ||
          (!myScoreId && row.score === result.totalMs && row.player_names === (playerName.trim() || 'AAAA'));
        return { ...row, isNewBadge: isMy, isPreview: false };
      });
    }

    const previewItem = {
      id: 'temp-preview-item',
      player_names: playerName.trim() || 'AAAA',
      score: result.totalMs,
      created_at: null,
      isNewBadge: true,
      isPreview: true,
    };

    const combined = [...scores.map(r => ({ ...r, isNewBadge: false, isPreview: false })), previewItem];
    combined.sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      if (a.id === 'temp-preview-item') return -1;
      if (b.id === 'temp-preview-item') return 1;
      return new Date(a.created_at) - new Date(b.created_at);
    });

    return combined.slice(0, 20);
  };

  const displayScores = getDisplayScores();

  return (
    <div className="leaderboard-screen">
      <div className="leaderboard-header">
        <h1 className="leaderboard-title">LEADERBOARD</h1>
      </div>

      {!loading && !error && result && (
        <div className="registration-card">
          {!submitted ? (
            isTop20 ? (
              <>
                <div className="registration-header">
                  <span className="celebration-badge">🎉 랭킹 {estimatedRank}위 달성! 🎉</span>
                  <p className="registration-desc">기록: <strong>{formatTime(result.totalMs)}</strong> — 닉네임을 등록하세요!</p>
                </div>
                <form className="register-form" onSubmit={handleSubmitScore}>
                  <div className="input-group">
                    <input
                      type="text"
                      className="name-input"
                      placeholder="AAAA"
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
                      className="submit-btn"
                      disabled={isSubmitting || submitted}
                    >
                      {isSubmitting ? '등록 중...' : '순위표에 등록'}
                    </button>
                  </div>
                  {errorMsg && <p className="error-text">{errorMsg}</p>}
                </form>
              </>
            ) : (
              <div className="registration-header">
                <span className="not-qualified-badge">기록: {formatTime(result.totalMs)} (랭킹 {estimatedRank}위 — 아쉽게도 Top 20 진입 실패)</span>
              </div>
            )
          ) : (
            <div className="registration-header">
              <span className="celebration-badge">✅ 랭킹 {myRank || estimatedRank}위 등록 완료!</span>
            </div>
          )}
        </div>
      )}

      <div className="leaderboard-container">
        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <p>순위 데이터를 불러오는 중...</p>
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

        {!loading && !error && displayScores.length === 0 && (
          <div className="empty-state">
            <p>아직 등록된 기록이 없습니다. 첫 번째 명예의 전당 주인공이 되어보세요!</p>
          </div>
        )}

        {!loading && !error && displayScores.length > 0 && (
          <div className="table-wrapper">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th className="th-rank">순위</th>
                  <th className="th-name">플레이어</th>
                  <th className="th-score">기록 (MS)</th>
                </tr>
              </thead>
              <tbody>
                {displayScores.map((row, idx) => {
                  const rank = idx + 1;
                  const isTop3 = rank <= 3;
                  const isMyRow = row.isNewBadge;
                  return (
                    <tr key={row.id || idx} className={`rank-row ${isTop3 ? `top-${rank}` : ''} ${isMyRow ? 'my-rank-row' : ''}`}>
                      <td className="td-rank">
                        <span className="rank-badge">{rank}</span>
                      </td>
                      <td className="td-name">
                        <span className="player-name-text">{row.player_names}</span>
                        {isMyRow && <span className="new-badge">NEW!</span>}
                      </td>
                      <td className="td-score">
                        {formatTime(row.score)}
                      </td>
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
            sound.playStart();
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
