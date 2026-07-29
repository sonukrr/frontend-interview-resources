import { challenges } from './challenges';
import { drills } from './drills';

// JavaScript Deep Dive
import mdThisBind from '../content/js/this-bind-call-apply.md?raw';
import mdCurrying from '../content/js/currying-closures.md?raw';
import mdDebounce from '../content/js/debounce-throttle.md?raw';
import mdPromises from '../content/js/promise-polyfills.md?raw';
import mdAsync from '../content/js/async-orchestration.md?raw';
import mdDeepCopy from '../content/js/deep-copy.md?raw';
import mdComposition from '../content/js/composition-utils.md?raw';
import mdHooks from '../content/js/react-hook-patterns.md?raw';

// System Design — Micro Frontends
import mdWhyMfe from '../content/sd/why-mfe.md?raw';
import mdArchitecture from '../content/sd/architecture-shell.md?raw';
import mdFederation from '../content/sd/module-federation.md?raw';
import mdHygiene from '../content/sd/bundle-hygiene.md?raw';
import mdLoading from '../content/sd/loading-strategy.md?raw';
import mdNavPerf from '../content/sd/navigation-performance.md?raw';
import mdComms from '../content/sd/communication-routing.md?raw';
import mdResilience from '../content/sd/resilience-isolation.md?raw';
import mdDeploy from '../content/sd/deployment-versioning.md?raw';
import mdSsr from '../content/sd/ssr-bff.md?raw';
import mdScaling from '../content/sd/scaling-governance.md?raw';
import mdMigration from '../content/sd/migration-strangler.md?raw';
import mdJourney from '../content/sd/full-journey.md?raw';
import mdQa from '../content/sd/interview-qa.md?raw';

// Interview Kit
import mdChecklist from '../content/kit/final-checklist.md?raw';

const jsLessons = [
  {
    id: 'this-bind-call-apply',
    title: 'this, bind, call & apply',
    subtitle: 'The most-asked polyfill round — with the new-support edge case that separates senior answers.',
    difficulty: 'medium',
    time: '15 min',
    tags: ['polyfills', 'this'],
    md: mdThisBind,
  },
  {
    id: 'currying-closures',
    title: 'Currying & Closures',
    subtitle: 'Fixed-arity curry, infinite sum chains, and the two loop questions you must not fumble.',
    difficulty: 'medium',
    time: '12 min',
    tags: ['closures', 'fp'],
    md: mdCurrying,
  },
  {
    id: 'debounce-throttle',
    title: 'Debounce & Throttle',
    subtitle: 'One waits for silence, one enforces a rate — pick the right one and implement both.',
    difficulty: 'easy',
    time: '10 min',
    tags: ['rate limiting'],
    md: mdDebounce,
  },
  {
    id: 'promise-polyfills',
    title: 'Promise Combinator Polyfills',
    subtitle: 'all / allSettled / race / any from scratch, with every trap they check for.',
    difficulty: 'medium',
    time: '15 min',
    tags: ['promises'],
    md: mdPromises,
  },
  {
    id: 'async-orchestration',
    title: 'Async Orchestration',
    subtitle: 'Series runners, thunks vs promises, and the concurrency-pool escalation.',
    difficulty: 'hard',
    time: '15 min',
    tags: ['promises', 'patterns'],
    md: mdAsync,
  },
  {
    id: 'deep-copy',
    title: 'Deep Copy with Circular Refs',
    subtitle: 'WeakMap-based cloning, why JSON round-tripping fails, and structuredClone.',
    difficulty: 'medium',
    time: '10 min',
    tags: ['recursion'],
    md: mdDeepCopy,
  },
  {
    id: 'composition-utils',
    title: 'Composition & Object Utilities',
    subtitle: 'lodash-style flow, dotted-key object building, and the binary search warm-up.',
    difficulty: 'easy',
    time: '10 min',
    tags: ['fp', 'dsa'],
    md: mdComposition,
  },
  {
    id: 'react-hook-patterns',
    title: 'React Hook Patterns',
    subtitle: 'useUpdateEffect, useDebouncedValue, the cleanup contract, and stale closures.',
    difficulty: 'medium',
    time: '15 min',
    tags: ['react', 'hooks'],
    md: mdHooks,
  },
];

