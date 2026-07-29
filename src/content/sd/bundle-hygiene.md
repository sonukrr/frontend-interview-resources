## Why this chapter matters most

Duplicate dependencies are the **silent killers of MFE performance**. They don't throw errors. They don't log warnings. They quietly add hundreds of KB to every page load:

```
Without any shared dependency config:

  Shell   loads React 18 → 150KB downloaded ✓
  Product loads React 18 → 150KB downloaded ← DUPLICATE
  Cart    loads React 18 → 150KB downloaded ← DUPLICATE

  Total: 450KB — 300KB of it pure waste.
  Worse: two React instances = two virtual DOMs = context does not
  cross MFE boundaries.
```

The worst part: **this fails silently.** The page works — just 3× heavier, and with subtly broken context propagation.

Interviewers ask this deep. Know the **3-step system**: runtime lock, build-time lock, CI gate.

## Step 1 — Runtime sharing: `singleton: true`

The shell and all MFEs negotiate a single shared copy of React at runtime.

```js
// shell config
shared: {
  react: {
    singleton: true,        // only ONE copy allowed across all MFEs
    eager: true,            // shell ships it in its own initial bundle
    requiredVersion: '^18.2.0',
  },
  'react-dom': { singleton: true, eager: true },
  'react-router-dom': { singleton: true },
}
```

```js
// each MFE's config
shared: {
  react: {
    singleton: true,
    // NO eager here — MFEs rely on the shell's copy
    requiredVersion: '^18.2.0',
  },
  'react-dom': { singleton: true },
}
```

**Why `eager: true` only on the shell:** the shell includes React in its initial bundle so it's available immediately. If an MFE also set `eager`, it would race the shell at startup and risk two React instances loading simultaneously.

```
With shared + singleton:
  Shell   loads React → 150KB ✓
  Product reuses shell's copy → 0KB
  Cart    reuses shell's copy → 0KB
  Total: 150KB — 66% saved
```

## Step 2 — Build-time contract: `peerDependencies`

Runtime sharing alone isn't enough. A developer can `npm install react` in an MFE repo and the bundler will happily bundle a private React copy — **bypassing the shared config entirely.** No warning. Silent 150KB regression.

```json
// each MFE's package.json
{
  "peerDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

The declaration means: *"I will NOT bundle React. I expect my host to provide it. If it doesn't, fail loudly at runtime — not silently with bloat."*

## Step 3 — CI version-compatibility gate

Even with singleton, what if an MFE requires React 19 while the shell provides 18? Module Federation logs a warning and **uses the shell's version** — the MFE may break subtly (hooks that behave differently across majors). Catch it before merge:

```
[CI] Checking shared dependency compatibility...
  shell provides:   react ^18.2.0
  product requires: react ^18.2.0  ✓ compatible
  cart requires:    react ^19.0.0  ✗ INCOMPATIBLE — pipeline blocked
```

## What happens if you skip each step

| Skipped | Consequence |
|---|---|
| No `singleton` | 150KB × N MFEs on every page visit |
| No `peerDependencies` | An MFE silently bundles its own React despite the singleton config |
| No CI check | A version mismatch ships silently; hooks break in unexpected ways |
| Two React instances running | **`useContext` stops working across MFE boundaries** — auth context and themes silently stop propagating |

That last row is the hardest bug in the whole architecture to debug, because everything looks correct locally. It's also the punchline interviewers wait for:

> "Two React instances means `useContext` silently stops working. Auth context dies. Nobody notices until production."

## Bundle size budgets — the enforcement layer

- Each MFE has a **bundle size budget enforced in CI** (e.g., 100KB uncompressed); the build fails over budget.
- Shared deps (React, Router) don't count against MFE budgets — the shell loads them.
- Regular audits with a bundle analyzer to catch accidental heavy imports.

> The pair of one-liners that closes this topic: *"`peerDependencies` is the build-time lock. `singleton` is the runtime lock. You need both."*
