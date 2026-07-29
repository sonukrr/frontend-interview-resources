import { NavLink } from 'react-router-dom';
import { curriculum, allTrackableIds } from '../data/curriculum';
import { useProgress } from '../progress';

export default function Sidebar({ open }) {
  const { done } = useProgress();
  const total = allTrackableIds.length;
  const completed = allTrackableIds.filter((id) => done.has(id)).length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <NavLink to="/" className="brand">
        <span className="brand-mark">{'</>'}</span>
        <span>
          <strong>Senior Frontend</strong>
          <em>Interview Prep</em>
        </span>
      </NavLink>

      <div className="sidebar-progress">
        <div className="sidebar-progress-bar">
          <div style={{ width: `${pct}%` }} />
        </div>
        <span>
          {completed}/{total} · {pct}%
        </span>
      </div>

      <nav>
        {curriculum.map((section) => (
          <div className="nav-section" key={section.title}>
            <h4>{section.title}</h4>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <span className="nav-label">{item.title}</span>
                {item.trackIds?.every((id) => done.has(id)) &&
                  item.trackIds?.length > 0 && (
                    <span className="nav-check">✓</span>
                  )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <footer className="sidebar-footer">
        Built from the <code>frontend-system-design</code> repo
      </footer>
    </aside>
  );
}
