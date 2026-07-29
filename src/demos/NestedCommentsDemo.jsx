import { useReducer, useState } from 'react';

// Nested comments with a NORMALIZED state shape — the senior data model:
//   comments: { [id]: { id, text, votes, childIds: [] } }
//   rootIds:  [id, ...]
// Every operation (reply/edit/delete/vote) is O(1) lookups on the map,
// instead of recursive tree surgery. Rendering recurses; state does not.

let nextId = 100;

const initialState = {
  comments: {
    1: { id: 1, text: 'Normalized state beats nested trees for comment systems. Every update is a map lookup.', votes: 4, childIds: [2] },
    2: { id: 2, text: 'Agreed — and deletes become "remove id from parent.childIds" instead of tree traversal.', votes: 2, childIds: [3] },
    3: { id: 3, text: 'The interviewer will ask you to cap render depth too. This demo collapses past depth 5.', votes: 1, childIds: [] },
  },
  rootIds: [1],
};

function reducer(state, action) {
  const { comments, rootIds } = state;
  switch (action.type) {
    case 'ADD': {
      const id = nextId++;
      return {
        comments: { ...comments, [id]: { id, text: action.text, votes: 0, childIds: [] } },
        rootIds: [...rootIds, id],
      };
    }
    case 'REPLY': {
      const id = nextId++;
      const parent = comments[action.parentId];
      return {
        ...state,
        comments: {
          ...comments,
          [id]: { id, text: action.text, votes: 0, childIds: [] },
          [parent.id]: { ...parent, childIds: [...parent.childIds, id] },
        },
      };
    }
    case 'EDIT': {
      const c = comments[action.id];
      return {
        ...state,
        comments: { ...comments, [c.id]: { ...c, text: action.text, edited: true } },
      };
    }
    case 'VOTE': {
      const c = comments[action.id];
      return {
        ...state,
        comments: { ...comments, [c.id]: { ...c, votes: c.votes + action.delta } },
      };
    }
    case 'DELETE': {
      // Collect the whole subtree, then drop every id in one pass
      const toDelete = new Set();
      (function collect(id) {
        toDelete.add(id);
        comments[id]?.childIds.forEach(collect);
      })(action.id);

      const next = {};
      for (const [id, c] of Object.entries(comments)) {
        if (toDelete.has(c.id)) continue;
        next[id] = c.childIds.some((cid) => toDelete.has(cid))
          ? { ...c, childIds: c.childIds.filter((cid) => !toDelete.has(cid)) }
          : c;
      }
      return {
        comments: next,
        rootIds: rootIds.filter((id) => !toDelete.has(id)),
      };
    }
    default:
      return state;
  }
}

const MAX_DEPTH = 5;

function Comment({ id, comments, dispatch, depth }) {
  const comment = comments[id];
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  if (!comment) return null;

  const linkBtn = (color = 'var(--accent-2)') => ({
    background: 'none',
    border: 'none',
    color,
    cursor: 'pointer',
    fontSize: 12.5,
    padding: 0,
    fontWeight: 600,
  });

  const box = {
    width: '100%',
    boxSizing: 'border-box',
    background: 'var(--bg)',
    color: 'inherit',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: 8,
    fontSize: 13.5,
    fontFamily: 'inherit',
    minHeight: 54,
  };

  return (
    <div
      style={{
        marginLeft: depth > 0 ? 18 : 0,
        borderLeft: depth > 0 ? '2px solid var(--border)' : 'none',
        paddingLeft: depth > 0 ? 14 : 0,
        marginTop: 14,
      }}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <button style={linkBtn('var(--text-dim)')} onClick={() => dispatch({ type: 'VOTE', id, delta: 1 })} title="Upvote">▲</button>
          <strong style={{ fontSize: 12.5 }}>{comment.votes}</strong>
          <button style={linkBtn('var(--text-dim)')} onClick={() => dispatch({ type: 'VOTE', id, delta: -1 })} title="Downvote">▼</button>
        </div>

        <div style={{ flex: 1 }}>
          {editing ? (
            <div>
              <textarea style={box} value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
              <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                <button
                  style={linkBtn()}
                  onClick={() => {
                    if (draft.trim()) dispatch({ type: 'EDIT', id, text: draft.trim() });
                    setEditing(false);
                  }}
                >
                  Save
                </button>
                <button style={linkBtn('var(--text-dim)')} onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <p style={{ margin: '0 0 4px', fontSize: 14 }}>
                {comment.text}
                {comment.edited && (
                  <em style={{ color: 'var(--text-dim)', fontSize: 12 }}> (edited)</em>
                )}
              </p>
              <div style={{ display: 'flex', gap: 14 }}>
                <button style={linkBtn()} onClick={() => { setReplying((r) => !r); setDraft(''); }}>Reply</button>
                <button style={linkBtn()} onClick={() => { setEditing(true); setDraft(comment.text); }}>Edit</button>
                <button style={linkBtn('var(--red)')} onClick={() => dispatch({ type: 'DELETE', id })}>Delete</button>
              </div>
            </>
          )}

          {replying && (
            <div style={{ marginTop: 8 }}>
              <textarea style={box} value={draft} placeholder="Write a reply…" onChange={(e) => setDraft(e.target.value)} autoFocus />
              <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                <button
                  style={linkBtn()}
                  onClick={() => {
                    if (draft.trim()) {
                      dispatch({ type: 'REPLY', parentId: id, text: draft.trim() });
                      setReplying(false);
                    }
                  }}
                >
                  Post reply
                </button>
                <button style={linkBtn('var(--text-dim)')} onClick={() => setReplying(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.childIds.length > 0 &&
        (depth >= MAX_DEPTH ? (
          <div style={{ marginLeft: 18, marginTop: 8, fontSize: 12.5, color: 'var(--text-dim)' }}>
            … {comment.childIds.length} more (max depth reached)
          </div>
        ) : (
          comment.childIds.map((childId) => (
            <Comment key={childId} id={childId} comments={comments} dispatch={dispatch} depth={depth + 1} />
          ))
        ))}
    </div>
  );
}

export default function NestedCommentsDemo() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [input, setInput] = useState('');

  return (
    <div style={{ maxWidth: 620, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && input.trim()) {
              dispatch({ type: 'ADD', text: input.trim() });
              setInput('');
            }
          }}
          placeholder="Add a top-level comment…"
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            color: 'inherit',
            fontSize: 14,
          }}
        />
        <button
          className="btn"
          disabled={!input.trim()}
          onClick={() => {
            dispatch({ type: 'ADD', text: input.trim() });
            setInput('');
          }}
        >
          Post
        </button>
      </div>

      {state.rootIds.map((id) => (
        <Comment key={id} id={id} comments={state.comments} dispatch={dispatch} depth={0} />
      ))}
    </div>
  );
}
