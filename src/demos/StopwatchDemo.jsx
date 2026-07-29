import { useEffect, useRef, useState } from 'react';

// The key interview insight: the interval only triggers re-renders.
// Elapsed time is ALWAYS computed from timestamps — never accumulated
// tick by tick — so the display can't drift when timers fire late.

export default function StopwatchDemo() {
  const [elapsed, setElapsed] = useState(0); // milliseconds
  const [isRunning, setIsRunning] = useState(false);

  const startTimeRef = useRef(0);   // wall-clock time when (re)started
  const pausedAtRef = useRef(0);    // elapsed ms frozen at last pause

  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => {
      // recompute from the clock — no drift accumulation
      setElapsed(Date.now() - startTimeRef.current);
    }, 33); // ~30fps; display precision, not timing precision

    return () => clearInterval(id); // cleanup on pause/unmount
  }, [isRunning]);

  const start = () => {
    // Rebase the start time so pause → resume continues seamlessly:
    // "pretend we started pausedAt ms ago"
    startTimeRef.current = Date.now() - pausedAtRef.current;
    setIsRunning(true);
  };

  const stop = () => {
    setIsRunning(false);
    pausedAtRef.current = elapsed; // freeze progress for the next resume
  };

  const reset = () => {
    setIsRunning(false);
    setElapsed(0);
    pausedAtRef.current = 0;
  };

  const format = (ms) => {
    const mins = String(Math.floor(ms / 60000)).padStart(2, '0');
    const secs = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
    const centis = String(Math.floor((ms % 1000) / 10)).padStart(2, '0');
    return `${mins}:${secs}.${centis}`;
  };

  const btn = (extra = {}) => ({
    padding: '10px 22px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--panel-2)',
    color: 'inherit',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    ...extra,
  });

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontFamily: 'ui-monospace, monospace',
          fontSize: 56,
          fontWeight: 700,
          letterSpacing: 2,
          marginBottom: 20,
          fontVariantNumeric: 'tabular-nums', // digits don't jiggle
        }}
        role="timer"
        aria-live="off"
      >
        {format(elapsed)}
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button
          style={btn({ background: 'var(--accent)', border: 'none', color: '#fff' })}
          disabled={isRunning}
          onClick={start}
        >
          Start
        </button>
        <button style={btn()} disabled={!isRunning} onClick={stop}>
          Stop
        </button>
        <button
          style={btn()}
          disabled={elapsed === 0 && !isRunning}
          onClick={reset}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
