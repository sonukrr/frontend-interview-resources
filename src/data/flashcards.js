export const flashcards = [
  {
    front: 'MFE is a ______ solution, not a ______ solution.',
    back: 'An ORGANIZATIONAL solution, not a performance solution. A well-built SPA outperforms MFE on raw metrics — the win is autonomy, independent deploys, ownership.',
  },
  {
    front: 'What should the shell contain?',
    back: 'The shell should be boring — routing, error boundaries, composition. Nothing else. Target under 50KB.',
  },
  {
    front: 'Two React instances are running. What silently breaks?',
    back: 'useContext stops working across MFE boundaries. Auth context and themes silently stop propagating. Nobody notices until production.',
  },
  {
    front: 'peerDependencies vs singleton — which locks what?',
    back: 'peerDependencies is the BUILD-time lock (nothing gets bundled). singleton is the RUNTIME lock (one instance negotiated). You need both.',
  },
  {
    front: 'Caching strategy for remoteEntry.js vs /assets/*.js?',
    back: 'remoteEntry is NETWORK-first (must be fresh — it points at the current deploy). Assets are CACHE-first (content-hashed, immutable forever).',
  },
  {
    front: 'Canary vs A/B — one line each.',
    back: 'Canary is for deployment safety. A/B is for feature optimization. Different tools for different problems.',
  },
  {
    front: 'Why must MFEs never import from each other?',
    back: "The moment Product imports from Cart, Cart can't refactor without breaking Product — you've recreated the coupling you were trying to escape.",
  },
  {
    front: 'Navigation happened but the URL didn\'t change. Verdict?',
    back: 'You have a bug. The URL is always the source of truth — SEO, deep links, and back/forward all depend on pushState firing for every navigation.',
  },
  {
    front: 'Two teams are debating ownership of a component. Where does it go?',
    back: "If two teams are debating ownership, it probably belongs in the design system.",
  },
  {
    front: 'SSR + MFE are in tension. How do you resolve it?',
    back: 'Route-level ownership — an SSR MFE owns its full HTML response for its routes. Never compose SSR fragments inside a CSR shell (hydration mismatch).',
  },
  {
    front: 'The shell is down. What do you call that, and why?',
    back: "A P0. Shell down means the whole composed app is down — treat shell deploys like infrastructure changes, not feature releases.",
  },
  {
    front: 'What does "independent deploy" require of the shell?',
    back: 'The shell must NEVER need to redeploy for an MFE change — manifest-driven discovery makes new versions and even new MFEs pick up at runtime.',
  },
  {
    front: 'Eager: true — who sets it and who must not?',
    back: 'Only the shell. If an MFE sets eager, it races the shell at startup and risks two React instances loading simultaneously.',
  },
  {
    front: '15 MFEs each call /me on load. Fix it in one sentence.',
    back: 'A shared singleton service returns the same in-flight PROMISE to every caller — 15 code-level calls collapse into 1 network request.',
  },
  {
    front: 'Rollback strategy in under 10 words?',
    back: 'Repoint the manifest, purge CDN cache — under 5 minutes.',
  },
  {
    front: 'Debounce vs throttle — one line each.',
    back: 'Debounce: one call after the burst ends (typeahead). Throttle: steady rate during the burst (scroll). Search box → debounce; infinite scroll → throttle.',
  },
  {
    front: 'Series runner input: array of promises or array of thunks?',
    back: 'Thunks — functions returning promises. An array of promises has ALREADY started; promises are eager.',
  },
  {
    front: 'all / allSettled / race / any — one breath.',
    back: 'all = all succeed or first failure · allSettled = wait for all, never rejects · race = first to SETTLE · any = first to FULFILL, rejects only if all fail.',
  },
  {
    front: 'Event loop golden rule?',
    back: 'Sync stack → drain ALL microtasks (promise callbacks, await continuations) → ONE macrotask (setTimeout) → repeat.',
  },
  {
    front: 'Why is an arrow function wrong for Array.prototype polyfills?',
    back: "Arrow functions capture `this` lexically — they never see the array the method was called on. Prototype methods must be regular functions.",
  },
];
