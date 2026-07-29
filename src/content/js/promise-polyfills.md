## The one-breath summary

Recite this before any promise question:

> `all` = all succeed or first failure · `allSettled` = wait for all, never rejects · `race` = first to **settle** (fulfill *or* reject) · `any` = first to **fulfill**, rejects only if all fail.

## `Promise.all` polyfill ⭐

The most-asked of the set. Three traps are baked into it — index ordering, non-promise inputs, and the empty array.

```js
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let completed = 0;
    if (promises.length === 0) return resolve(results);   // trap 3: empty input

    promises.forEach((p, i) => {
      Promise.resolve(p).then(          // trap 2: wrap non-promise values
        (value) => {
          results[i] = value;           // trap 1: order by index, NOT push
          completed++;
          if (completed === promises.length) resolve(results);
        },
        reject                          // first rejection rejects everything
      );
    });
  });
}
```

> **The follow-ups, in the order they come:**
> 1. *"Why index assignment instead of `push`?"* — Results must match **input order** regardless of resolution order. A fast promise at index 2 must not land at index 0.
> 2. *"What if an input isn't a promise?"* — `Promise.resolve(p)` normalizes raw values.
> 3. *"Empty array?"* — Resolves immediately with `[]`. Forgetting this means the promise never settles.
> 4. *"Why a counter instead of checking `results.length`?"* — Sparse assignment makes `.length` lie: `results[2] = x` on an empty array gives length 3.

## `Promise.race`

First to settle — fulfill **or** reject — wins. The implementation is almost suspiciously short; say why it works:

```js
function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    promises.forEach((p) => Promise.resolve(p).then(resolve, reject));
  });
}
```

It works because a promise can only settle once — every subsequent `resolve`/`reject` call is a no-op. Note the classic gotcha: `race([])` stays **pending forever** (matches the spec).

## `Promise.any`

First **fulfillment** wins; rejects only if *all* reject — with an `AggregateError`.

```js
function promiseAny(promises) {
  return new Promise((resolve, reject) => {
    const errors = [];
    let rejectedCount = 0;
    if (promises.length === 0) {
      return reject(new AggregateError([], 'All promises were rejected'));
    }
    promises.forEach((p, i) => {
      Promise.resolve(p).then(resolve, (err) => {
        errors[i] = err;                       // errors also keep input order
        if (++rejectedCount === promises.length) {
          reject(new AggregateError(errors, 'All promises were rejected'));
        }
      });
    });
  });
}
```

## `Promise.allSettled`

Never rejects — every outcome is wrapped in a status object. The elegant trick: implement it **on top of `Promise.all`** by making every promise un-rejectable first.

```js
function promiseAllSettled(promises) {
  return Promise.all(
    promises.map((p) =>
      Promise.resolve(p).then(
        (value)  => ({ status: 'fulfilled', value }),
        (reason) => ({ status: 'rejected',  reason })
      )
    )
  );
}
```

## Decision table — which combinator when

| Scenario | Use |
|---|---|
| Page needs user + orders + settings, all required | `all` — fail fast if any fails |
| Fire analytics to 3 endpoints, report what happened | `allSettled` — you want every outcome |
| Timeout pattern: `fetch` vs a 5s timer | `race` — first settle wins |
| Try 3 CDN mirrors, first success wins | `any` — ignore failures unless all fail |

> **Curveball:** *"Implement a timeout wrapper for fetch."*

```js
function fetchWithTimeout(url, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
  );
  return Promise.race([fetch(url), timeout]);
}
```

Bonus senior point: mention that this rejects your promise but **doesn't cancel the request** — for real cancellation you'd pass an `AbortController` signal to fetch.
