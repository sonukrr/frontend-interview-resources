## Error isolation — one store burns, the mall stays open

Without boundaries:

```
Cart MFE throws → React unwinds the whole tree → entire page blank
→ user loses their session → Product team gets blamed for Cart's bug
```

The fix — every MFE renders inside its own isolated slot:

```jsx
function MFESlot({ name, children }) {
  return (
    <ErrorBoundary name={name}>                    {/* catches any crash inside */}
      <Suspense fallback={<div>Loading {name}…</div>}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

<MFESlot name="Product"><ProductApp /></MFESlot>
<MFESlot name="Cart"><CartApp /></MFESlot>
```

```jsx
componentDidCatch(error, info) {
  // tag by MFE name — in production this goes to Sentry/Datadog
  reportError({ mfe: this.props.name, error, info });
}
render() {
  if (this.state.error) {
    return (
      <div>
        ⚠ {this.props.name} failed to load
        <button onClick={() => this.setState({ error: null })}>Retry</button>
      </div>
    );
  }
  return this.props.children;
}
```

Result: Cart crashes → its slot shows a tagged fallback with Retry → Product is untouched → the error is logged with the owning team's name. Without this, with 5 teams deploying independently, a full-page outage becomes a near-daily incident.

## Shell bootstrap failure — the P0 scenario

*"Your shell is down. Do all MFEs go down?"* — **Yes.** In a composition model, shell down = nobody can reach the composed app. That's why:

- The shell must be the most stable, least-changing part of the system — treat shell deploys like **infrastructure changes**, with extra approval gates and its own rollback pipeline.
- The CDN serves the shell's static assets — shell *origin* down ≠ CDN down.
- A service worker registered on a previous visit can serve the cached shell to returning users.
- For new users during an outage: a minimal static fallback page from the CDN with a status message and retry.

> One-liner: *"Shell down is a P0. Treat shell deploys like infrastructure changes, not feature releases."*

## CSS isolation — stores don't redecorate each other

The problem: Cart ships `.button { background: red }` and every button on the page — including Product's — turns red.

| Approach | How it works | Trade-off |
|---|---|---|
| **CSS Modules** (default) | `.button` → `.button_abc123` at build time | Best balance — use unless you have a reason not to |
| Shadow DOM | True browser isolation boundary per MFE | Breaks shared fonts and design tokens |
| CSS-in-JS | Styles scoped at runtime | Extra JS weight, runtime cost |
| BEM + namespace | `.cart__button` by convention | No tooling — relies on discipline |

**Production recommendation:** CSS Modules for component styles + **CSS Variables for design tokens** injected by the shell:

```css
/* shell injects globally */
:root {
  --ds-brand-primary: #222;
  --font-base: 'Inter', sans-serif;
}

/* every MFE uses variables, never hardcoded values */
.button { background: var(--ds-brand-primary); }
```

This split also solves brand updates: change the variable in the shell and all 15 MFEs update **instantly, without a single redeploy**.

## Observability — you can't debug 15 MFEs by vibes

At 2 MFEs, manual tracing works. At 15, it's impossible. The kit:

- **Error boundaries everywhere**, errors tagged with `mfe_name` + `mfe_version`.
- **Correlation IDs** on every request — trace a single user click from the shell, through the MFE, down to the failing backend microservice (OpenTelemetry).
- **Centralized logging** — every MFE emits to the same pipeline.
- **Core Web Vitals per MFE route** — so a regression is attributable to a team.
- Traffic, latency, and error rate per MFE in Prometheus/APM dashboards.

### Visual regression for shared MFEs

A shared Header MFE can break every page at once. Guard it with **Playwright visual regression testing**: golden screenshots per MFE, CI fails on pixel mismatch, tests run in Docker so fonts and rendering are identical between local machines and CI.

## The debug drill — MFE works locally, breaks in production

A curveball with a systematic answer. Walk it in order:

1. Is `remoteEntry.js` resolving in production? URL, CDN cache, CORS headers.
2. Console: Module Federation shared-scope negotiation errors?
3. Do shared dependency versions match between shell and MFE **in the production builds**?
4. Network tab: is the MFE bundle loading, and is it the right version?
5. Correlation ID → centralized logs → which layer failed?
6. The common culprit: **environment variables baked into the bundle at build time** differ between local and prod. Check every `VITE_`/build-time env var.
