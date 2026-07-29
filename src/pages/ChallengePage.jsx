import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Markdown from '../components/Markdown';
import CodeBlock from '../components/CodeBlock';
import CompleteButton from '../components/CompleteButton';
import { challenges } from '../data/challenges';

const TABS = ['Live demo', 'Solution code', 'Walkthrough', 'Follow-ups'];

export default function ChallengePage() {
  const { id } = useParams();
  const [tab, setTab] = useState(0);

  // Reset to the demo tab when navigating between challenges
  useEffect(() => setTab(0), [id]);

  const index = challenges.findIndex((c) => c.id === id);
  const challenge = challenges[index];

  if (!challenge) {
    return (
      <div className="page">
        <h1>Not found</h1>
        <p>
          That challenge doesn't exist. <Link to="/">Back to home</Link>
        </p>
      </div>
    );
  }

  const { Demo } = challenge;
  const prev = challenges[index - 1];
  const next = challenges[index + 1];

  return (
    <div className="page" key={challenge.id}>
      <div className="page-head">
        <div className="crumbs">
          Machine Coding Lab · {index + 1} of {challenges.length}
        </div>
        <h1>{challenge.title}</h1>
        <p className="subtitle">{challenge.subtitle}</p>
        <div className="meta-badges">
          <span className={`badge ${challenge.difficulty}`}>
            {challenge.difficulty}
          </span>
          <span className="badge">~{challenge.time} round</span>
          {challenge.tags.map((t) => (
            <span className="badge" key={t}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <Markdown>{challenge.brief}</Markdown>

      <div className="tabs">
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`tab ${tab === i ? 'active' : ''}`}
            onClick={() => setTab(i)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="tab-body">
        {tab === 0 && (
          <>
            <div className="demo-stage">
              <Demo />
            </div>
            {challenge.demoNote && (
              <p className="demo-note">{challenge.demoNote}</p>
            )}
          </>
        )}
        {tab === 1 && <CodeBlock code={challenge.source} lang="jsx" />}
        {tab === 2 && <Markdown>{challenge.walkthrough}</Markdown>}
        {tab === 3 && (
          <div className="followups">
            <Markdown>{challenge.followUps}</Markdown>
          </div>
        )}
      </div>

      <CompleteButton id={challenge.trackId} />

      <div className="lesson-nav">
        {prev && (
          <Link to={`/challenge/${prev.id}`}>
            <span>← Previous</span>
            {prev.title}
          </Link>
        )}
        {next && (
          <Link className="next" to={`/challenge/${next.id}`}>
            <span>Next →</span>
            {next.title}
          </Link>
        )}
      </div>
    </div>
  );
}
