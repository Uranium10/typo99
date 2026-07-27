import React from 'react';

export default function BackgroundSpeedLines({ speed = 'normal' }) {
  // Generate a set of static horizontal lines with different heights, widths, and animation durations
  const lines = [
    { top: '5%', height: '4px', width: '250px', duration: '6s', delay: '0s', dir: 'left-to-right' },
    { top: '12%', height: '8px', width: '400px', duration: '4s', delay: '-1.5s', dir: 'right-to-left' },
    { top: '18%', height: '3px', width: '180px', duration: '7s', delay: '-2s', dir: 'left-to-right' },
    { top: '25%', height: '12px', width: '500px', duration: '3.5s', delay: '-0.5s', dir: 'right-to-left' },
    { top: '32%', height: '2px', width: '150px', duration: '5s', delay: '-3s', dir: 'left-to-right' },
    { top: '38%', height: '20px', width: '600px', duration: '4.5s', delay: '-1s', dir: 'right-to-left' },
    { top: '45%', height: '6px', width: '320px', duration: '5.5s', delay: '-4s', dir: 'left-to-right' },
    { top: '53%', height: '14px', width: '450px', duration: '3.8s', delay: '-2.5s', dir: 'right-to-left' },
    { top: '60%', height: '3px', width: '220px', duration: '6.2s', delay: '-0.8s', dir: 'left-to-right' },
    { top: '68%', height: '10px', width: '380px', duration: '4.2s', delay: '-3.5s', dir: 'right-to-left' },
    { top: '75%', height: '16px', width: '550px', duration: '3.2s', delay: '-1.2s', dir: 'left-to-right' },
    { top: '82%', height: '5px', width: '280px', duration: '5.8s', delay: '-2.8s', dir: 'right-to-left' },
    { top: '88%', height: '2px', width: '190px', duration: '7.5s', delay: '-4.5s', dir: 'left-to-right' },
    { top: '94%', height: '8px', width: '340px', duration: '4.8s', delay: '-0.3s', dir: 'right-to-left' },
  ];

  const speedMultiplier = speed === 'fast' ? 0.4 : speed === 'hyper' ? 0.2 : 1;

  return (
    <div className="speed-lines-container">
      {lines.map((line, idx) => {
        const numDur = parseFloat(line.duration) * speedMultiplier;
        return (
          <div
            key={idx}
            className={`speed-line ${line.dir}`}
            style={{
              top: line.top,
              height: line.height,
              width: line.width,
              animationDuration: `${numDur}s`,
              animationDelay: line.delay,
            }}
          />
        );
      })}
    </div>
  );
}
