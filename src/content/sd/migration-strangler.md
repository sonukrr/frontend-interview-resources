## The scenario

An Angular 16 monolith with multiple business flows and a significant shared component library. Goal: migrate to React incrementally — **no big-bang rewrite** — while preparing for a future MFE architecture. This chapter is a real playbook; in an interview, "in my current migration we solved this by…" lands very differently from theory.

## The strategy — Strangler Fig

Don't rewrite; strangle incrementally. New flows go to React. Old flows stay in Angular until they're worth migrating. **The Angular shell is deprecated last, not first.**

Four phases:

1. **Foundation** — React repo, Nginx routing, Web Component bundling working.
2. **Parallel development** — new features in React; strategic component migration.
3. **Flow migration** — one complete flow as pilot; evaluate, refine.
4. **MFE** — split into independently deployable micro-frontends; deprecate the Angular shell.

## The three integration patterns — know when to use each

### Pattern 1 · Nginx routing — for complete new flows

```
/new-flow  → Nginx → React app
/insights  → Nginx → Angular app
```

Full isolation, independent deploys, clean separation. Trade-off: shared state across apps needs an explicit strategy (session storage + custom events). **Use when** building a complete new flow or migrating an entire page.

### Pattern 2 · Web Components — for widgets inside Angular pages

A React component wrapped as a custom element, loaded into an Angular template. Angular just sees an HTML tag. Enables gradual component migration without touching Angular routing.

Trade-off — say this unprompted: **the React runtime gets bundled into the Web Component**, inflating the Angular bundle. That's a consciously accepted Phase-1 cost to move fast. Props/events also need serialization across the boundary. **Use when** a shared widget must live inside an existing Angular page *today*.

### Pattern 3 · Module Federation — for high-traffic shared components

The React app exposes components via remote entry; Angular loads them at runtime. **One React runtime, shared** — this is what fixes the Web Component duplication. Trade-off: more complex build setup. **Use when** a component appears across many Angular pages and Web Component bloat is unacceptable.

### Selection matrix

| Use case | Pattern | Why |
|---|---|---|
| New complete flow | Nginx routing | Full isolation, clean architecture |
| Shared widget in an existing Angular page | Web Component | Works within existing pages today |
| High-traffic component used everywhere | Module Federation | One runtime, lazy loaded |
| Experimental feature | Nginx routing | Easy to remove |

## State across the framework boundary

- **Auth/user context:** session storage + HTTP-only cookies; both frameworks read the same cookie on API calls; custom events notify on session change.
- **Feature state:** isolated per framework (NgRx/services vs Zustand). **Never share state stores directly across frameworks.**
- **Cross-boundary communication:** custom events or shared API calls.

## Decision rules for new work during migration

| Situation | Where it goes |
|---|---|
| Bug fix in existing code | Angular |
| New complete flow | React (Nginx routing) |
| New component used across many Angular pages | Web Component / Module Federation |
| Long-lifespan component (2+ years) | React |
| Temporary/experimental feature | Angular (less investment) |

## The hard questions on this playbook

**Who owns routing during the transition?** — Nginx owns top-level routing by URL prefix. Angular Router owns Angular pages; React Router owns React pages. The shared nav is a React Web Component embedded in the Angular shell so it renders consistently on both sides — and becomes part of the React shell when Angular is deprecated.

**How do you avoid two React copies (Web Components + React app)?** — In Phase 1 you can't fully avoid it; it's the accepted cost. The real fix is Phase 3: Module Federation serves components from one shared React runtime, and Web Components are phased out.

**When do you deprecate the Angular shell?** — Not on a calendar date; on a **migration-completeness threshold**: all flows migrated, the nav replaced by a React shell component, federation stable in production — concretely, when under 10% of traffic hits Angular-owned routes, schedule the deprecation sprint.

**What about the Angular design system?** — Accept temporary visual inconsistency as a migration-speed trade-off. Extract shared design tokens (colors, spacing, typography) into CSS variables consumed by both frameworks; long-term, the React library becomes the source of truth.

**How do you measure whether the migration is working?** — Per phase: React bundle < 300KB, TTI < 3s, FCP < 1.5s, Web Component load < 200ms, Lighthouse before/after each flow, **developer velocity** (time-to-ship in React vs Angular), and **incident rate per framework**. If React pages aren't more stable *and* faster to ship, the migration isn't paying for itself — measuring that honestly is the architect signal.
