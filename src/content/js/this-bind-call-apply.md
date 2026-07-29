## Why this topic is round-one material

Writing a `bind` polyfill is the single most-asked JS internals question at senior level. It tests four things at once: how `this` binding works, closures, prototypes, and whether you know the edge cases that the naive answer misses.

## `call` and `apply` polyfills — the quick wins

The trick is to temporarily attach the function to the context object, invoke it as a method (so `this` binds to that object), then clean up.

```js
Function.prototype.myCall = function (context, ...args) {
  context = context ?? globalThis;          // null/undefined → global object
  context = Object(context);                // primitives get boxed ("abc" → String)
  const key = Symbol('fn');                 // unique key — never clobbers a real property
  context[key] = this;                      // `this` is the function being called
  const result = context[key](...args);     // method call → `this` inside = context
  delete context[key];
  return result;
};

Function.prototype.myApply = function (context, argsArray = []) {
  context = context ?? globalThis;
  const key = Symbol('fn');
  context[key] = this;
  const result = context[key](...argsArray);
  delete context[key];
  return result;
};
```

> **The follow-up they will ask:** *"Why the Symbol?"* — If you use a plain string key like `context.fn = this`, you can overwrite a real property named `fn` on the object. `Symbol()` guarantees a unique key. Using a string key is the exact bug interviewers watch for.

## `bind` polyfill — the senior version ⭐

The naive one-liner fails in a specific way. Start with the full version, then explain why the shortcut is wrong:

```js
Function.prototype.myBind = function (context, ...boundArgs) {
  if (typeof this !== 'function') {
    throw new TypeError('myBind must be called on a function');
  }
  const targetFn = this;

  function boundFn(...callArgs) {
    // If invoked with `new`, ignore the bound context and use the fresh instance
    const calledWithNew = this instanceof boundFn;
    return targetFn.apply(
      calledWithNew ? this : context,
      [...boundArgs, ...callArgs]   // partial application: bound args first
    );
  }

  // Preserve the prototype chain so `new boundFn()` works
  if (targetFn.prototype) {
    boundFn.prototype = Object.create(targetFn.prototype);
  }
  return boundFn;
};
```

Three things the naive version misses:

| Edge case | Naive arrow version | Correct version |
|---|---|---|
| `new boundFn()` | Throws — arrow functions can't be constructed | Detects `new` via `this instanceof boundFn`, uses the fresh instance |
| Prototype chain | Lost | `boundFn.prototype = Object.create(targetFn.prototype)` |
| Partial application | Often forgotten | Bound args are **prepended** to call args |

> **The follow-up:** *"What happens if someone does `new` on the bound function?"* — The naive `return () => targetFn.apply(context, ...)` fails: an arrow function can't be constructed, and even a regular function would wrongly keep the bound `context`. Real `bind` ignores the bound context under `new`. Mentioning `new`-support and prototype preservation is the senior signal.

## Spot the bug — a real broken polyfill

This `myMap` was written in a hurry. It runs without throwing, but it's completely broken. Why?

```js
Array.prototype.myMap = (cb) => {
  const res = [];
  for (const el of this) {      // 💥
    res.push(cb(el));
  }
  return res;
};
```

**The bug:** it's an **arrow function**. Arrow functions don't get their own `this` — they capture it lexically from the enclosing scope. So `this` here is the module/global scope, not the array the method was called on. `[1,2,3].myMap(...)` iterates over `globalThis`, not the array.

The fix — and the full-fidelity version with the callback contract:

```js
Array.prototype.myMap = function (cb, thisArg) {
  if (typeof cb !== 'function') throw new TypeError(cb + ' is not a function');
  const res = new Array(this.length);
  for (let i = 0; i < this.length; i++) {
    if (i in this) {                      // skip holes in sparse arrays
      res[i] = cb.call(thisArg, this[i], i, this);  // (value, index, array)
    }
  }
  return res;
};
```

> **Rule to state out loud:** any polyfill that needs `this` (every `Array.prototype.*` and `Function.prototype.*` method) **must** be a regular `function`, never an arrow.

## The `this` decision table

When asked "what is `this` here?", walk this table:

| How the function is called | What `this` is |
|---|---|
| `obj.fn()` | `obj` (the receiver) |
| `fn()` standalone | `undefined` in strict mode, `globalThis` otherwise |
| `new Fn()` | The freshly created instance |
| `fn.call(x)` / `fn.apply(x)` | `x` (boxed if primitive) |
| Arrow function | Lexical — whatever `this` was where it was *defined* |
| DOM handler `el.onclick = function(){}` | The element |

Priority when rules conflict: `new` > explicit (`bind`/`call`/`apply`) > implicit (`obj.fn()`) > default. Arrow functions opt out of the whole system.
