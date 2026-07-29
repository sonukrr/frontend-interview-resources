export const drills = [
  {
    id: 'sync-micro-macro',
    trackId: 'drill-sync-micro-macro',
    title: 'Sync vs micro vs macro',
    code: `console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');`,
    output: 'A  D  C  B',
    explanation:
      'Synchronous code first (`A`, `D`) → then the microtask queue drains (`C`) → then one macrotask (`B`). `setTimeout(0)` never beats a promise callback.',
  },
  {
    id: 'var-loop',
    trackId: 'drill-var-loop',
    title: 'The var loop classic',
    code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}`,
    output: '3  3  3',
    explanation:
      '`var` is function-scoped: all three callbacks close over the **same** `i`, which is `3` by the time any timer fires. Fix: `let i` (fresh binding per iteration → `0 1 2`) or an IIFE capturing `i` by value.',
  },
  {
    id: 'async-await-ordering',
    trackId: 'drill-async-await-ordering',
    title: 'async/await ordering',
    code: `async function foo() {
  console.log(1);
  await bar();
  console.log(2);
}
function bar() { console.log(3); }
console.log(4);
foo();
console.log(5);`,
    output: '4  1  3  5  2',
    explanation:
      '`4` is sync → `foo()` logs `1`, `bar()` runs synchronously and logs `3` → the `await` suspends `foo`, queueing the rest (`2`) as a microtask → `5` sync → microtask resumes → `2`. `await` on a non-promise still yields to the microtask queue.',
  },
  {
    id: 'microtask-chain',
    trackId: 'drill-microtask-chain',
    title: 'Chained microtasks beat the timer',
    code: `console.log('start');
setTimeout(() => console.log('timeout'), 0);
Promise.resolve()
  .then(() => console.log('promise1'))
  .then(() => console.log('promise2'));
console.log('end');`,
    output: 'start  end  promise1  promise2  timeout',
    explanation:
      'The **entire microtask chain** drains before the macrotask fires. Each `.then` queues the next microtask, and the event loop keeps draining microtasks until the queue is empty before touching the timer.',
  },
  {
    id: 'boss-level',
    trackId: 'drill-boss-level',
    title: 'The interview boss level',
    code: `async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}
async function async2() { console.log('async2'); }

console.log('script start');
setTimeout(() => console.log('setTimeout'), 0);
async1();
Promise.resolve().then(() => console.log('promise1'));
console.log('script end');`,
    output:
      'script start → async1 start → async2 → script end → async1 end → promise1 → setTimeout',
    explanation:
      "Sync prints `script start`; the timer is queued (macro); `async1` prints `async1 start`; `async2` prints `async2`; the `await` queues `async1 end` as the **first** microtask; `.then` queues `promise1` as the **second**; sync prints `script end`; microtasks drain in order (`async1 end`, `promise1`); finally the macrotask (`setTimeout`). If you can trace this out loud, you've won the drill section.",
  },
  {
    id: 'executor-sync',
    trackId: 'drill-executor-sync',
    title: 'The promise executor is synchronous',
    code: `console.log('1');
const p = new Promise((resolve) => {
  console.log('2');
  resolve();
  console.log('3');
});
p.then(() => console.log('4'));
console.log('5');`,
    output: '1  2  3  5  4',
    explanation:
      'The executor body runs **synchronously** when the promise is constructed (`2`, `3` — and note `3` still runs after `resolve()`; resolving doesn\'t return). Only the `.then` callback is deferred to the microtask queue → `4` last.',
  },
  {
    id: 'let-closures',
    trackId: 'drill-let-closures',
    title: 'Closures with let — the fixed version',
    code: `const fns = [];
for (let i = 0; i < 3; i++) fns.push(() => i);
console.log(fns.map((f) => f()));`,
    output: '[0, 1, 2]',
    explanation:
      '`let` creates a fresh binding each iteration, so each closure captures its own `i`. Swap to `var` and it\'s `[3, 3, 3]` — you must know both directions of this question.',
  },
];
