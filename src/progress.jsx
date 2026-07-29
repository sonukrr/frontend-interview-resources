import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'senior-frontend-prep:progress:v1';

const ProgressContext = createContext(null);

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function ProgressProvider({ children }) {
  const [done, setDone] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
    } catch {
      // storage full / private mode — progress just won't persist
    }
  }, [done]);

  const toggle = useCallback((id) => {
    setDone((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const mark = useCallback((id) => {
    setDone((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const reset = useCallback(() => setDone(new Set()), []);

  return (
    <ProgressContext.Provider value={{ done, toggle, mark, reset }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  return useContext(ProgressContext);
}
