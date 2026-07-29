# Senior Frontend Prep — Learning Platform

An interactive web app that restructures this repository's interview-prep resources
into a guided curriculum for engineers preparing for **senior frontend roles**.

**Live:** https://frontend-interview-resources.vercel.app

## What's inside

| Section | Content |
|---|---|
| **JavaScript Deep Dive** | 8 topics — `this`/bind/call/apply polyfills, currying & closures, debounce/throttle, promise combinator polyfills, async orchestration (series/pool/retry), deep copy with circular refs, composition utilities, React hook patterns. Every topic flags the interview follow-ups. |
| **Event Loop Arena** | 7 predict-the-output drills (micro vs macro tasks) with reveal + self-grading. |
| **Machine Coding Lab** | 6 classic rounds — Accordion, Stopwatch, Typeahead Search, Infinite Scroll, Carousel, Nested Comments — each with a **live demo**, fully annotated solution source, a walkthrough of what's being graded, and the escalation questions. |
| **System Design · MFE** | A 14-chapter micro-frontend architecture course: framing → shell architecture → Module Federation → bundle hygiene → loading & performance → communication/routing → resilience → deployment → SSR/BFF → scaling to 15 teams → cross-framework migration → Q&A bank. |
| **Interview Kit** | One-liner flashcards and the night-before checklist. |

Progress is tracked per lesson/drill/challenge in `localStorage`.

## Run it

```bash
cd learning-platform
npm install
npm run dev        # dev server
npm run build      # production build → dist/
npm run preview    # serve the production build
```

## Stack

Vite + React 18 + React Router (hash routing, so the static build works from any
host/subpath) · `marked` for markdown lessons · `prismjs` for syntax highlighting.
Lesson content lives as markdown in `src/content/`, imported at build time via
Vite `?raw` — adding a lesson is: drop a `.md` file, register it in
`src/data/curriculum.js`.

The live demos are deliberately dependency-free and offline-friendly (mock APIs
with simulated latency) so the behavior being taught — debouncing, caching,
throttled scroll, race-condition handling — is deterministic and observable.
