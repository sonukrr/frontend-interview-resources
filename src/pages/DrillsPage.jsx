import { useState } from 'react';
import Markdown from '../components/Markdown';
import CodeBlock from '../components/CodeBlock';
import { drills } from '../data/drills';
import { useProgress } from '../progress';

function DrillCard({ drill, number }) {
  const [revealed, setRevealed] = useState(false);
  const { done, mark, toggle } = useProgress();
  const isDone = done.has(drill.trackId);

  return (
    <div className="drill-card">
      <h3>
        Drill {number} — {drill.title}
      </h3>
      <p style={{ color: 'var(--text-dim)', fontSize: 14, marginTop: 0 }}>
        Predict the exact console output before revealing.
      </p>
      <CodeBlock code={drill.code} lang="js" />
      <div className="drill-actions">
        {!revealed ? (
          <button className="btn" onClick={() => setRevealed(true)}>
            Reveal answer
          </button>
        ) : (
          <>
            <button
              className="btn ghost"
              onClick={() => setRevealed(false)}
            >
              Hide answer
            </button>
            {!isDone ? (
              <button className="btn" onClick={() => mark(drill.trackId)}>
                I nailed it ✓
              </button>
            ) : (
              <button
                className="btn ghost"
                onClick={() => toggle(drill.trackId)}
              >
                Unmark
              </button>
            )}
          </>
        )}
        {isDone && <span className="drill-status good">✓ mastered</span>}
      </div>
      {revealed && (
        <div className="drill-answer">
          <div className="drill-output">{drill.output}</div>
          <Markdown>{drill.explanation}</Markdown>
        </div>
      )}
    </div>
  );
}

export default function DrillsPage() {
  const { done } = useProgress();
  const mastered = drills.filter((d) => done.has(d.trackId)).length;

  return (
    <div className="page">
      <div className="page-head">
        <div className="crumbs">Event Loop Arena</div>
        <h1>Output Prediction Drills</h1>
        <p className="subtitle">
          The golden rule: <strong>sync stack → drain ALL microtasks</strong>{' '}
          (promise callbacks, <code>await</code> continuations) →{' '}
          <strong>then ONE macrotask</strong> (<code>setTimeout</code>) →
          repeat. Interviewers want you to trace these out loud without
          hesitating.
        </p>
        <div className="meta-badges">
          <span className="badge">
            {mastered}/{drills.length} mastered
          </span>
        </div>
      </div>

      {drills.map((d, i) => (
        <DrillCard key={d.id} drill={d} number={i + 1} />
      ))}
    </div>
  );
}
