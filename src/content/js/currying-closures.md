## Currying — fixed arity (uses `fn.length`)

Transform `f(a, b, c)` into `f(a)(b)(c)` — while still allowing `f(a, b)(c)` and `f(a, b, c)`. The trick: compare collected args against `fn.length`.

```js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);            // enough args → invoke
    }
    return (...next) => curried.apply(this, [...args, ...next]); // keep collecting
  };
}

const multiply = (a, b, c) => a * b * c;
const m = curry(multiply);
m(10, 20, 30);   // 6000
m(10, 20)(30);   // 6000
m(10)(20)(30);   // 6000
```

> **The follow-up:** *"How does it know when to stop?"* — `fn.length`, the declared parameter count. Then volunteer the caveat: `fn.length` ignores rest params and default values, so fixed-arity currying **doesn't work for variadic functions** — which is exactly why the infinite version below exists.

## Currying — infinite (`sum(1)(2)(3)...()`)

No arity to check, so you need a **terminator**: calling with no argument returns the total.

```js
function sum(a) {
  return function (b) {
    if (b === undefined) return a;   // terminator: called with no arg
    return sum(a + b);
  };
}
sum(1)(2)(3)();   // 6
```

The multi-arg variant — each call may take several numbers:

```js
function sum(...initialArgs) {
  let total = initialArgs.reduce((acc, curr) => acc + curr, 0);

  function inner(...args) {
    if (args.length === 0) return total;
    total += args.reduce((acc, curr) => acc + curr, 0);
    return inner;
  }

  return initialArgs.length === 0 ? 0 : inner;
}

sum(1, 2)(3, 4)(5)();   // 15
sum(1)(2)(3)(4)();      // 10
sum();                  // 0
```

And the show-off variant — no final `()` needed, using `valueOf` coercion:

```js
function total(a) {
  const fn = (b) => total(a + b);
  fn.valueOf = () => a;    // numeric coercion returns the running total
  return fn;
}
+total(1)(2)(3);  // 6
```

> **Why this works:** `+x` triggers `ToPrimitive`, which calls `valueOf`. Interviewers use this to check whether you understand coercion, not because anyone ships it.

## Closures — the two loop questions you must not fumble

**The `var` classic:**

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// → 3 3 3
```

`var` is function-scoped. All three callbacks close over the **same** binding of `i`, which is `3` by the time any timer fires. Two fixes: `let i` (a fresh binding per iteration → `0 1 2`), or an IIFE that captures `i` by value.

**The `let` version — know why it's different:**

```js
const fns = [];
for (let i = 0; i < 3; i++) fns.push(() => i);
fns.map((f) => f());   // [0, 1, 2]
```

`let` in a `for` head creates a **new binding each iteration**; each closure captures its own copy. This pair of questions is the fastest closure litmus test interviewers have.

## Where currying earns its keep in real code

Don't leave it as a party trick — name a practical use:

- **Event handlers with context:** `onClick={handleClick(item.id)}` where `handleClick = (id) => (event) => {...}`
- **Configurable utilities:** `const log = (level) => (msg) => console[level](msg)` → `const warn = log('warn')`
- **Function composition pipelines** (next topic) — unary functions compose cleanly, and currying is how you get unary functions out of multi-arg ones.
