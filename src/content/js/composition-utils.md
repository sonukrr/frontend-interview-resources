## `flow` / `pipe` — lodash-style composition

Given an array of unary functions, produce one function that threads a value through all of them, left to right:

```js
const add2     = (x) => x + 2;
const times3   = (x) => x * 3;
const square   = (x) => Math.pow(x, 2);

const calculate = flow([add2, times3, square]);
calculate(2);   // ((2+2)*3)² = 144

function flow(fns) {
  return function (x) {
    return fns.reduce((acc, fn) => fn(acc), x);
  };
}
```

`reduce` **is** the implementation: the accumulator is the value being transformed, each function is applied in turn. `compose` is the same thing right-to-left — swap in `reduceRight`.

> **The follow-ups:**
> - *"Multiple args for the first function?"* — `flow` classically pipes a single value; support it with `(...args)` and `fns[0](...args)` as the seed.
> - *"Async version?"* — `fns.reduce((p, fn) => p.then(fn), Promise.resolve(x))` — note this is exactly the sequential-promises pattern from Async Orchestration.

## Build a nested object from dotted keys

A very common utility round: flatten-path input → nested output.

```js
const input = {
  "user.name": "Sonu",
  "user.address.city": "Bengaluru",
  "company.name": "OpenAI",
  "settings.notifications.email": true,
};

function build(obj) {
  const res = {};
  for (const key in obj) {
    const keys = key.split('.');
    let curr = res;
    for (let i = 0; i < keys.length - 1; i++) {
      curr[keys[i]] = curr[keys[i]] ?? {};   // create the level only if missing
      curr = curr[keys[i]];                  // descend
    }
    curr[keys[keys.length - 1]] = obj[key];  // leaf gets the value
  }
  return res;
}

// → { user: { name: 'Sonu', address: { city: 'Bengaluru' } }, ... }
```

The walking-pointer pattern (`curr` descends level by level, creating as needed) is the reusable idea — it's the same shape as `lodash.set`.

> **The follow-ups:**
> - *"Now write the inverse — flatten a nested object into dotted keys."* Recursive walk carrying the path prefix:

```js
function flatten(obj, prefix = '', res = {}) {
  for (const key in obj) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      flatten(obj[key], path, res);
    } else {
      res[path] = obj[key];
    }
  }
  return res;
}
```

> - *"What about conflicting keys like `a` and `a.b` both present?"* — Call out the ambiguity and pick a policy (last write wins, or throw). Noticing the conflict *is* the answer.

## Binary search — the DSA warm-up that keeps appearing

Frontend loops still ask light DSA. Recursive binary search is a favorite because it's quick and exposes off-by-one errors:

```js
function binarySearch(list = [], target = 0) {
  return rec(0, list.length - 1);

  function rec(l, r) {
    if (l > r) return -1;                     // exhausted → not found

    const mid = Math.floor((l + r) / 2);
    if (list[mid] === target) return mid;

    return target < list[mid]
      ? rec(l, mid - 1)                       // left half, EXCLUDING mid
      : rec(mid + 1, r);                      // right half, EXCLUDING mid
  }
}
```

Narration points: the invariant (answer, if present, is always within `[l, r]`), why `mid ± 1` prevents infinite loops, O(log n) / O(log n) recursion depth — and offer the iterative version (O(1) space) before being asked.

Also warm up **sliding window** and **two pointers** (Min Size Subarray Sum, Trapping Rain Water) — the usual DSA half of a frontend round-one.
