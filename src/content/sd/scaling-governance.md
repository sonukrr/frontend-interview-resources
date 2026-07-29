## The evolution question: 2 MFEs → 15

"You built the pilot with two MFEs. What breaks when you scale to fifteen?" Five things — know them cold.

### 1 · Duplicate data fetching

15 MFEs × a `/me` call each = 15 parallel backend hits on page load. The fix is **request deduplication via a shared singleton service** — and the mechanism matters:

> Instead of returning raw data, the service returns a **promise**. The first caller triggers the fetch and the service stores the *in-flight promise*. Every subsequent caller gets that same pending promise. 15 code-level calls collapse into **1 network request.**

```js
let inflight = null;
export function getUser() {
  if (!inflight) {
    inflight = fetch('/me').then((r) => r.json());
  }
  return inflight;   // every MFE awaits the SAME promise
}
```

### 2 · Version and dependency drift

Teams independently upgrade React or API contracts — works in isolation, breaks at runtime. Fix: singleton shared deps + `peerDependencies` + CI compatibility checks + versioned APIs with backward compatibility (the Bundle Hygiene system, enforced platform-wide).

### 3 · Debugging and observability

Manual tracing works at 2 MFEs, is impossible at 15. Fix: correlation IDs, centralized logging, every request tagged with `mfe_name` + `mfe_version` (the Resilience chapter's kit, now mandatory).

### 4 · The platform team becomes a bottleneck

All 15 teams queueing for shell changes, manifest updates, design-system questions. The fix is a posture change — from active management to **self-service governance**:

- **CLI/starter templates** for new MFE onboarding: clone, register your remoteEntry in the manifest, you're unblocked.
- **Automated CI gates** validate manifest updates and contracts — no human review per deploy.
- The platform team focuses on the *engine* (orchestration, performance, theming); feature teams own the *driver's seat* (product logic).

### 5 · Design system upgrades across 15 teams

You can't coordinate a synchronized upgrade. The system:

- **Design tokens as CSS variables**, injected by the shell: rebrand = change the variable once, all MFEs update instantly with zero redeploys.
- **The component library is a `peerDependency`** — upgrades are opt-in; the shell pins a minimum version and CI enforces the floor.
- **Breaking changes**: semantic versioning, deprecation warnings in old versions, migration guides, **codemods** to automate mechanical migrations — teams upgrade on their own schedule within a defined window.
- Sub-path versioning (`@ds/v3`) when two majors must coexist.

## Ownership conflicts — the organizational curveball

*"Two teams want to own the same UI component."* This is an organizational problem, not a technical one. Three options:

1. **Design system owns it** — both consume it as a shared package. When the component is truly generic.
2. **The domain team owns it** — the other team consumes it via the MFE's exposed API. When it has clear domain ownership.
3. **Intentional divergence** — each team keeps their own version. When requirements genuinely differ and forced sharing creates more coupling than value.

> Rule of thumb (and one-liner): *"If two teams are debating ownership of a component, it probably belongs in the design system."*

## Convincing the skeptic

*"A senior engineer says MFE is over-engineering. Convince them."* — Don't argue technology; argue pain:

> "How many times this quarter did your deploy get blocked by another team's bug? How long did onboarding your last hire take? How often do you get merge conflicts on files your team doesn't own?"

MFE solves those problems. **If those problems don't exist, MFE *is* over-engineering** — conceding that is what makes the answer credible.

## Governance summary — the platform team's contract

| Concern | Mechanism |
|---|---|
| New team onboarding | Self-service starter template + manifest registration |
| Contract safety | Contract manifest + CI validation per deploy |
| Dependency drift | Singleton + peerDeps + CI compatibility matrix |
| Bundle discipline | Per-MFE size budgets enforced in CI |
| Visual safety of shared MFEs | Playwright visual regression with golden images in Docker |
| Brand/theming | Shell-injected CSS variables |

The closing frame: these architectures exist to support **team autonomy**. The goal isn't just a fast website — it's a system where 15 teams can deploy 15 times a day without ever needing a meeting with each other.
