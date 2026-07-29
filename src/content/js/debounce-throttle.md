## The one-line distinction

- **Debounce** — "wait until the user stops." Collapses a burst of events into **one trailing call** after a quiet period. Search-as-you-type, resize handlers, autosave.
- **Throttle** — "at most once every N ms." Guarantees a **steady rate** during a continuous stream. Scroll handlers, mousemove, drag.

If the interviewer gives you a search box, they want debounce. If they give you infinite scroll, they want throttle. Being able to say *which and why* matters more than the implementation.

## Debounce

```js
function debounce(fn, delay) {
  let timer;

  return function (...args) {
    const context = this;          // preserve `this` for method calls
    clearTimeout(timer);           // every new event cancels the pending call
    timer = setTimeout(() => {
      fn.apply(context, args);     // fire only after `delay` ms of silence
    }, delay);
  };
}

// usage: one API call 200ms after the user stops typing
input.addEventListener('input', debounce(fetchSuggestions, 200));
```

Key implementation points to narrate:

1. **The closure holds `timer`** — that's the shared state across calls.
2. **`clearTimeout` on every call** — this is what makes it debounce.
3. **`fn.apply(context, args)`** — a debounced method still needs the right `this` and the event arguments. Using an arrow callback inside preserves the captured `context`.

> **The follow-up:** *"Add a leading option — fire immediately, then suppress."*

```js
function debounce(fn, delay, { leading = false } = {}) {
  let timer;
  return function (...args) {
    const callNow = leading && !timer;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!leading) fn.apply(this, args);   // trailing fire
    }, delay);
    if (callNow) fn.apply(this, args);      // leading fire
  };
}
```

## Throttle

Trailing-edge throttle with a timer flag (the version used in the infinite scroll challenge):

```js
function throttle(fn, interval) {
  let timer = null;

  return function (...args) {
    if (timer) return;             // a call is already scheduled → drop this one
    timer = setTimeout(() => {
      timer = null;
      fn.apply(this, args);        // trailing edge: wait, then execute
    }, interval);
  };
}
```

Leading-edge with timestamps (executes first, then waits):

```js
function throttle(fn, interval) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn.apply(this, args);        // leading edge: execute immediately
    }
  };
}
```

> **The follow-up:** *"Leading vs trailing — when does each matter?"* — Leading gives instant feedback (first scroll event reacts immediately) but drops the final state. Trailing guarantees the last event is processed (you never miss the final scroll position) but adds latency. Lodash's throttle does both by default — say that.

## Debounce vs throttle in one table

| | Debounce | Throttle |
|---|---|---|
| Fires | Once, after the burst ends | At a steady rate during the burst |
| Guarantees | Final state is processed | Regular progress updates |
| Drops | Everything except the last call | Calls between ticks |
| Classic use | Typeahead search, form validation | Scroll position, resize layout, mousemove |
| Failure mode if swapped | Scroll UI feels frozen until scrolling stops | API called on every keystroke burst window |

## Where you'll use these in the Machine Coding Lab

- **Typeahead search** — debounce the input (200ms) so you call the API once per pause, then layer a cache on top.
- **Infinite scroll** — throttle the scroll handler (200ms) so bottom-detection runs at a sane rate instead of hundreds of times per second.

Both demos in this app use exactly these implementations — read the annotated source there.
