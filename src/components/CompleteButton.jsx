import { useProgress } from '../progress';

export default function CompleteButton({ id }) {
  const { done, toggle } = useProgress();
  const isDone = done.has(id);
  return (
    <button
      className={`complete-btn ${isDone ? 'is-done' : ''}`}
      onClick={() => toggle(id)}
    >
      {isDone ? '✓ Completed — tap to undo' : 'Mark as complete'}
    </button>
  );
}