const sdLessons = [
  {
    id: 'why-mfe',
    title: 'Why Micro Frontends Exist',
    subtitle: 'The organizational framing, requirement gathering, and NFRs — your opening five minutes.',
    difficulty: 'easy',
    time: '12 min',
    tags: ['framing'],
    md: mdWhyMfe,
  },
  {
    id: 'architecture-shell',
    title: 'Architecture & the App Shell',
    subtitle: 'The layer diagram, shell responsibilities, granularity, and why Module Federation beats the alternatives.',
    difficulty: 'medium',
    time: '15 min',
    tags: ['architecture'],
    md: mdArchitecture,
  },
  {
    id: 'module-federation',
    title: 'Module Federation',
    subtitle: 'remoteEntry manifests, runtime negotiation, and Webpack vs Vite federation.',
    difficulty: 'medium',
    time: '12 min',
    tags: ['federation'],
    md: mdFederation,
  },
  {
    id: 'bundle-hygiene',
    title: 'Bundle Hygiene — the 3-Step System',
    subtitle: 'singleton + peerDependencies + CI gate. The silent killers chapter — asked deep.',
    difficulty: 'hard',
    time: '15 min',
    tags: ['dependencies'],
    md: mdHygiene,
  },
  {
    id: 'loading-strategy',
    title: 'Loading Strategy — Three Tiers',
    subtitle: 'Eager shell, lazy MFEs, hover prefetch — and the math that justifies each tier.',
    difficulty: 'medium',
    time: '10 min',
    tags: ['performance'],
    md: mdLoading,
  },
  {
    id: 'navigation-performance',
    title: 'First Load & Return Visits',
    subtitle: 'CDN + Brotli + critical CSS for first paint; hashing + service worker for everything after.',
    difficulty: 'medium',
    time: '15 min',
    tags: ['performance', 'caching'],
    md: mdNavPerf,
  },
  {
    id: 'communication-routing',
    title: 'Communication & Routing',
    subtitle: 'The coupling ladder, custom events, auth context, and who owns browser history.',
    difficulty: 'medium',
    time: '15 min',
    tags: ['patterns'],
    md: mdComms,
  },
  {
    id: 'resilience-isolation',
    title: 'Resilience & Isolation',
    subtitle: 'Error boundaries per slot, CSS isolation, shell-down scenarios, and observability.',
    difficulty: 'medium',
    time: '15 min',
    tags: ['reliability'],
    md: mdResilience,
  },
  {
    id: 'deployment-versioning',
    title: 'Deployment & Versioning',
    subtitle: 'Manifest-driven discovery, contract tests, canary releases, and 5-minute rollbacks.',
    difficulty: 'hard',
    time: '15 min',
    tags: ['ci/cd'],
    md: mdDeploy,
  },
  {
    id: 'ssr-bff',
    title: 'SSR Strategy & the BFF Layer',
    subtitle: 'Route-level SSR/CSR decisions, hydration contracts, and what a BFF actually does.',
    difficulty: 'hard',
    time: '12 min',
    tags: ['ssr'],
    md: mdSsr,
  },
  {
    id: 'scaling-governance',
    title: 'Scaling to 15 Teams',
    subtitle: 'Request deduplication, design-system upgrades, and self-service governance.',
    difficulty: 'hard',
    time: '15 min',
    tags: ['staff-level'],
    md: mdScaling,
  },
  {
    id: 'migration-strangler',
    title: 'Cross-Framework Migration',
    subtitle: 'The Strangler Fig playbook: Angular → React with three integration patterns.',
    difficulty: 'hard',
    time: '15 min',
    tags: ['migration'],
    md: mdMigration,
  },
  {
    id: 'full-journey',
    title: 'The Full User Journey',
    subtitle: 'Narrate the entire lifecycle — cold load to crash recovery — as one story.',
    difficulty: 'medium',
    time: '10 min',
    tags: ['synthesis'],
    md: mdJourney,
  },
  {
    id: 'interview-qa',
    title: 'Q&A Bank & Answer Checklist',
    subtitle: 'Standard grilling, curveballs, and the 14-step answer skeleton.',
    difficulty: 'hard',
    time: '20 min',
    tags: ['rehearsal'],
    md: mdQa,
  },
];

