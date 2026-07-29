## How to use this chapter

Rapid-fire rehearsal. Cover the answer, say yours out loud, compare. The standard set first, then the curveballs. Every answer here is compressed to what you'd actually say.

## Standard grilling

**Q: Your shell loads MFEs lazily. What happens to LCP if the shell itself is heavy?**
Shell must be minimal — routing, navbar, error boundaries only; no business logic; target under 50KB; critical CSS inlined. The shell's job is to boot fast and get out of the way.

**Q: How do you handle a design system upgrade across 15 MFEs?**
It's a peerDependency — upgrades are opt-in; breaking changes are versioned; teams migrate on their own schedule; the shell pins a minimum version and CI enforces the floor. Tokens are CSS variables from the shell, so visual refreshes don't even need redeploys.

**Q: How do you prevent a rogue MFE from importing a different React version?**
Singleton config forces one instance at runtime — a mismatched remote gets the shell's version with a warning. The CI dependency-compatibility check catches drift before deploy. peerDependencies stops the accidental local install from being bundled.

**Q: How do you test an MFE in isolation vs integrated?**
Isolation: standalone against a mock shell (stubbed events, auth, routing), on every deploy. Integration: contract tests in CI (can the shell load and mount me?), plus a composed-app E2E suite in staging on a slower cycle.

**Q: Your canary is at 0.1%. How long before increasing?**
24–48h per stage to capture day/night patterns. Promote when error rate ≤ baseline, LCP in target, no P1s — automated via the feature flag.

**Q: What's your rollback strategy?**
A CDN operation: repoint the manifest at the previous remoteEntry URL and purge cache — under 5 minutes, no shell redeploy. During migration, the webgate flag can cut traffic back to the monolith instantly.

**Q: How do you onboard a new team?**
Self-service starter template (federation config, CI/CD, contract manifest pre-wired). Clone, register your remoteEntry in the manifest, unblocked. Platform owns the shell; product teams own their MFEs.

## Curveballs

**Q: Your MFE works locally but breaks in production. Debug it.**
In order: (1) is remoteEntry resolving — URL, CDN cache, CORS; (2) console for shared-scope negotiation errors; (3) do shared dep versions match in the *production builds*; (4) network tab — right bundle, right version; (5) correlation ID through centralized logs; (6) the usual culprit — build-time env vars differing between local and prod.

**Q: Two teams want to own the same component.**
Organizational, not technical. Truly generic → design system. Clear domain → the domain team exposes it. Genuinely different requirements → diverge intentionally. If you're debating ownership at all, it probably belongs in the design system.

**Q: A senior engineer says MFE is over-engineering.**
Argue pain, not technology: how often were your deploys blocked by another team's bug? How long was onboarding? Merge conflicts on files you don't own? If those problems don't exist — they're right, it *is* over-engineering.

**Q: Your shell is down. Do all MFEs go down?**
Yes — composition requires the shell. Which is why the shell is the most stable part: own SLA and monitoring, high-risk deploy gates, CDN-served assets, SW-cached shell for returning users, static fallback page for new ones.

**Q: What if navigation doesn't update the URL?**
SEO and UX break — crawlers index URLs, deep links die, back/forward misbehaves. Every navigation must pushState; it's a silent bug that surfaces weeks later in an SEO audit, so test it explicitly.

**Q: The design system team wants to move to Web Components.**
Not catastrophic: React renders custom elements, so ship both React wrappers and native elements during transition; federation still works for Web-Component MFEs; long-term, no React to deduplicate weakens one reason for MF but composition stays. Align timing with React major upgrades (19+ improved custom-element support).

**Q: How do you handle auth token expiry inside an MFE?**
Cross-cutting → shell-owned. Shared HTTP client (federated shared module) with a refresh interceptor: on 401, refresh, queue pending requests, retry; on failure, fire `auth:session-expired`, shell redirects to login. MFEs never touch refresh logic.

**Q: Two MFEs on one page — Coupons and Deals widgets side by side?**
`Promise.all` both imports; remoteEntries load in parallel; shared deps negotiated once; each widget in its own error boundary. Constraint: both must be built as widgets — no full-page assumptions, no page-level routing.

## The answer checklist — your interview skeleton

Use this order when the MFE question drops:

1. **Start with the problem** — team coupling, deploy coordination, monolith pain. Frame: organizational, not performance.
2. **Gather requirements** — current state, target state, NFRs. Commit to numbers.
3. **Draw the layers** — CDN → Shell → MFEs → shared packages → CI/CD.
4. **Explain the shell** — routing, auth, error isolation; zero business logic.
5. **Federation** — remoteEntry manifest, lazy imports, runtime negotiation.
6. **Bundle hygiene** — singleton + peerDeps + CI gate; why silent failures are the worst kind.
7. **Loading strategy** — eager shell / lazy MFEs / hover prefetch.
8. **Navigation performance** — CDN + Brotli + critical CSS for first load; hashing + SW for return visits.
9. **Communication ladder** — events → URL → shell context → shared modules; never direct imports.
10. **Routing ownership** — shell owns history; MFEs fire events; URL is source of truth.
11. **Error isolation** — boundary per slot, tagged logging.
12. **CSS isolation** — CSS Modules + token variables.
13. **Deployment** — per-team CI/CD, manifest-driven versions, canary, 5-minute rollback.
14. **Trade-offs — bring them up unprompted.** That's the architect signal.
