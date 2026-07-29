## The night-before plan

Don't learn anything new. Rehearse retrieval. This page is the 30-minute pass you do the evening before, and the 30-second pass you do outside the building.

## Coding round — the self-check

Write these from memory, out loud, before you walk in:

- [ ] **`bind` polyfill** — *with* `new`-support and partial application. The naive arrow version is the trap.
- [ ] **`Promise.all`** — index-ordered results + empty-array case + non-promise inputs.
- [ ] **Series runner** — and articulate *"array of thunks, not array of promises."*
- [ ] **Concurrency pool** — N workers pulling from a shared index.
- [ ] **Debounce** — closure over the timer, `clearTimeout` per call, `fn.apply(context, args)`.
- [ ] Recite in one breath: *`all` = all succeed or first failure · `allSettled` = wait for all, never rejects · `race` = first to settle · `any` = first to fulfill.*
- [ ] Trace the boss-level async drill (Drill 5 in the Arena) without hesitating on micro-vs-macro ordering.
- [ ] DSA warm-up: sliding window + two pointers (Min Size Subarray Sum, Trapping Rain Water).

## Machine coding round — the ritual

1. **Clarify requirements first** (2 min). Single-open or multi-open accordion? Controlled or uncontrolled? What happens on empty states?
2. **Name your state shape before typing.** Interviewers score the data model more than the JSX.
3. **Ship working-ugly, then improve.** Working accordion in 15 minutes beats a perfect one in 55.
4. **Narrate trade-offs while coding** — "I'm using index as key here because the list is static; with reordering I'd need stable ids."
5. Keep the **a11y layer** in your fingers: buttons not divs, `aria-expanded`, keyboard handlers, focus management.
6. Leave 5 minutes to state what you'd do next: tests, virtualization, error states.

## System design round — the opening move

First five minutes, always:

1. Frame the problem type: *"MFE is an organizational solution, not a performance solution."*
2. Ask requirement questions (teams? deploy pain? stack? SSR? design system?).
3. Commit to NFRs with numbers: 99.99% availability, LCP < 1.8s, INP < 100ms, deploy TAT < 30 min.
4. Draw layers: CDN → Shell → MFEs → shared packages → CI/CD.
5. Then go deep where the interviewer steers — and **volunteer trade-offs unprompted**.

## Red flags to avoid saying

| Don't say | Say instead |
|---|---|
| "MFE makes the app faster" | "MFE trades some performance for team autonomy" |
| "We'd use Redux to share state between MFEs" | "Backend is the source of truth; events for signals" |
| "JSON.parse(JSON.stringify()) for deep copy" | WeakMap-based clone; `structuredClone` in production |
| "I'd just use lodash" | Implement it, then mention lodash parity |
| Silence while stuck | Narrate your options and pick one |

## The last 30 seconds

Breathe. You know: the event loop order, the bind edge cases, the singleton/peerDeps pair, the URL-is-truth rule, and the closing line about organizational value. Walk in and say them like you've said them a hundred times — because by now, you have.