const kitLessons = [
  {
    id: 'final-checklist',
    title: 'The Night-Before Checklist',
    subtitle: 'Retrieval practice for the last 24 hours — coding, machine coding, and system design.',
    time: '10 min',
    tags: ['revision'],
    md: mdChecklist,
  },
];

// attach trackIds
jsLessons.forEach((l) => (l.trackId = `js-${l.id}`));
sdLessons.forEach((l) => (l.trackId = `sd-${l.id}`));
kitLessons.forEach((l) => (l.trackId = `kit-${l.id}`));

export const lessonSections = {
  js: { label: 'JavaScript Deep Dive', basePath: '/topic', lessons: jsLessons },
  sd: { label: 'System Design · Micro Frontends', basePath: '/sd', lessons: sdLessons },
  kit: { label: 'Interview Kit', basePath: '/kit', lessons: kitLessons },
};

// Sidebar navigation tree
export const curriculum = [
  {
    title: 'JavaScript Deep Dive',
    items: jsLessons.map((l) => ({
      title: l.title,
      path: `/topic/${l.id}`,
      trackIds: [l.trackId],
    })),
  },
  {
    title: 'Event Loop Arena',
    items: [
      {
        title: 'Output Prediction Drills',
        path: '/drills',
        trackIds: drills.map((d) => d.trackId),
      },
    ],
  },
  {
    title: 'Machine Coding Lab',
    items: challenges.map((c) => ({
      title: c.title,
      path: `/challenge/${c.id}`,
      trackIds: [c.trackId],
    })),
  },
  {
    title: 'System Design · MFE',
    items: sdLessons.map((l) => ({
      title: l.title,
      path: `/sd/${l.id}`,
      trackIds: [l.trackId],
    })),
  },
  {
    title: 'Interview Kit',
    items: [
      {
        title: 'One-liner Flashcards',
        path: '/flashcards',
        trackIds: ['kit-flashcards'],
      },
      ...kitLessons.map((l) => ({
        title: l.title,
        path: `/kit/${l.id}`,
        trackIds: [l.trackId],
      })),
    ],
  },
];

// Home page cards
export const homeSections = [
  {
    title: 'JavaScript Deep Dive',
    icon: '🧠',
    path: '/topic/this-bind-call-apply',
    desc: 'Polyfills, closures, promises, and async patterns — with the follow-up each one triggers.',
    trackIds: jsLessons.map((l) => l.trackId),
  },
  {
    title: 'Event Loop Arena',
    icon: '🔄',
    path: '/drills',
    desc: 'Predict-the-output drills on micro vs macro tasks. Reveal, self-grade, master.',
    trackIds: drills.map((d) => d.trackId),
  },
  {
    title: 'Machine Coding Lab',
    icon: '⚙️',
    path: `/challenge/${challenges[0].id}`,
    desc: 'Six classic UI rounds with live demos, annotated solutions, and escalations.',
    trackIds: challenges.map((c) => c.trackId),
  },
  {
    title: 'System Design · MFE',
    icon: '🏗️',
    path: '/sd/why-mfe',
    desc: 'A 14-chapter micro-frontend architecture course, from framing to staff-level scaling.',
    trackIds: sdLessons.map((l) => l.trackId),
  },
  {
    title: 'Interview Kit',
    icon: '🎯',
    path: '/flashcards',
    desc: 'Flashcards and the night-before checklist. The retrieval-practice layer.',
    trackIds: ['kit-flashcards', ...kitLessons.map((l) => l.trackId)],
  },
];

export const allTrackableIds = [
  ...jsLessons.map((l) => l.trackId),
  ...drills.map((d) => d.trackId),
  ...challenges.map((c) => c.trackId),
  ...sdLessons.map((l) => l.trackId),
  'kit-flashcards',
  ...kitLessons.map((l) => l.trackId),
];
