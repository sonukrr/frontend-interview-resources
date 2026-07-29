import { Link } from 'react-router-dom';
import { homeSections } from '../data/curriculum';
import { useProgress } from '../progress';

const steps = [
  {
    title: '1 · JavaScript Deep Dive',
    desc: 'Rebuild the language primitives interviewers love: bind/call/apply, currying, promise polyfills, async orchestration. Every topic flags the follow-up question that separates senior from mid-level.',
  },
  {
    title: '2 · Event Loop Arena',
    desc: 'Predict-the-output drills on microtasks vs macrotasks. Reveal, self-grade, repeat until you can trace them out loud without hesitating.',
  },
  {
    title: '3 · Machine Coding Lab',
    desc: 'Six classic UI rounds — accordion to nested comments — each with a live demo, the full annotated solution, and the escalations interviewers use to push you.',
  },
  {
    title: '4 · System Design — Micro Frontends',
    desc: 'A twelve-chapter architecture course: from "why MFE exists" through Module Federation, bundle hygiene, resilience, deployment, SSR, and scaling to 15 teams.',
  },
  {
    title: '5 · Interview Kit',
    desc: 'The night-before layer: one-liner flashcards, the answer checklist, and a 30-second self-check.',
  },
];

export default function Home() {
  const { done } = useProgress();

  return (
    <div className="page">
      <div className="hero">
        <h1>
          Prepare for your next <em>senior frontend</em> role
        </h1>
        <p>
          A structured curriculum distilled from real interview loops — JS
          internals, machine coding rounds, event-loop drills, and a full
          micro-frontend system design course. Work through it in order, mark
          topics complete, and track your readiness.
        </p>
        <Link className="btn" to="/topic/this-bind-call-apply">
          Start learning →
        </Link>
      </div>

      <div className="section-grid">
        {homeSections.map((s) => {
          const completed = s.trackIds.filter((id) => done.has(id)).length;
          const pct = s.trackIds.length
            ? Math.round((completed / s.trackIds.length) * 100)
            : 0;
          return (
            <Link className="section-card" to={s.path} key={s.title}>
              <span className="icon">{s.icon}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <div className="card-progress">
                <div style={{ width: `${pct}%` }} />
              </div>
              <span className="card-meta">
                {completed}/{s.trackIds.length} complete
              </span>
            </Link>
          );
        })}
      </div>

      <h2 className="home-h2">The recommended path</h2>
      <div className="path-steps">
        {steps.map((s) => (
          <div className="path-step" key={s.title}>
            <strong>{s.title}</strong>
            <span>{s.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
