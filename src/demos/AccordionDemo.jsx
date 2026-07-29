import { useState } from 'react';

// Multi-open accordion.
// State model: an array of open indexes (Set-like). For single-open mode,
// swap the array for a single number and replace instead of toggling.

const DATA = [
  {
    title: 'What is reconciliation?',
    content:
      'React diffs the new element tree against the previous one and applies the minimal set of DOM mutations. Keys tell the differ which children moved vs changed.',
  },
  {
    title: 'Why keys matter in lists',
    content:
      'Stable keys let React match items across renders. Index-as-key breaks when the list reorders — state sticks to positions instead of items.',
  },
  {
    title: 'Controlled vs uncontrolled components',
    content:
      'Controlled: React state is the source of truth (value + onChange). Uncontrolled: the DOM holds the value and you read it via refs. Interviews expect you to name the trade-off.',
  },
  {
    title: 'What does aria-expanded do?',
    content:
      'It tells assistive technology whether the section a button controls is open. Toggle it with your open state — screen readers announce "expanded/collapsed" for free.',
  },
];

function AccordionItem({ item, isOpen, onToggle, id }) {
  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 10,
        marginBottom: 10,
        overflow: 'hidden',
      }}
    >
      {/* A real <button> — keyboard and screen-reader support for free */}
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`panel-${id}`}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          background: 'var(--panel-2)',
          color: 'inherit',
          border: 'none',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {item.title}
        <span
          aria-hidden="true"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s',
          }}
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div
          id={`panel-${id}`}
          role="region"
          style={{ padding: '14px 16px', fontSize: 14.5, lineHeight: 1.6 }}
        >
          {item.content}
        </div>
      )}
    </div>
  );
}

export default function AccordionDemo() {
  // Open panels tracked by index; toggling adds/removes from the array.
  const [openIndexes, setOpenIndexes] = useState([0]);

  const toggle = (idx) =>
    setOpenIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      {DATA.map((item, idx) => (
        <AccordionItem
          key={item.title}
          id={idx}
          item={item}
          isOpen={openIndexes.includes(idx)}
          onToggle={() => toggle(idx)}
        />
      ))}
    </div>
  );
}
