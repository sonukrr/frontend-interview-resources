## Why rehearse this

Being able to narrate the **entire request lifecycle** — from cold load to crash recovery — in one continuous story is the strongest way to close an MFE design interview. It proves every piece you designed actually connects.

## The full journey — what happens when a user visits

```
1.  Browser opens → CDN serves shell's index.html + shell.js (tiny)
    Service worker registers in the background

2.  Shell boots:
    · critical CSS (inlined in HTML) has already painted the header
    · router set up · starts listening for mfe:navigate events

3.  User lands on /  →  redirected to /products

4.  Shell lazy-loads the Product MFE:
    · fetches remoteEntry.js (~2KB manifest)
    · fetches the ProductApp bundle (~80KB, Brotli → ~24KB)
    · shared React already in memory → Product reuses it (0KB)

5.  ProductApp renders, fetches the product list from its API

6.  User hovers "Cart" in the nav:
    · prefetch fires → CartApp bundle downloads in the background
    · 200ms head start before the click

7.  User clicks a product → /products/1
    · shell's router updates the URL (no page reload)
    · ProductApp reads the :product param, fetches detail

8.  User clicks "Add to Cart":
    · ProductApp POSTs to the API
    · on success: fires mfe:navigate('/cart')
    · shell's NavigationListener catches it → navigate('/cart')

9.  Shell renders the Cart slot:
    · CartApp bundle already downloaded (hover prefetch) → instant
    · CartApp renders, fetches cart data

10. If Cart crashes:
    · its ErrorBoundary catches → "Cart failed to load" + Retry
    · Product keeps working · error logged tagged [MFE: Cart]

11. User returns tomorrow:
    · service worker serves shell + ProductApp from cache
    · remoteEntry.js checked against network (2KB, fast)
    · only changed bundles re-download
```

## What each step proves in the interview

| Step | The design decision it demonstrates |
|---|---|
| 1–2 | CDN delivery, tiny eager shell, critical CSS, SW registration |
| 4 | Module Federation manifest + lazy loading + singleton shared deps |
| 6 | Predictive prefetch tier |
| 7 | Shell owns history; MFE reads params — routing ownership split |
| 8 | Custom-event communication; MFEs never navigate directly |
| 10 | Error isolation per slot; tagged observability |
| 11 | SW cache-first assets / network-first remoteEntry; content hashing |

## Auth in the journey — the cross-cutting thread

Weave this in when asked where login fits:

1. Auth rides on **HTTP-only cookies**; every API call carries it.
2. Shell makes one `/me` call (deduplicated by a shared-promise service) and broadcasts `user:authenticated`; late-loading MFEs read the stored fallback on mount.
3. **Token expiry is shell-owned:** all MFEs use a shared HTTP client (exposed as a federated shared module). On a 401 it refreshes the token, queues pending requests, retries. On refresh failure it fires `auth:session-expired` and the shell redirects to login. MFEs never handle refresh themselves.

## The closing line that lands

> "The real value of MFE isn't technical — it's organizational. A monolith with 15 teams means every deploy needs a meeting. With MFE, each team ships on their own schedule and the shell picks up the change automatically. At scale that compounds into months of recovered engineering time per year. But none of it works without discipline: shared deps pinned with singleton and peerDeps, bundles lazy, the shell lean, contracts versioned. Skip any of these and MFE turns from an organizational win into a performance and debugging disaster that nobody notices until it's too late."
