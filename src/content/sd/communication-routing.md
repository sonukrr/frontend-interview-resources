## The rule

MFEs must **never** import from each other directly. If Product imports from Cart, Cart can't rename or refactor without breaking Product — you've recreated the coupling you were trying to escape.

## The pattern ladder — low to high coupling

Use in this order; only climb when the lower rung can't solve the problem.

| Pattern | How | Coupling | Use for |
|---|---|---|---|
| Custom events | MFE fires `mfe:navigate`, shell listens | Lowest | Cross-MFE navigation, cart updates, notifications |
| URL state | `/cart?from=product&productId=42` | Low | Lightweight context between MFEs; survives refresh |
| Shell context | `UserContext.Provider` wrapping `<Outlet />` | Medium | Auth, feature flags, theme — things every MFE needs |
| Shared module via MF | Shell exposes a shared HTTP client/store | Higher | Request deduplication, token-refresh logic |

## Pattern 1 — Custom events (the PA system)

Product makes an announcement; the shell hears it and acts:

```js
// Product MFE — after a successful add-to-cart POST:
window.dispatchEvent(new CustomEvent('mfe:navigate', { detail: '/cart' }));
```

```js
// Shell — the only one who touches the router:
function NavigationListener() {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = (e) => navigate(e.detail);
    window.addEventListener('mfe:navigate', handler);
    return () => window.removeEventListener('mfe:navigate', handler);
  }, []);
}
```

Why Product doesn't call `useNavigate('/cart')` itself:

- Product doesn't know Cart exists — decoupled by design.
- The shell owns the router; it alone pushes to browser history.
- If `/cart` is renamed `/checkout` tomorrow, only shell config changes.
- Practically: a lazy-loaded remote may not reliably access the shell's Router context — `useNavigate` inside a remote can break silently.

## Pattern 3 in practice — auth and user context

Auth uses **HTTP-only cookies**; the JWT rides along on every API call. For user data:

1. Shell makes **one** `/me` call on load.
2. Shell dispatches the result: `window.dispatchEvent(new CustomEvent('user:authenticated', { detail: userData }))`
3. MFEs listen in their root component's mount hook.
4. **Latecomers:** an MFE that loads *after* the event fired reads a fallback the shell stored (e.g. `window.__USER_CONTEXT__`) on mount.

At 15 MFEs this becomes the **request deduplication** problem — see the Scaling chapter: the shared service returns the same in-flight *promise* to every caller, collapsing 15 calls into 1 request.

**Deliberate trade-off to state:** no shared global Redux/Zustand store across MFEs. Backend is the source of truth; events give weaker consistency and that's accepted. Cart count lives in shell state (the header is shell-owned); MFEs fire `cart:updated`, shell updates the badge — no MFE-to-MFE coupling.

## Routing — the shell owns the map

```
/                  → redirect to /products
/products          → ProductApp (list)
/products/:id      → ProductApp (detail — child route)
/cart              → CartApp
```

Both `/products` and `/products/42` render the same MFE; the MFE reads the param and decides list vs detail:

```js
const { product } = useParams();
return product ? <Detail id={product} /> : <List />;
```

**Ownership split:**

- **Cross-MFE navigation** (Coupons → Deals): custom event → shell navigates. Not the History API directly from the MFE — the shell must remain the single writer of history.
- **Internal navigation** (Coupons list → Coupons detail): the MFE's own React Router. Shell not involved.

## Back/forward, deep links, and SEO — the grilling zone

*"How does browser back/forward work?"* — The shell manages the History API and pushes state on every navigation. Back/forward fires `popstate`; the shell reads the URL and mounts the correct MFE. Each MFE reads its route params from the URL on mount. Deep links work because **the URL is always the source of truth, not in-memory state**.

*"What happens to SEO if navigation doesn't update the URL?"* — It breaks. Google crawls URLs — if `/deals/summer-sale` isn't a real URL, it's not indexed. Every `mfe:navigate` must result in a `pushState`; MFEs must update the URL for internal routes too. A missing `pushState` is a silent bug that only shows up in analytics or an SEO audit weeks later — test for it explicitly.

> One-liner: *"The URL is always the source of truth. If navigation doesn't update the URL, you have a bug."*
