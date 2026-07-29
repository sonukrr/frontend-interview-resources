## The architecture — layer by layer

```
┌──────────────────────────────────────────────────┐
│              CDN / Edge Layer                    │
│        CloudFront · Caching · Geo-routing        │
│  (Serves the JS bundles to users globally fast)  │
└─────────────────────┬────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────┐
│              App Shell  (host)                   │
│   Routing · Auth · Shared Nav · Error Boundaries │
│         THE MALL BUILDING — owns the frame       │
└──────┬──────────────┬───────────────────┬────────┘
       │              │                   │
┌──────▼──────┐ ┌─────▼──────┐    more MFEs...
│ Product MFE │ │  Cart MFE  │
│ Team: Store │ │Team:Checkout│
└──────┬──────┘ └─────┬──────┘
       │              │
┌──────▼──────────────▼──────────────────────────┐
│           Shared npm packages                  │
│     react · react-dom · react-router-dom       │
│   (loaded ONCE, shared across all MFEs)        │
└────────────────────────────────────────────────┘
```

## The app shell — the mall building

The shell is the first thing the browser loads. It owns the page frame — header, navigation, routing, auth context, error boundaries. It has **zero business logic** of its own.

```jsx
function Layout() {
  return (
    <div>
      <h1>ECommerce</h1>
      <nav>
        <NavLink to="/products">Products</NavLink>   {/* shell's nav */}
        <NavLink to="/cart">Cart</NavLink>
      </nav>
      <Outlet />   {/* MFEs render here, inside the shell's frame */}
    </div>
  );
}
```

The `<Outlet />` is the "store slot" in the mall. The shell stays mounted; only the slot content swaps on navigation — no full page reload.

**If you skip the shell:** every MFE becomes its own website. Full white flash on every navigation; header/nav duplicated in every MFE and kept in sync by hand.

> One-liner to deliver: *"The shell should be boring — routing, error boundaries, composition. Nothing else. Target under 50KB."*

## MFE granularity — how small is too small?

| Granularity | Too fine | Too coarse |
|---|---|---|
| Example | One MFE per UI component | One MFE for an entire product vertical |
| Problem | Explosion of remoteEntry files, version management nightmare, network overhead | Back to a mini-monolith; teams still coupled |

**Rule of thumb: one MFE per team**, owning a vertical slice of the product. If two teams regularly modify the same MFE, it's too coarse. If one team owns five MFEs, they're too fine.

## Composition approaches — why Module Federation over the alternatives

You must compare alternatives before choosing. The expected tour:

### iFrames
- Strongest isolation — a completely separate browsing context.
- **Use when:** embedding third-party content, or hard security boundaries (payments widget).
- **Why not as the platform:** poor UX (scrolling, focus, resize), no shared state or styling, invisible to SEO.

### Web Components
- Framework-agnostic boundary — works across React, Vue, Angular.
- **Use when:** teams genuinely use different frameworks.
- **Why not here:** if everyone is on React, shadow DOM and custom-element lifecycle add complexity with no benefit.

### npm packages (shared component library)
- **This is not MFE** — it's a design system. No independent deployment: consumers must bump the dependency and redeploy. Use it *alongside* MFE for shared UI, tokens, and utilities.

### single-spa
- An orchestrator framework for multiple SPAs. More opinionated; another layer to learn. Module Federation achieves runtime composition with less machinery when you're already on Webpack/Vite.

### Module Federation (chosen)
- **Runtime composition** — the shell loads MFE bundles at runtime, not build time.
- Independent deploys without shell redeploys.
- Shared dependency negotiation — one React instance across all MFEs.
- Best fit for same-framework teams wanting runtime composition.

| | Isolation | Shared deps | Independent deploy | UX quality |
|---|---|---|---|---|
| iFrame | ★★★ | ✗ | ✓ | ✗ |
| Web Components | ★★ | partial | ✓ | ✓ |
| npm packages | ✗ | build-time | ✗ | ✓ |
| Module Federation | ★ | runtime | ✓ | ✓ |

## MFE vs staying a single SPA — the honest trade-off table

| | MFE | Single SPA |
|---|---|---|
| Deployments | Independent | Coupled |
| Failure isolation | Yes | No |
| Cross-app coordination | Harder | Easier |
| Duplicate logic | Yes — auth, data fetching | Shared naturally |
| Team autonomy | High | Low |

Bringing this up unprompted — including the costs — is what separates architect-level answers from senior-level ones.
