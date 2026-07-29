## The distinction interviewers hunt for

> An array of **already-created promises** has *already started* — promises are eager. To truly run tasks in series you need an array of **functions that return promises** (thunks).

Saying this sentence unprompted is the single biggest signal in this question. If you accept `[fetch(a), fetch(b)]` as input for a "sequential" runner, all the requests are already in flight — the loop just awaits results in order.

## Run promises in series ⭐

```js
// tasks = array of functions, each returns a promise
async function runSeries(tasks) {
  const results = [];
  for (const task of tasks) {
    results.push(await task());   // next only STARTS after previous resolves
  }
  return results;
}
```

The `reduce` version — same behavior, no `async/await`. Worth knowing because "now do it without async/await" is a common follow-up:

```js
function runSeriesReduce(tasks) {
  return tasks.reduce(
    (chain, task) => chain.then((acc) => task().then((r) => [...acc, r])),
    Promise.resolve([])
  );
}
```

## Sequential API calls from an array of URLs ⭐

The integration-role favorite:

```js
async function fetchInSeries(urls) {
  const out = [];
  for (const url of urls) {
    const res = await fetch(url);       // request N+1 starts after N finishes
    out.push(await res.json());
  }
  return out;
}
```

And the `reduce` chain equivalent:

```js
function fetchInSeries(urls) {
  return urls.reduce(
    (promise, url) =>
      promise.then((acc) =>
        fetch(url)
          .then((res) => res.json())
          .then((data) => [...acc, data])
      ),
    Promise.resolve([])
  );
}
```

## The escalation: parallel with a concurrency limit of N ⭐⭐

This is the standard follow-up and where the round is won or lost. The model: **N workers pulling from a shared index.**

```js
async function pool(tasks, limit) {
  const results = new Array(tasks.length);
  let next = 0;                              // shared cursor

  async function worker() {
    while (next < tasks.length) {
      const i = next++;                      // claim an index (JS is single-threaded — no race)
      results[i] = await tasks[i]();         // run it; loop pulls the next free slot
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, tasks.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

// pool(urls.map(u => () => fetch(u).then(r => r.json())), 3)
```

Points to narrate:

1. **Why this is correct without locks** — JS is single-threaded; `next++` between awaits can't be interrupted mid-statement.
2. **Results keep input order** — write by claimed index, never push.
3. **Error strategy** — as written, one rejection rejects the whole pool (via `Promise.all`). Offer the alternative: wrap each task in try/catch and record `{status, value/reason}` per slot, `allSettled`-style.

## Retry with backoff — the other classic escalation

```js
async function retry(task, retries = 3, delay = 500) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await task();
    } catch (err) {
      if (attempt >= retries) throw err;
      await new Promise((r) => setTimeout(r, delay * 2 ** attempt)); // 500, 1000, 2000...
    }
  }
}
```

Mention jitter (`delay * 2 ** attempt * (0.5 + Math.random()/2)`) to avoid thundering-herd retries — a one-line senior signal.

## Choosing the pattern

| Requirement | Pattern |
|---|---|
| Order matters, each depends on previous | Series (thunks + `for...of await`) |
| Independent tasks, unbounded | `Promise.all` |
| Independent tasks, rate-limited API | Worker pool with limit N |
| Flaky dependency | Retry with exponential backoff + jitter |
| First-success-wins across mirrors | `Promise.any` |
