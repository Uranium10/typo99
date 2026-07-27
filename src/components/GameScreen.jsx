import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../sound';

function generateProblem(prevProblem) {
  let n1, n2;
  do {
    n1 = Math.floor(Math.random() * 8) + 2; // 2 ~ 9
    n2 = Math.floor(Math.random() * 8) + 2; // 2 ~ 9
  } while (prevProblem && prevProblem.n1 === n1 && prevProblem.n2 === n2);
  return { n1, n2, ans: n1 * n2 };
}

export default function GameScreen({ onGameOver, onQuit }) {
  const [problem, setProblem] = useState(() => generateProblem(null));
  const [inputVal, setInputVal] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  
  // Timer state in ms
  const [elapsedMs, setElapsedMs] = useState(0);
  const [countdown, setCountdown] = useState(3); // 3, 2, 1, 'GO!', null
  
  // Visual effects states
  const [shake, setShake] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [animState, setAnimState] = useState('idle'); // 'idle' | 'out' | 'in'
  const [shatterPieces, setShatterPieces] = useState([]);
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const inputRef = useRef(null);
  const isTransitioningRef = useRef(false);

  // Focus hidden input for mobile/desktop typing
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    const handleGlobalClick = () => {
      if (inputRef.current && isTransitioningRef.current === false) {
        inputRef.current.focus();
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // 3-2-1-GO! Countdown effect before starting game
  useEffect(() => {
    sound.playCountdown();
    const t1 = setTimeout(() => {
      setCountdown(2);
      sound.playCountdown();
    }, 1000);
    const t2 = setTimeout(() => {
      setCountdown(1);
      sound.playCountdown();
    }, 2000);
    const t3 = setTimeout(() => {
      setCountdown('GO!');
      sound.playGo();
    }, 3000);
    const t4 = setTimeout(() => {
      startTimeRef.current = performance.now();
      setCountdown(null);
      if (inputRef.current) inputRef.current.focus();
    }, 3600);
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
    };
  }, []);

  // Timer loop (real elapsed time without artificial jump, waits for countdown)
  useEffect(() => {
    if (countdown !== null) {
      setElapsedMs(0);
      return;
    }
    if (!startTimeRef.current) {
      startTimeRef.current = performance.now();
    }
    const updateTimer = () => {
      if (!isTransitioningRef.current || feedback !== 'gameOver') {
        const now = performance.now();
        const diff = Math.floor(now - startTimeRef.current);
        setElapsedMs(diff);
      }
      timerRef.current = requestAnimationFrame(updateTimer);
    };
    timerRef.current = requestAnimationFrame(updateTimer);
    return () => cancelAnimationFrame(timerRef.current);
  }, [countdown, feedback]);

  const triggerShake = useCallback(() => {
    setShake(false);
    setTimeout(() => setShake(true), 10);
    setTimeout(() => setShake(false), 150);
  }, []);

  const handleNextProblem = useCallback((isCorrect) => {
    isTransitioningRef.current = true;
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    const newWrong = !isCorrect ? wrongCount + 1 : wrongCount;
    const remaining = 20 - newCorrect;

    if (remaining <= 0) {
      setTimeout(() => {
        cancelAnimationFrame(timerRef.current);
        onGameOver({
          totalMs: elapsedMs,
          correct: newCorrect,
          wrong: newWrong,
          penalties: newWrong * 800,
        });
      }, 500);
      return;
    }

    if (isCorrect) {
      // Immediate transition for correct answers
      setAnimState('out');
      sound.playSwoosh();
      setTimeout(() => {
        setFeedback(null);
        setProblem((prev) => generateProblem(prev));
        setInputVal('');
        setAnimState('in');
        setTimeout(() => {
          setAnimState('idle');
          isTransitioningRef.current = false;
          if (inputRef.current) inputRef.current.focus();
        }, 120);
      }, 100);
    } else {
      // Wrong answer: show explosion for 0.8s (800ms) delay penalty while timer keeps ticking
      setTimeout(() => {
        setProblem((prev) => generateProblem(prev));
        setInputVal('');
        setFeedback(null);
        setAnimState('in');
        sound.playSwoosh();
        setTimeout(() => {
          setAnimState('idle');
          isTransitioningRef.current = false;
          if (inputRef.current) inputRef.current.focus();
        }, 150);
      }, 800);
    }
  }, [correctCount, wrongCount, elapsedMs, onGameOver]);

  const handleInputChange = (e) => {
    if (isTransitioningRef.current || feedback || countdown !== null) return;
    
    const val = e.target.value.replace(/[^0-9]/g, '');
    const prevLen = inputVal.length;
    setInputVal(val);

    if (val.length > prevLen) {
      sound.playType();
      triggerShake();
    } else if (val.length < prevLen) {
      sound.playDelete();
      triggerShake();
    }
  };

  const handleKeyDown = (e) => {
    if (isTransitioningRef.current || feedback || countdown !== null) return;
    if (e.key === 'Enter' && inputVal.length > 0) {
      if (inputVal === String(problem.ans)) {
        setFeedback('correct');
        setCorrectCount((c) => c + 1);
        sound.playCorrect();
        handleNextProblem(true);
      } else {
        setFeedback('wrong');
        setWrongCount((w) => w + 1);
        sound.playWrong();
        triggerShake();

        const chars = `${problem.n1} x ${problem.n2} = ${inputVal}`.split('');
        const pieces = chars.map((ch, idx) => ({
          char: ch,
          x: (Math.random() - 0.5) * 450,
          y: (Math.random() - 0.5) * 450 - 50,
          rot: (Math.random() - 0.5) * 720,
        }));
        setShatterPieces(pieces);
        handleNextProblem(false);
      }
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      sound.playDelete();
      triggerShake();
    }
  };

  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    const mili = String(ms % 1000).padStart(3, '0');
    return `${m}:${s}:${mili}`;
  };

  const remainingCount = Math.max(0, 20 - correctCount);

  return (
    <div className={`game-screen ${shake ? 'shake-active' : ''}`}>
      {/* Hidden input to capture keyboard */}
      <input
        ref={inputRef}
        type="text"
        className="hidden-input"
        value={inputVal}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        autoFocus
      />

      {/* Top Header Bar */}
      <div className="game-header">
        <div className="header-stat correct-stat">
          맞춘 개수 : <span className="highlight-cyan">{correctCount}</span>
        </div>
        <div className="header-stat wrong-stat">
          틀린 개수 : <span className="highlight-red">{wrongCount}</span>
        </div>
        <div className="header-stat remaining-stat">
          남은 개수 : <span className="highlight-white">{remainingCount}</span>
        </div>
      </div>

      {/* Center Equation Area */}
      <div className="game-board" onClick={() => inputRef.current && inputRef.current.focus()}>
        {countdown !== null && (
          <div className="countdown-overlay">
            <span key={countdown} className={`countdown-text ${countdown === 'GO!' ? 'go' : ''}`}>
              {countdown}
            </span>
          </div>
        )}

        {/* Feedback Text above equation */}
        <div className="feedback-banner">
          {feedback === 'correct' && <span className="feedback-text correct">정답!</span>}
          {feedback === 'wrong' && <span className="feedback-text wrong">오답!</span>}
        </div>

        {/* Correct feedback: Donut Ring & Stars (behind letters) */}
        {feedback === 'correct' && (
          <div className="correct-burst-container">
            <div className="donut-ring" />
            <div className="star star-1">★</div>
            <div className="star star-2">★</div>
            <div className="star star-3">★</div>
            <div className="star star-4">★</div>
            <div className="star star-5">★</div>
            <div className="star star-6">★</div>
          </div>
        )}

        {/* Equation Display with Motion Blur */}
        {feedback !== 'wrong' ? (
          <div className={`equation-container ${animState}`}>
            <span className="number-text">{problem.n1}</span>
            <span className="operator-text">x</span>
            <span className="number-text">{problem.n2}</span>
            <span className="equals-text">=</span>
            <span className="input-text">
              {inputVal}
              <span className="cursor-blink">|</span>
            </span>
          </div>
        ) : (
          /* Wrong feedback: Shattered text pieces */
          <div className="shattered-container">
            {shatterPieces.map((piece, idx) => (
              <span
                key={idx}
                className="shatter-piece"
                style={{
                  '--target-x': `${piece.x}px`,
                  '--target-y': `${piece.y}px`,
                  '--target-rot': `${piece.rot}deg`,
                }}
              >
                {piece.char}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Footer & Timer Area */}
      <div className="game-footer">
        <div className="timer-wrapper">
          <div className="timer-pill">{formatTime(elapsedMs)}</div>
        </div>
        <button
          className="quit-btn"
          onClick={() => {
            sound.playType();
            onQuit();
          }}
        >
          그만하기
        </button>
      </div>
    </div>
  );
}
