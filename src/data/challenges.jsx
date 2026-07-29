import AccordionDemo from '../demos/AccordionDemo';
import StopwatchDemo from '../demos/StopwatchDemo';
import SearchDemo from '../demos/SearchDemo';
import InfiniteScrollDemo from '../demos/InfiniteScrollDemo';
import CarouselDemo from '../demos/CarouselDemo';
import NestedCommentsDemo from '../demos/NestedCommentsDemo';

import accordionSrc from '../demos/AccordionDemo.jsx?raw';
import stopwatchSrc from '../demos/StopwatchDemo.jsx?raw';
import searchSrc from '../demos/SearchDemo.jsx?raw';
import infiniteScrollSrc from '../demos/InfiniteScrollDemo.jsx?raw';
import carouselSrc from '../demos/CarouselDemo.jsx?raw';
import nestedCommentsSrc from '../demos/NestedCommentsDemo.jsx?raw';

export const challenges = [
  {
    id: 'accordion',
    trackId: 'challenge-accordion',
    title: 'Accordion',
    subtitle: 'The warm-up round — state modeling and accessibility in 20 minutes.',
    difficulty: 'easy',
    time: '20–30 min',
    tags: ['state modeling', 'a11y'],
    Demo: AccordionDemo,
    source: accordionSrc,
    demoNote: 'Multi-open mode: any number of panels can be open at once. The first panel starts open.',
    brief: `
**The prompt you'll get:** "Build an accordion. Clicking a header expands its panel."

Clarify before coding — this is where the points are:

- **Single-open or multi-open?** (Changes the entire state shape.)
- Can all panels be closed?
- Should it be keyboard accessible? (The answer is always yes.)
`,
    walkthrough: `
## The state decision — say it out loud

| Mode | State shape | Toggle logic |
|---|---|---|
| Multi-open | \`openIndexes: number[]\` (or a Set) | add/remove from the array |
| Single-open | \`openIndex: number \\| null\` | replace; same index → null |

Choosing the state shape *before* typing is the strongest signal in short rounds. Starting with multi-open and noting "single-open is a one-line change to this state" covers both.

## Component split

\`Accordion\` owns the open state; \`AccordionItem\` is a **controlled, stateless child** receiving \`isOpen\` + \`onToggle\`. Interviewers watch for whether state lives in one place or leaks into every item.

## The accessibility layer (memorize as a unit)

- The clickable header is a real \`<button>\` — Enter/Space and focus for free. A \`div onClick\` is the most common a11y failure in this round.
- \`aria-expanded={isOpen}\` on the button, \`aria-controls\` pointing at the panel id.
- The panel gets \`role="region"\` and an id.

## Small details that read senior

- Chevron rotation via CSS transform + transition — no icon swapping.
- Key by stable content (title/id), not array index.
- Conditional render (\`isOpen &&\`) unmounts closed panels. If panels held form state you'd hide with CSS instead — mention the trade-off.
`,
    followUps: `
## The escalations to expect

1. **"Make it single-open."** — Swap the array for \`openIndex: number | null\`; toggle becomes replace-or-null.
2. **"Animate the open/close."** — CSS \`grid-template-rows: 0fr → 1fr\` on a wrapper (modern), or measure \`scrollHeight\` and animate \`max-height\`. Say why \`height: auto\` can't be transitioned directly.
3. **"Keyboard spec?"** — Arrow Up/Down to move focus between headers, Home/End to jump — the WAI-ARIA accordion pattern.
4. **"1,000 items?"** — Windowing (react-window); also switch \`openIndexes\` array to a \`Set\` for O(1) lookups.
5. **"Uncontrolled version?"** — Each item owns its open state; parent loses coordination — which is exactly why single-open needs lifted state.
`,
  },
  {
    id: 'stopwatch',
    trackId: 'challenge-stopwatch',
    title: 'Stopwatch',
    subtitle: 'Timers, refs, and the drift bug most candidates ship without noticing.',
    difficulty: 'easy',
    time: '20–30 min',
    tags: ['timers', 'refs', 'cleanup'],
    Demo: StopwatchDemo,
    source: stopwatchSrc,
    brief: `
**The prompt:** "Build a stopwatch with Start, Stop, and Reset. Show minutes, seconds, and fractions."

The hidden test: do you accumulate ticks (wrong) or compute elapsed time from timestamps (right)? Interviewers deliberately don't mention drift — surfacing it yourself is the differentiator.
`,
    walkthrough: `
## The core insight

**The interval only triggers re-renders. Elapsed time is computed from the wall clock:**

\`\`\`js
setElapsed(Date.now() - startTimeRef.current);
\`\`\`

The naive \`setElapsed(e => e + 10)\` in a 10ms interval drifts: timers fire late under load, and background tabs throttle intervals to ~1/sec. Timestamp math is immune — a late tick still computes the correct total.

## Why refs, not state

\`startTimeRef\` and \`pausedAtRef\` are bookkeeping — changing them must NOT re-render. State is only what the UI shows (\`elapsed\`, \`isRunning\`). Articulating this ref-vs-state split is a core senior signal.

## Pause/resume without a special case

On resume: \`startTimeRef.current = Date.now() - pausedAtRef.current\` — "pretend we started pausedAt ms ago." Elapsed math stays identical whether or not you've ever paused.

## Cleanup

The effect keyed on \`isRunning\` returns \`clearInterval\`. Stop → effect cleanup runs → timer gone. No leaked intervals on unmount (StrictMode will expose this instantly if you get it wrong).
`,
    followUps: `
## The refinements to volunteer before being asked

1. **\`performance.now()\` over \`Date.now()\`** — monotonic, high-resolution, immune to system clock changes (NTP jumps break \`Date.now()\` math).
2. **\`requestAnimationFrame\` over \`setInterval(10ms)\`** — you can't paint faster than the frame rate anyway; rAF syncs to the paint cycle and pauses in hidden tabs for free.
3. **"Add laps."** — \`laps: number[]\` in state; each lap stores current elapsed; render deltas between consecutive laps.
4. **"Format without date libs."** — integer division + \`String.padStart\`; use \`font-variant-numeric: tabular-nums\` so digits don't jiggle.
5. **"What breaks in a background tab?"** — intervals throttle, but timestamp math means the display is correct the moment the tab wakes.
`,
  },
  {
    id: 'typeahead-search',
    trackId: 'challenge-typeahead',
    title: 'Typeahead Search',
    subtitle: 'Debounce + cache + the race condition — the most complete 45-minute round.',
    difficulty: 'medium',
    time: '45 min',
    tags: ['debounce', 'caching', 'race conditions', 'a11y'],
    Demo: SearchDemo,
    source: searchSrc,
    demoNote: 'Uses a local mock API with 300ms latency so debounce and cache behavior are observable (and the demo works offline). Watch the "result source" line flip between network and cache.',
    brief: `
**The prompt:** "Build a search input that shows suggestions as the user types."

The four sub-problems, in the order you should name them:

1. **Rate limiting** — debounce the input; don't call the API per keystroke.
2. **Caching** — repeat queries should skip the network.
3. **Race conditions** — a slow older response must not overwrite a newer one.
4. **Interaction polish** — keyboard navigation, blur-vs-click, loading states.
`,
    walkthrough: `
## Two-state debounce

Keep \`input\` (what the user typed, drives the field) and \`query\` (debounced, drives fetching) separate. An effect with cleanup does the debounce:

\`\`\`js
useEffect(() => {
  const t = setTimeout(() => setQuery(input.trim()), 250);
  return () => clearTimeout(t);   // each keystroke cancels the previous timer
}, [input]);
\`\`\`

The cleanup-cancels-previous mechanism IS debounce, expressed in React. Say that sentence.

## The race condition — the senior differentiator

Type "rea", then quickly "react". If the "rea" response arrives *after* the "react" response, naive code overwrites good results with stale ones. Fix: **AbortController in the effect cleanup** — changing the query aborts the in-flight request:

\`\`\`js
const controller = new AbortController();
fetchSuggestions(query, controller.signal).then(setSuggestions);
return () => controller.abort();
\`\`\`

(Alternative if you can't abort: a request-id/latest-wins check. Name both.)

## The cache

A \`useRef(new Map())\` — cache mutation must not re-render. Check before fetching; write after. Mention the production upgrade path: LRU with a size cap, TTL for freshness.

## The blur-vs-click trap

Selecting with \`onClick\` fails: the input's \`blur\` fires first, closes the list, and the click lands on nothing. Use \`onMouseDown\` (fires before blur) — knowing *why* is the point.

## The a11y layer

\`role="combobox"\` + \`aria-expanded\` on the input, \`role="listbox"\`/\`role="option"\` + \`aria-selected\` on the list, ArrowUp/Down/Enter/Escape handling.
`,
    followUps: `
## The escalations

1. **"Highlight the matched substring."** — Split each suggestion on the query and wrap the match; careful with regex-escaping user input.
2. **"Cache grows forever."** — LRU: Map preserves insertion order — delete+set on read moves an entry to "most recent"; evict the oldest key past capacity.
3. **"The API is rate-limited to 5 req/s."** — Debounce already helps; add a throttle layer or a token bucket in the fetch wrapper.
4. **"Offline support?"** — Serve cache when \`navigator.onLine\` is false; queue analytics; a service worker for the asset shell.
5. **"Why debounce and not throttle here?"** — You want the *final* query, not intermediate progress. Throttle is for continuous streams (scroll); debounce for burst-then-quiet input.
`,
  },
  {
    id: 'infinite-scroll',
    trackId: 'challenge-infinite-scroll',
    title: 'Infinite Scroll',
    subtitle: 'Throttled scroll math, pagination state, and duplicate-request guards.',
    difficulty: 'medium',
    time: '45 min',
    tags: ['throttle', 'pagination', 'scroll'],
    Demo: InfiniteScrollDemo,
    source: infiniteScrollSrc,
    demoNote: 'Mock paginated API — 60 items in pages of 12 with 400ms latency. Scroll the box to the bottom repeatedly to exhaust the list and see the end state.',
    brief: `
**The prompt:** "Render a list that loads more items as the user scrolls to the bottom."

The grading rubric hiding underneath:

1. Bottom detection math and **throttling** it.
2. Pagination state: page/offset, \`hasMore\`, loading.
3. **Guards** — no duplicate fetches, stop at the end.
4. Append vs replace on new data.
`,
    walkthrough: `
## The scroll math

\`\`\`js
el.scrollHeight - el.scrollTop <= el.clientHeight + threshold
\`\`\`

Total height minus scrolled distance equals what's below the fold; when that's within a threshold of the viewport height, you're near the bottom. Draw this if there's a whiteboard.

## Throttle, not debounce

Scroll fires continuously — debouncing would wait for scrolling to *stop*. Throttle (one check per 200ms) gives steady progress during the stream. Trailing-edge implementation: timer flag ref; while set, drop events; when it fires, run the check on the final position.

## The guards — where correctness lives

\`\`\`js
if (nearBottom && !loadingRef.current && hasMore) setPage(p => p + 1);
\`\`\`

- **loading guard** — bottom events keep firing during a fetch; without the guard you request the same page repeatedly.
- **hasMore guard** — the API returning fewer than a page (or empty) flips \`hasMore\`; scrolling stops fetching forever after.
- Note the *ref mirror* for loading: the throttled callback closes over stale state, so it reads \`loadingRef.current\` — a real stale-closure fix in the wild.

## Append vs replace

\`page === 0 ? newItems : [...prev, ...newItems]\` — reset to page 0 on a new search/filter, append while scrolling. Always via the functional updater.
`,
    followUps: `
## The escalations

1. **"Use IntersectionObserver instead."** — Observe a sentinel div after the list; no scroll math, no throttling, works with window scrolling. Then answer *"why is IO better?"* — it's async, off-main-thread, and doesn't fire per-pixel.
2. **"10,000 items are in the DOM now."** — Virtualization: render only the visible window + overscan (react-window); keep total height with a spacer.
3. **"Combine with search."** — New query → reset page to 0, clear \`hasMore\`, replace results; debounce the input, throttle the scroll — two different tools in one component, be ready to say why.
4. **"Scroll restoration on back-navigation?"** — Cache items + scroll offset (sessionStorage or a route-level store); restore on mount.
5. **"The fetch fails mid-scroll."** — Keep an error state with a retry row at the bottom; don't advance the page counter on failure.
`,
  },
  {
    id: 'carousel',
    trackId: 'challenge-carousel',
    title: 'Image Carousel',
    subtitle: 'Circular index math, autoplay lifecycle, and the a11y checklist.',
    difficulty: 'medium',
    time: '45 min',
    tags: ['intervals', 'circular math', 'a11y'],
    Demo: CarouselDemo,
    source: carouselSrc,
    brief: `
**The prompt:** "Build an image carousel: previous/next arrows, dot navigation, autoplay."

What's actually being tested: circular array math, interval lifecycle management (autoplay + pause), and whether accessibility is in your fingers or an afterthought.
`,
    walkthrough: `
## The circular index formula

\`\`\`js
setActive(prev => (((prev + step) % n) + n) % n);
\`\`\`

Plain \`%\` goes negative for backward steps in JS (\`-1 % 5 === -1\`). Adding \`n\` before the second modulo shifts into range. Write this without hesitation — it's the micro-moment the round is named after.

## Autoplay as an effect

\`\`\`js
useEffect(() => {
  if (isPaused) return;                      // pause = don't create a timer
  const id = setInterval(() => rotate(1), 2500);
  return () => clearInterval(id);            // cleanup on pause/unmount
}, [isPaused, rotate]);
\`\`\`

Pause isn't "stop the interval" imperatively — it's a dependency flip that lets the effect cleanup + re-run handle the lifecycle. Pause on hover **and focus** (both matter for a11y).

## Functional updater in the interval

The interval callback is created once; reading \`active\` directly would be a stale closure. \`setActive(prev => ...)\` sidesteps it — connect this to the stale-closure drill if asked.

## The a11y checklist

- Container: \`role="region"\` + \`aria-roledescription="carousel"\`.
- Slide: \`role="group"\`, \`aria-label="Slide 2 of 5"\`, \`aria-live="polite"\` so changes are announced.
- Arrows and dots are real buttons with \`aria-label\`; active dot gets \`aria-current\`.
- Keyboard: ← → handled on the focusable container — not a global window listener, which would hijack arrow keys for the entire page.
`,
    followUps: `
## The escalations

1. **"Add slide transitions."** — Render a track div with all slides, \`transform: translateX(-active * 100%)\` + transition; explain transform (compositor) vs animating \`left\` (layout).
2. **"Make the transition infinite (5 → 1 without rewinding)."** — Clone-slide technique: append slide 1's clone, transition to it, then jump without transition. This is a genuinely hard follow-up; outlining the approach is enough.
3. **"Touch support?"** — pointerdown/move/up, track deltaX, threshold decides prev/next; mention passive listeners for scroll performance.
4. **"Preload the next image."** — \`new Image().src = urls[nextIndex]\` on index change, or hidden \`<link rel="preload">\`.
5. **"Should autoplay pause off-screen?"** — Yes: IntersectionObserver + the Page Visibility API; connect to battery/CPU cost.
`,
  },
  {
    id: 'nested-comments',
    trackId: 'challenge-nested-comments',
    title: 'Nested Comments',
    subtitle: 'The data-modeling boss round — normalized state vs tree recursion.',
    difficulty: 'hard',
    time: '60 min',
    tags: ['data modeling', 'useReducer', 'recursion'],
    Demo: NestedCommentsDemo,
    source: nestedCommentsSrc,
    demoNote: 'Reply, edit, vote, and delete are all live. Deleting a comment removes its whole subtree. Nesting collapses past depth 5.',
    brief: `
**The prompt:** "Build a Reddit-style comment system: add, reply (nested), edit, delete, vote."

This round is won at the **data model**, before any JSX. The naive nested-tree shape makes every update a recursive surgery; the normalized shape makes every update a map lookup.
`,
    walkthrough: `
## The state decision — the whole round in one table

| | Nested tree | Normalized (chosen) |
|---|---|---|
| Shape | \`[{ text, children: [...] }]\` | \`comments: { [id]: {..., childIds} }\` + \`rootIds\` |
| Find a comment | O(n) recursive search | O(1) lookup |
| Edit/vote | Recursively rebuild the path | Spread one entry |
| Delete subtree | Recursive filter | Collect ids, drop from map |
| Rendering | Natural recursion | Recursion over childIds — same |

**Rendering recurses; state does not.** That's the sentence to say. It's the same normalization argument as a Redux store or a database table.

## useReducer over useState

Five action types (ADD / REPLY / EDIT / VOTE / DELETE) mutating one structure — a reducer centralizes the transitions and makes them testable as a pure function. Saying "I'd unit-test the reducer without rendering anything" is an easy senior point.

## Delete = collect, then filter

Collect the subtree ids with a small recursive walk into a Set, then one pass: drop deleted entries, and strip deleted ids from any surviving \`childIds\`. Two clean phases — no in-place tree surgery.

## Depth capping

Recursive components need a depth prop and a cap (collapse past depth 5 here). Unbounded depth is a stack risk and unusable UI — Reddit collapses too. Interviewers ask; have the answer ready.

## Draft state stays local

Reply/edit drafts live in each Comment's local useState — keystrokes must not dispatch through the reducer and re-render the tree. Global structure vs local ephemera is a state-placement signal.
`,
    followUps: `
## The escalations

1. **"Persist to a backend."** — The normalized shape IS the API shape: flat rows with \`parent_id\`. Optimistic updates: dispatch locally, rollback action on failure.
2. **"Collapse/expand threads."** — \`collapsed\` boolean per comment; render children only when expanded; show "n replies" on the collapsed row.
3. **"Sort by votes."** — Sort \`childIds\` at render time (memoized per parent), or maintain sorted order in the reducer on VOTE — discuss the trade-off.
4. **"10,000 comments?"** — Flatten the *visible* tree into a list (respecting collapse state) and virtualize it; depth becomes an indent property of each row.
5. **"Why \`memo\` on Comment?"** — One comment's edit re-renders the whole tree otherwise; with normalized state + memo, only the changed comment's subtree re-renders. Tie it to referential equality of the map entries.
`,
  },
];
