## The simple explanation

Module Federation lets one app (the shell) import code from another app (an MFE) **at runtime** — without bundling it at build time. Think of it as a plugin system: the shell doesn't know what's inside the Product MFE, it just knows where to find it.

## The manifest file — `remoteEntry.js`

When an MFE is built, it generates a tiny file called `remoteEntry.js`. This is the **menu** — it lists what the MFE exposes, without containing the actual code:

```
remoteEntry.js  ≈ 2KB   ← just the menu (fetched immediately)
ProductApp.js   ≈ 80KB  ← the actual meal (fetched only when the user visits /products)
```

## The three-part wiring

**The MFE says: "I expose my app component."**

```js
// product/vite.config.js
federation({
  name: 'product',
  filename: 'remoteEntry.js',
  exposes: {
    './ProductApp': './src/ProductApp',   // "here's what I'm offering"
  },
})
```

**The shell says: "I'll load Product from this URL."**

```js
// shell/vite.config.js
federation({
  remotes: {
    product: 'https://cdn.example.com/product/assets/remoteEntry.js',
  },
})
```

**The shell uses it like a normal import — but it's remote:**

```js
const ProductApp = lazy(() => import('product/ProductApp'));
//                               ↑ a REMOTE import, resolved at runtime
```

**Without Module Federation** you'd either bundle all MFEs together (back to a monolith) or use iframes (bad UX, no shared state).

## Module Federation vs plain script injection

This distinction is a favorite staff-level probe:

> Script injection is just "loading a file." Module Federation is a **runtime orchestrator**:
> - **Deduplication** — if 5 MFEs use React 18, the browser downloads it **once**.
> - **Version negotiation** — SemVer is checked at runtime; a remote needing a different library version than the host provides is handled deliberately instead of crashing.

## What shared-scope negotiation actually does at runtime

```
1. Shell boots → loads React 18.2 → registers it in the shared scope
2. Product MFE boots → asks: "does anyone have react ^18.2.0 already?"
3. Shell's copy qualifies → Product reuses it → 0KB downloaded for React
4. Cart MFE boots → same check → reuses shell's copy → 0KB
```

**Cost of the negotiation itself:** ~5–10ms per MFE on first load — negligible. The real cost is duplicate bundle loading if versions drift (next chapter).

## Webpack MF vs Vite Federation

| | Webpack Module Federation | Vite Federation (`@originjs`) |
|---|---|---|
| Maturity | Production-proven, widely used | Newer, less battle-tested |
| Build output | CommonJS + ESM | ESM only |
| HMR support | Strong | Limited in federation mode |
| Config API | More flexible | Simpler, fewer options |
| SSR support | Better documented | Limited |
| Ecosystem | Larger | Smaller |

**How to argue the choice:** if teams are migrating off Webpack 4 anyway, Vite gives faster dev builds and modern ESM output — sufficient for CSR-only MFEs in an MVP. For SSR-heavy MFEs later, revisit Webpack MF or a framework with first-class federation.

## Two MFEs on one page — the widget question

*"What if a page needs both a Coupons widget and a Deals widget side by side?"*

```js
Promise.all([import('coupons/CouponsWidget'), import('deals/DealsWidget')])
```

Both remoteEntry files load in parallel; shared deps are negotiated once and reused; each widget gets its own error boundary so one crashing doesn't affect the other. The key constraint: each MFE must be designed to work **as a widget** — no assumption of owning the full page, no full-page routing.
