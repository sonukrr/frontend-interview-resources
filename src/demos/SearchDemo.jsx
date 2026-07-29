import { useEffect, useRef, useState } from 'react';

// Typeahead = debounce + cache + race-condition safety.
// The demo uses a local mock API (deterministic, works offline) with a
// simulated 300ms latency so the debounce/cache behavior is observable.

const TERMS = [
  'accessibility', 'accordion component', 'abort controller', 'async await',
  'browser rendering pipeline', 'bind polyfill', 'bfcache', 'critical css',
  'closure', 'content security policy', 'core web vitals', 'currying',
  'debounce vs throttle', 'deep clone', 'dependency injection',
  'event delegation', 'event loop', 'error boundary', 'flexbox vs grid',
  'hydration', 'infinite scroll', 'intersection observer', 'lazy loading',
  'largest contentful paint', 'memoization', 'micro frontends',
  'module federation', 'mutation observer', 'promise polyfill',
  'prototype chain', 'react fiber', 'react reconciliation', 'redux toolkit',
  'server side rendering', 'service worker', 'shadow dom', 'stale closure',
  'suspense', 'tree shaking', 'typescript generics', 'virtual dom',
  'web components', 'web workers', 'zustand',
];

// Mock suggestion API — filter + artificial latency
function fetchSuggestions(query, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve(
        TERMS.filter((t) => t.includes(query.toLowerCase())).slice(0, 7)
      );
    }, 300);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('aborted', 'AbortError'));
    });
  });
}

export default function SearchDemo() {
  const [input, setInput] = useState('');          // what the user typed
  const [query, setQuery] = useState('');          // debounced value
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1); // keyboard highlight
  const cacheRef = useRef(new Map());              // query → results
  const [lastSource, setLastSource] = useState('');

  // 1) Debounce: input → query, 250ms after the last keystroke
  useEffect(() => {
    const timer = setTimeout(() => setQuery(input.trim()), 250);
    return () => clearTimeout(timer); // each keystroke cancels the pending one
  }, [input]);

  // 2) Fetch on debounced query — cache first, abort stale requests
  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    if (cacheRef.current.has(query)) {
      setSuggestions(cacheRef.current.get(query));
      setLastSource('cache');
      return; // cache hit → zero network
    }

    const controller = new AbortController();
    setLoading(true);
    fetchSuggestions(query, controller.signal)
      .then((results) => {
        cacheRef.current.set(query, results);
        setSuggestions(results);
        setLastSource('network');
        setActiveIndex(-1);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err);
      })
      .finally(() => setLoading(false));

    // If query changes before the response lands, abort — this is what
    // prevents an older, slower response from overwriting a newer one.
    return () => controller.abort();
  }, [query]);

  const select = (term) => {
    setInput(term);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      select(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative' }}>
      <input
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        placeholder="Search frontend topics… (try 'react' or 'event')"
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-autocomplete="list"
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: 15,
          borderRadius: 10,
          border: '1px solid var(--border)',
          background: 'var(--bg)',
          color: 'inherit',
          outline: 'none',
        }}
      />
      {loading && (
        <span style={{ position: 'absolute', right: 14, top: 12, fontSize: 13, color: 'var(--text-dim)' }}>
          …
        </span>
      )}

      {open && query && suggestions.length > 0 && (
        <ul
          role="listbox"
          style={{
            position: 'absolute',
            zIndex: 5,
            top: '110%',
            left: 0,
            right: 0,
            margin: 0,
            padding: 6,
            listStyle: 'none',
            background: 'var(--panel-2)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
          }}
        >
          {suggestions.map((term, i) => (
            <li
              key={term}
              role="option"
              aria-selected={i === activeIndex}
              // onMouseDown, not onClick: blur fires before click and would
              // close the list first. mousedown wins the race.
              onMouseDown={() => select(term)}
              onMouseEnter={() => setActiveIndex(i)}
              style={{
                padding: '9px 12px',
                borderRadius: 6,
                fontSize: 14.5,
                cursor: 'pointer',
                background: i === activeIndex ? 'rgba(124,108,255,0.2)' : 'transparent',
              }}
            >
              {term}
            </li>
          ))}
        </ul>
      )}

      <p style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 10 }}>
        Last result source: <strong>{lastSource || '—'}</strong> · retype a
        previous query to see the cache skip the network.
      </p>
    </div>
  );
}
