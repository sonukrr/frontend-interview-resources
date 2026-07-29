import { Link, useParams } from 'react-router-dom';
import Markdown from '../components/Markdown';
import CompleteButton from '../components/CompleteButton';
import { lessonSections } from '../data/curriculum';

export default function LessonPage({ section }) {
  const { id } = useParams();
  const { label, basePath, lessons } = lessonSections[section];
  const index = lessons.findIndex((l) => l.id === id);
  const lesson = lessons[index];

  if (!lesson) {
    return (
      <div className="page">
        <h1>Not found</h1>
        <p>
          That lesson doesn't exist. <Link to="/">Back to home</Link>
        </p>
      </div>
    );
  }

  const prev = lessons[index - 1];
  const next = lessons[index + 1];

  return (
    <div className="page">
      <div className="page-head">
        <div className="crumbs">
          {label} · {index + 1} of {lessons.length}
        </div>
        <h1>{lesson.title}</h1>
        {lesson.subtitle && <p className="subtitle">{lesson.subtitle}</p>}
        <div className="meta-badges">
          {lesson.difficulty && (
            <span className={`badge ${lesson.difficulty}`}>
              {lesson.difficulty}
            </span>
          )}
          {lesson.time && <span className="badge">~{lesson.time} read</span>}
          {(lesson.tags || []).map((t) => (
            <span className="badge" key={t}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <Markdown>{lesson.md}</Markdown>

      <CompleteButton id={lesson.trackId} />

      <div className="lesson-nav">
        {prev && (
          <Link to={`${basePath}/${prev.id}`}>
            <span>← Previous</span>
            {prev.title}
          </Link>
        )}
        {next && (
          <Link className="next" to={`${basePath}/${next.id}`}>
            <span>Next →</span>
            {next.title}
          </Link>
        )}
      </div>
    </div>
  );
}
