## The deployment flow — each team ships alone

```
Cart team finishes a feature
  ↓ Cart CI pipeline: build → unit tests → contract validation
  ↓ dependency compatibility check
  ↓ upload dist/ to S3/CDN:  cdn.example.com/cart/v3.1.0/
  ↓ update manifest.json:    { "cart": "v3.1.0" }
  ↓ purge CDN cache for cart's remoteEntry.js
  ↓ shell picks up the new version on next page load
  → zero coordination with any other team
```

> The whole point, as a one-liner: *"Independent deploy means the shell must never need to redeploy for an MFE change."*

## Dynamic discovery — the manifest pattern

If the shell hardcodes `cdn.example.com/cart/v2.0.0/remoteEntry.js`, every Cart release needs a shell redeploy. Instead:

- A `manifest.json` on the CDN acts as a **service registry**: MFE name → current remoteEntry URL.
- Each MFE's pipeline writes its entry to the manifest on deploy.
- The shell fetches the manifest **at runtime** and resolves remotes from it (promise-based remotes / a generic MFE wrapper), so **new MFEs can be added without touching shell code or config**.

**Manifest CDN down — the fallback chain:** hardcoded last-known-good URL per MFE in the shell → service worker's cached remoteEntry → graceful degradation. Never a blank page.

## Protecting against breaking changes

**Intentional changes** — never rename an exposed module in place. Deprecation pattern: add the new export → migrate the shell → remove the old one.

**Unintentional changes** — a **contract manifest** (a protected file per MFE describing what it exposes). CI validates each build's output against the contract and fails the pipeline if the contract would break.

> One-liner: *"Contract manifest prevents accidental breaking changes. The deprecation pattern prevents intentional ones."*

## Canary, not A/B — and why the distinction matters

> "Since we're not adding features, A/B testing is the wrong tool. **A/B is for feature optimization. Canary is for deployment safety.**"

Mechanics: a routing layer (webgate) between CDN and UI splits traffic — `/hotels` to the monolith, `/new-hotels` to the MFE — controlled by a feature flag percentage. Start at **0.1%**, measure, increase progressively.

*"How long at each stage?"* — Minimum 24–48 hours to capture full day/night traffic patterns. Gate promotion on: error rate ≤ baseline, LCP within target, no P1 alerts. Automate promotion via the flag when gates pass.

## Rollback — a CDN operation, not a redeploy

Point the manifest back at the previous `remoteEntry.js` URL and purge the CDN cache. **Target: under 5 minutes.** During a migration, the webgate flag can also cut traffic back to the monolith instantly. No shell redeploy in either path.

## Testing when everything deploys independently

You cannot run full integration tests on every deploy of every MFE — too slow. Layer it:

| Layer | What | When it runs |
|---|---|---|
| **MFE-level E2E** | Each MFE tested in isolation against a mock shell (stubbed events, auth, routing) | Every MFE deploy |
| **Contract tests** | Shell verifies it can load and mount each MFE's exposed API | CI, before every MFE deploy |
| **Composition E2E** | Shared suite against the fully composed staging app, pinned MFE versions | Nightly / before major releases |

The insight to state: **contract tests catch interface breakage fast; full E2E catches integration issues on a slower cycle.** Playwright for the cross-MFE user flows.

## Monorepo vs polyrepo

At 15 teams, autonomy outweighs central control → **polyrepo**, with consistency enforced through shared standards: a platform-maintained MFE starter template (pre-wired federation config, CI/CD, contract manifest), shared npm packages for the design system and utilities.

(For a small pilot, a monorepo with a root orchestration `package.json` — install/build/serve all apps with one command — is a fine local-dev convenience. Know that it's a dev-time tool: it shares no dependencies and doesn't exist in production.)
