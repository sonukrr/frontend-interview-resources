## SSR vs CSR — decide per route, not per app

The hybrid strategy, with the reasoning interviewers want to hear:

| Page | Strategy | Reason |
|---|---|---|
| Listing pages (`/hotels/bangkok`) | SSR | SEO-critical |
| Detail pages | SSR | Rich meta, schema markup |
| Landing/destination pages | SSR | SEO |
| Homepage | Hybrid — SSR shell + CSR hydration | Above-the-fold LCP |
| Search results with filters | CSR | User-driven, not indexed |
| Account/profile | CSR | No SEO need |
| Booking/payment | CSR | Transactional |
| Personalized dashboards | CSR | Per-user content |

The rule of thumb: **SSR is reserved for SEO-critical, high-traffic landing pages** (optimizes LCP and indexing). **CSR for authenticated, highly interactive tools** (saves server cost, fluid SPA feel).

## How SSR coexists with an MFE shell

This is a known tension — resolve it with **route-level ownership**:

- The routing layer (webgate) sends `/deals` to the Deals SSR service and `/coupons` to the SPA shell.
- **Do not compose SSR fragments inside a CSR shell** — that path leads to hydration mismatches and layout shift.
- The SSR MFE owns its **full HTML response** for its routes.
- Initial data is injected as `window.__INITIAL_DATA__ = {...}` so hydration doesn't refetch.

> One-liner: *"SSR and MFE are in tension. Resolve it with route-level ownership, not fragment composition."*

**Staff-level nuance to add:** maintain an *isomorphic contract* — `typeof window` guards and the `__INITIAL_DATA__` convention — so a route can toggle between SSR and CSR modes without code changes.

## FOUC prevention in SSR

*"How do you prevent flash-of-unstyled-content?"* — Inline **critical CSS** in the `<head>` during the server render: a style collector (Styled Components' `ServerStyleSheet`, Emotion's cache) extracts the CSS for exactly the components that rendered and injects it as a `<style>` block. The page is fully styled before any JS downloads.

## The BFF layer

A Backend-for-Frontend sits between the frontend and the microservices. What it does:

- **API aggregation** — a search page hits 6–8 microservices; the BFF combines them into one frontend-shaped response.
- **Auth/session** — validates tokens, manages cookies, SSO.
- **SSR** — renders initial HTML (`renderToString`) when hand-rolled rather than framework-provided.
- **Data transformation** — backend responses → flat, frontend-friendly shapes.
- **Experiment config** — injects A/B flags per user.
- **Edge caching** — caches aggregated responses for popular queries.

### The decision MFE forces on the BFF

If the BFF is also a monolith, splitting the frontend raises the question: **one shared BFF, or a BFF slice per MFE?** The team-autonomy answer: each team owns a vertical slice — UI, BFF slice, backend API. A shared BFF recreates the deploy coupling you just escaped, one layer down. Acknowledge the cost: more services to operate, and cross-cutting concerns (auth, rate limiting) need a shared platform layer or gateway.

## SSR + Module Federation — the honest caveat

Federation tooling is weakest around SSR (especially Vite's federation plugin). If SSR-heavy MFEs are core to the product, say you'd evaluate Webpack MF's better-documented SSR story or a framework with first-class federation support — choosing tooling per constraint is exactly the judgment being tested.
