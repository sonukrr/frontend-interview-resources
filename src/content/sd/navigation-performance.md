## Two different problems

Performance splits into: getting the page on screen fast **the first time**, and making it feel instant **once you're already there**. They need different solutions — structure your answer that way.

## First load — minimize what travels and how far

### CDN + Brotli compression

All JS bundles are uploaded to a CDN on build; edge nodes serve them near the user.

```
Without CDN:  user in Tokyo → server in US-East → 180ms round-trip
With CDN:     user in Tokyo → edge node in Tokyo → 8ms round-trip
```

Brotli shrinks JS by ~70%:

```
ProductApp.js uncompressed: 80KB
ProductApp.js with Brotli:  24KB   ← 3× faster download
```

Without this, geographically distant users pay a 180–250ms penalty on **every** bundle request, multiplied by the number of bundles.

### Critical CSS inlined in the shell's HTML

A small block of critical CSS (layout, header, skeleton colors) goes **directly in `index.html`**, so a correct-looking frame renders while JS is still downloading:

```
WITHOUT inlined critical CSS:
  0ms:    blank white screen
  300ms:  shell JS loads → header appears → layout jumps  (bad LCP, CLS)

WITH:
  0ms:    HTML arrives → header renders immediately
  300ms:  shell JS loads → interactivity activates
  600ms:  MFE JS loads → content fills in       (no flash, no shift)
```

## Subsequent navigation — never re-download the unchanged

### Content hashing

The bundler appends a content hash to every built file: `ProductApp.abc123.js`. Ship a new Cart version and **only Cart's hash changes**:

```
CartApp.def456.js    → CartApp.xyz789.js   ← fetched fresh
ProductApp.abc123.js → unchanged           ← served from cache
```

### Long-term cache headers

Content-hashed files are immutable — same hash, same content, forever. So:

```
Cache-Control: public, max-age=31536000, immutable
```

New deploys get new hashes and new URLs; old cache entries are simply never referenced again. No CDN invalidation ceremony for assets.

### Service worker — instant return visits

A service worker is a background script that intercepts network requests and serves them from its own cache — a local proxy inside the browser. The critical design decision is **two different strategies for two different file types**:

```js
// sw.js
if (request.url.includes('remoteEntry.js')) {
  return networkFirst(request);   // the "menu" — must be fresh
}
if (request.url.includes('/assets/')) {
  return cacheFirst(request);     // content-hashed — immutable, serve instantly
}
```

| File | Strategy | Why |
|---|---|---|
| `remoteEntry.js` | Network first | Points at the *current* MFE version. Stale = users stuck on an old deploy. |
| `/assets/*.js` | Cache first | Same URL = same bytes forever. Safe to cache aggressively. |

**The full lifecycle:**

```
FIRST VISIT:   everything downloaded from CDN; SW stores it
RETURN VISIT:  assets from SW cache instantly (0ms network);
               remoteEntry checked against network (2KB, fast)
AFTER DEPLOY:  remoteEntry fresh → new CartApp.xyz789.js fetched;
               unchanged ProductApp still from cache
```

Without the service worker, every return visit re-downloads all bundles — on mobile or flaky networks the app feels broken. The SW is what makes an MFE platform feel native on repeat visits.

> One-liner: *"remoteEntry is network-first. Assets are cache-first. Different files, different staleness requirements."*

## Summary table — problem → solution → impact

| Problem | Solution | Impact |
|---|---|---|
| Slow first load for distant users | CDN + Brotli | ~3× faster downloads globally |
| Blank screen before JS | Critical CSS inlined in shell HTML | Instant visual frame; no CLS |
| Re-downloading unchanged bundles | Content hashing + immutable cache headers | Only changed MFEs re-download |
| Slow navigation on return visits | SW cache-first for assets | Near-instant, works on flaky networks |
| Stale MFE code after deploys | SW network-first for remoteEntry | New versions always propagate |
