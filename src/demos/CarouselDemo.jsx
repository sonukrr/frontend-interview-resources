import { useCallback, useEffect, useRef, useState } from 'react';

// Carousel = circular index math + autoplay with pause-on-hover +
// keyboard navigation + a11y roles. Slides are inline SVG gradients so
// the demo is deterministic and offline-friendly.

const SLIDES = [
  { label: 'Slide 1', from: '#7c6cff', to: '#4cc9f0' },
  { label: 'Slide 2', from: '#f5576c', to: '#f093fb' },
  { label: 'Slide 3', from: '#43e97b', to: '#38f9d7' },
  { label: 'Slide 4', from: '#fa709a', to: '#fee140' },
  { label: 'Slide 5', from: '#30cfd0', to: '#330867' },
];

function slideUrl({ label, from, to }) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='360'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='${from}'/><stop offset='1' stop-color='${to}'/>
    </linearGradient></defs>
    <rect width='800' height='360' fill='url(#g)'/>
    <text x='400' y='195' font-family='sans-serif' font-size='44' font-weight='bold'
      fill='white' text-anchor='middle'>${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function CarouselDemo() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const n = SLIDES.length;

  // ((x % n) + n) % n — the double-modulo keeps negative steps in [0, n-1]
  const rotate = useCallback(
    (step) => setActive((prev) => (((prev + step) % n) + n) % n),
    [n]
  );

  // Autoplay — recreated whenever pause state flips; cleanup clears the old timer
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => rotate(1), 2500);
    return () => clearInterval(id);
  }, [isPaused, rotate]);

  // Keyboard navigation, scoped to the region so it doesn't hijack the page
  const regionRef = useRef(null);
  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') rotate(-1);
    if (e.key === 'ArrowRight') rotate(1);
  };

  const arrowStyle = {
    background: 'var(--panel-2)',
    border: '1px solid var(--border)',
    color: 'inherit',
    borderRadius: 8,
    fontSize: 18,
    padding: '8px 14px',
    cursor: 'pointer',
  };

  return (
    <div
      ref={regionRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Demo image carousel"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      style={{ maxWidth: 640, margin: '0 auto', outline: 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button aria-label="Previous slide" style={arrowStyle} onClick={() => rotate(-1)}>
          ‹
        </button>

        <div style={{ flex: 1 }}>
          <div
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${active + 1} of ${n}`}
            aria-live="polite"
          >
            <img
              src={slideUrl(SLIDES[active])}
              alt={SLIDES[active].label}
              style={{ width: '100%', borderRadius: 12, display: 'block' }}
              decoding="async"
            />
          </div>
        </div>

        <button aria-label="Next slide" style={arrowStyle} onClick={() => rotate(1)}>
          ›
        </button>
      </div>

      <div
        role="group"
        aria-label="Slide navigation"
        style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}
      >
        {SLIDES.map((s, i) => (
          <button
            key={s.label}
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={active === i}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              background: active === i ? 'var(--accent)' : 'var(--border)',
            }}
          />
        ))}
      </div>

      <p style={{ fontSize: 12.5, color: 'var(--text-dim)', textAlign: 'center', marginTop: 10 }}>
        Autoplays every 2.5s · pauses on hover/focus · focus the carousel and
        use ← → keys.
      </p>
    </div>
  );
}
