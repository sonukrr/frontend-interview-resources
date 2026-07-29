import { useState } from 'react';
import CompleteButton from '../components/CompleteButton';
import { flashcards } from '../data/flashcards';

function Card({ front, back }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className={`flash-card ${flipped ? 'flipped' : ''}`}
      onClick={() => setFlipped((f) => !f)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setFlipped((f) => !f);
        }
      }}
    >
      <div className="flash-inner">
        <div className="flash-face front">{front}</div>
        <div className="flash-face back">{back}</div>
      </div>
    </div>
  );
}

export default function FlashcardsPage() {
  return (
    <div className="page">
      <div className="page-head">
        <div className="crumbs">Interview Kit</div>
        <h1>One-liner Flashcards</h1>
        <p className="subtitle">
          The lines that land in a system design interview. Tap a card to flip
          it. Say the answer out loud before you flip — that's the whole
          exercise.
        </p>
      </div>
      <div className="flash-grid">
        {flashcards.map((c) => (
          <Card key={c.front} front={c.front} back={c.back} />
        ))}
      </div>
      <CompleteButton id="kit-flashcards" />
    </div>
  );
}
