## Custom hooks they ask you to write

### `useUpdateEffect` — skip the initial render

"Run this effect on every *update* of the deps, but not on mount" — a React-flavored classic:

```js
function useUpdateEffect(callback, deps) {
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      return callback();              // run on updates (and forward its cleanup!)
    }
    isMounted.current = true;         // swallow the first run
  }, deps);
}
```

Why a **ref** and not state: mutating a ref doesn't trigger a re-render, and its value survives across renders. That's the entire reason refs exist beyond DOM access — narrate it.

### `useDebouncedValue` — the pattern behind every typeahead

```js
function useDebouncedValue(value, delay = 200) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);   // each keystroke cancels the previous timer
  }, [value, delay]);

  return debounced;
}
```

The load-bearing line is the **cleanup**. On every `value` change React first runs the previous effect's cleanup (clearing the old timer), then the new effect (setting a fresh one). A burst of keystrokes therefore yields exactly one trailing update. This *is* debounce, expressed in effect semantics.

## The cleanup-function contract

State the rules precisely — this is where candidates get vague:

1. Cleanup runs **before every re-run** of the effect (deps changed), and **on unmount**.
2. An empty dep array `[]` → effect runs once on mount, cleanup once on unmount.
3. Every subscription-like effect (interval, listener, socket, observer) must return a cleanup, or you leak — and in StrictMode dev, mount-unmount-mount will surface it immediately.

```js
useEffect(() => {
  const handler = (e) => { /* ... */ };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);
```

## Timers in React — the stopwatch trap

The naive stopwatch increments state every tick: `setElapsed(e => e + 10)` in a 10ms interval. It **drifts** — `setInterval` doesn't fire exactly on schedule, and background tabs throttle timers to ~1/sec.

The correct model: **the interval only triggers re-renders; elapsed time is computed from timestamps.**

```js
// on start:
startTimeRef.current = Date.now() - pausedElapsedRef.current;

// each tick just recomputes from the wall clock:
setElapsed(Date.now() - startTimeRef.current);
```

Pause/resume falls out naturally: on pause, remember elapsed; on resume, rebase the start time by it. See the Stopwatch challenge for the full solution.

Two refinements to mention unprompted:

- **`performance.now()` over `Date.now()`** — monotonic and high-resolution; immune to system clock changes (NTP sync, user changing the time).
- **`requestAnimationFrame` over a 10ms interval** — syncs updates to the paint cycle (you can't display more than one update per frame anyway) and pauses in hidden tabs for free.

## Stale closures — the interval that never sees new state

```js
useEffect(() => {
  const id = setInterval(() => {
    console.log(count);      // ⚠ always logs the count from mount
  }, 1000);
  return () => clearInterval(id);
}, []);                      // count is captured once, at mount
```

The callback closes over the render in which the effect ran. Three fixes, in order of preference:

1. **Functional updates** — `setCount(c => c + 1)` doesn't need to read `count` at all.
2. **Put it in deps** — `[count]` recreates the interval each change (fine for slow-changing values).
3. **Ref mirror** — keep `countRef.current = count` updated in an effect; the interval reads the ref. This is the escape hatch when you must read latest state without re-subscribing.

Stale closure bugs are the most common "debug this React code" interview exercise — recognize the shape: *an async callback created once, reading state that has since moved on.*
