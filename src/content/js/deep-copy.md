## The question behind the question

"Write a deep clone" is really asking: do you know why `JSON.parse(JSON.stringify(x))` is not an acceptable answer, and can you handle **circular references**?

## The recursive solution with circular-reference handling ⭐

```js
function deepCopy(data) {
  const seen = new WeakMap();      // original → clone

  return helper(data);

  function helper(value) {
    // primitives and functions: return as-is
    if (!value || typeof value !== 'object') return value;

    // circular reference: return the clone we already started building
    if (seen.has(value)) return seen.get(value);

    const clone = Array.isArray(value) ? [] : {};
    seen.set(value, clone);        // register BEFORE recursing — this breaks cycles

    for (const key in value) {
      clone[key] = helper(value[key]);
    }
    return clone;
  }
}
```

Proof it handles cycles:

```js
const data = { name: 'Sense AI', employees: [{ name: 'Charles' }] };
data.self = data;                    // circular!

const copy = deepCopy(data);
copy.self === copy;                  // true — cycle preserved in the clone
copy.employees[0].name = 'Changed';
data.employees[0].name;              // 'Charles' — original untouched
```

Two lines to narrate carefully:

1. **`seen.set(value, clone)` happens *before* the recursion.** When the traversal meets `data.self`, the map already has the (partially built) clone, so it returns it instead of recursing forever. Registering after the loop = stack overflow.
2. **Why `WeakMap`, not `Map`?** Keys are held weakly — the map doesn't prevent the original objects from being garbage collected, and only objects can be keys, which is exactly the domain here.

## Why `JSON.parse(JSON.stringify(x))` fails

| Input | What happens |
|---|---|
| Circular reference | Throws `TypeError: Converting circular structure` |
| `undefined`, functions, symbols | Silently dropped |
| `Date` | Becomes an ISO string, not a Date |
| `Map`, `Set`, `RegExp` | Become `{}` |
| `NaN`, `Infinity` | Become `null` |

Give two of these unprompted; it shows you actually shipped code that hit them.

## The modern answer: `structuredClone`

```js
const copy = structuredClone(data);   // handles cycles, Dates, Maps, Sets, typed arrays
```

Built into all modern browsers and Node 17+. The senior move is knowing its limits too: it **throws on functions and DOM nodes**, and drops property getters (it copies values, not descriptors). So the hand-rolled version is still the interview answer — `structuredClone` is the production answer.

> **The follow-ups:**
> - *"Handle `Date` and `RegExp` in your version?"* — add type checks: `if (value instanceof Date) return new Date(value)` etc., before the generic object branch.
> - *"What about `Map`/`Set`?"* — same pattern: create the container, register in `seen`, then recurse over entries.
> - *"Shallow vs deep — when is shallow enough?"* — When you only mutate top-level keys (e.g., React state spread `{...state, x: 1}`). Deep clone is for when nested structures must diverge.
