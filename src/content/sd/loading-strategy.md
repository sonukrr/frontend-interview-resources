## The restaurant analogy

> A restaurant doesn't cook every dish on the menu before you arrive. They prep the popular ones and cook the rest when you order. MFE loading works the same way.

"Load everything upfront" fails at scale: with 10 MFEs you'd ship 2–5MB of JavaScript to a user who might visit one page. The answer is a **three-tier strategy**.

## Tier 1 — Eager: the shell only

The shell loads immediately on page open. It's tiny — frame, nav, router. **No MFE code is in the shell bundle at all.**

```
Page opens:
  shell.js   → 20KB  ← downloads immediately
  product.js → NOT downloaded yet
  cart.js    → NOT downloaded yet
```

If the shell accidentally bundles an MFE, every user pays that cost before seeing anything. Keep the shell under ~50KB and treat growth as a regression.

## Tier 2 — Lazy: MFEs load on route visit

```js
const ProductApp = lazy(() => import('product/ProductApp'));
const CartApp    = lazy(() => import('cart/CartApp'));

<Suspense fallback={<Skeleton />}>
  <ProductApp />
</Suspense>
```

```
User visits /products → ProductApp.js (80KB) fetched → renders
User visits /cart     → CartApp.js (60KB) fetched → renders
User never visits /cart → CartApp.js is NEVER downloaded
```

Without lazy loading, first load pulls every MFE — Product, Cart, Payments, Profile, Settings — making it 5–10× slower for no benefit.

## Tier 3 — Predictive prefetch: start the download on hover

Lazy loading still shows a spinner on click. Prefetch eliminates it by using **hover as an intent signal**:

```jsx
const prefetch = {
  product: () => import('product/ProductApp'),
  cart:    () => import('cart/CartApp'),
};

<NavLink onMouseEnter={prefetch.cart} to="/cart">Cart</NavLink>
```

**The math that justifies it:**

```
WITHOUT prefetch:
  click "Cart" → download starts → spinner → ~300ms → renders

WITH prefetch:
  hover "Cart" → download starts in background (200ms head start)
  click "Cart" → bundle already cached → renders instantly
```

- Average hover→click gap: **200–400ms**
- 60KB bundle on broadband: **100–200ms**
- The download finishes before the click lands → zero-wait navigation.

## Synchronous vs asynchronous loading — the comparison they may ask for

| | Synchronous | Asynchronous (chosen) |
|---|---|---|
| Load timing | All MFEs on shell init | On demand when the route is hit |
| Initial load | Slow — everything upfront | Fast — shell boots immediately |
| UX | No loading states needed | Needs a skeleton per MFE slot |
| Use case | Very small MFEs only | Standard for production MFE systems |

**With prefetching, async loading gets a near-synchronous feel without the upfront cost** — that sentence resolves the trade-off cleanly.

## Decision matrix

| Scenario | Strategy | Why |
|---|---|---|
| Shell frame, nav, router | Eager | Needed immediately; tiny |
| MFE for the current route | Lazy | Downloaded when the route matches |
| MFE behind a hovered link | Prefetch | User signaled intent; start early |
| MFE behind a tab never opened | Never downloaded | That's the whole point |

## Grilling question to be ready for

*"Your shell loads MFEs lazily — but what happens to LCP if the shell itself is heavy?"*

The shell must be minimal: routing, navbar, error boundaries only. No business logic. Critical CSS inlined (next chapter). The shell's job is to boot fast and get out of the way.
