import React, { useCallback } from 'react';

export default function CustomKeypad({ onInput, onEnter, onDelete, onClear }) {
  const handleKeyClick = useCallback((e, action, value) => {
    // Prevent default to avoid focusing any elements and triggering OS keyboards
    if (e.cancelable) {
      e.preventDefault();
    }
    e.stopPropagation();

    // Trigger slight haptic if available on mobile
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }

    if (action === 'input') {
      onInput(value);
    } else if (action === 'enter') {
      onEnter();
    } else if (action === 'delete') {
      onDelete();
    } else if (action === 'clear') {
      if (onClear) onClear();
    }
  }, [onInput, onEnter, onDelete, onClear]);

  // Handle pointerDown instead of click for instant response on mobile
  const createProps = (action, value = null) => ({
    onPointerDown: (e) => handleKeyClick(e, action, value),
  });

  return (
    <div className="custom-keypad-container" onPointerDown={(e) => {
        if (e.cancelable) e.preventDefault();
    }}>
      <div className="keypad-grid">
        {/* Row 1 */}
        <button className="keypad-btn num" {...createProps('input', '1')}>1</button>
        <button className="keypad-btn num" {...createProps('input', '2')}>2</button>
        <button className="keypad-btn num" {...createProps('input', '3')}>3</button>
        <button className="keypad-btn action delete" {...createProps('delete')}>
          <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
            <line x1="18" y1="9" x2="12" y2="15"></line>
            <line x1="12" y1="9" x2="18" y2="15"></line>
          </svg>
        </button>

        {/* Row 2 */}
        <button className="keypad-btn num" {...createProps('input', '4')}>4</button>
        <button className="keypad-btn num" {...createProps('input', '5')}>5</button>
        <button className="keypad-btn num" {...createProps('input', '6')}>6</button>
        
        {/* Tall vertical enter key (Spans 3 Rows: Row 2, 3, 4) */}
        <button className="keypad-btn action enter" {...createProps('enter')}>
          <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 10 4 15 9 20"></polyline>
            <path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
          </svg>
        </button>

        {/* Row 3 */}
        <button className="keypad-btn num" {...createProps('input', '7')}>7</button>
        <button className="keypad-btn num" {...createProps('input', '8')}>8</button>
        <button className="keypad-btn num" {...createProps('input', '9')}>9</button>

        {/* Row 4 */}
        <button className="keypad-btn action clear" {...createProps('clear')}>C</button>
        <button className="keypad-btn num" {...createProps('input', '0')}>0</button>
        <div className="keypad-btn empty" style={{ visibility: 'hidden', pointerEvents: 'none' }}></div>
      </div>
    </div>
  );
}
