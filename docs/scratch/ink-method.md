# `ink()`

Polypoint supplies the draw, pen, and ink functionality, to plot content on your draw layer. By default the draw layer is canvas, or svg.

The draw methods assign the _sketching_ of the chosen tool, followed by a pen action to render something on the draw layer.

Typically when drawing something, we can just head for a pen tool. However if we need to fill more complex shapes, we need to sketch all the target items using many _draw_ followed by a final pen.

---

The `ink()` function runs the typical draw and pen routines for a builtin unit (such as a spring). It contains all the routines to plot content on a layer without the hassle.

When opting for more custom content, you can omit the ink routine in favour of your own solution.

## No `render()` Function?

That's right! Polypoint is designed to be customised, and the `render()` method is typically the first component developers want to override. Therefore Polypoint tooling lives under a _pen_, targeting the _draw_ layer and tools.

When a devloper is developing, the `ink()` method presents the bones of a unit, until a developer creates their own preferred routine using a custom function.


## What is `ink()`

Without an ink function the typical `pen` tools are used.

```js
// without
let p = new Point;
p.pen.fill(ctx, {color: 'red'})

// with ink
let p = new Point;
p.ink()
```

The ink method is design show a point or unit using a pre-determined setup. For example an ink method on a _spring_ presents a neat zigzag, but an ink method on a _balloon_ perfoms multiple pen routines.

the ink function can do the following:

+ run draw and pen methods
+ run animations
+ manipulate internal variables
+ grab context or (polypoint) workspace defaults.

Typically draw and pen methods don't edit unit arguments, or use out of context defaults.


## Options and Context

typically draw and pen routines must accept a context. This is for both clarity of code, and runtime speed (less global checks). But when plotting ideas, a mandated `ctx` is annoying.

The ink method optionally accepts a context, but the context is not the primary argument.

```js
// options focused (e.g. settings first.)
let p = new Point;
p.ink()
p.ink(options)
p.ink(options, stage.ctx)
```

Notably the ink is an overloaded executable method (TODO.)

```js
// options focused (e.g. settings first.)
let p = new Point;
p.ink()
p.ink.tips()
```

```js
function Ink() {
    // internal data
  const state = { calls: 0 };

  function head() {
        state.calls++;
        let args = Array.from(args)
        console.log('called with', args, 'total calls:', state.calls);
  }

  // GPT 5
  // make it quack like an instance of Ink
  Object.setPrototypeOf(head, Ink.prototype);
  // (optional) keep constructor looking right
  Object.defineProperty(head, 'constructor', { value: Ink });

  return head; // returning a function from a ctor is allowed
}

Ink.prototype.eggs = function () {
  console.log('eggs');
};

// usage
let foo = new Ink();
foo();
foo.eggs();
console.log(foo instanceof Ink);
```

```js
class Ink {
  constructor() {
    this.state = { calls: 0 };

    const head = (...args) => {
      this.state.calls++;
      console.log('called with', args, 'total calls:', this.state.calls);
    };

    return head.bind(this); // feels right… but nope, subtle issue ahead
  }

  eggs() {
    console.log('eggs — calls so far:', this.state.calls);
  }
}

```


```js
function Ink(...args) {
  if (!new.target) return new Ink(...args);
  return new PointInk(...args);
}

class PointInk {
  constructor() {
    const state = { calls: 0 };

    const head = (...args) => {
      state.calls++;
      console.log('called with', args, 'total calls:', state.calls);
    };

    head.state = state;

    Object.setPrototypeOf(head, Ink.prototype);
    Object.defineProperty(head, 'constructor', { value: Ink });

    return head;
  }

  eggs() {
    console.log('eggs — calls so far:', this.state.calls);
  }
}

Object.setPrototypeOf(Ink.prototype, PointInk.prototype);

// Usage
const ink = new Ink();
ink();
ink.eggs();
console.log(ink instanceof Ink);      // ✅ true
console.log(ink instanceof PointInk); // ✅ true
```

Stage weak reference:


```js

function Ink(...args) {
  if (!new.target) return new Ink(...args);
  return new PointInk(...args);
}

class PointInk {
  constructor(stage, options = {}) {
    if (stage == null || typeof stage !== 'object'){
      throw new TypeError('PointInk: stage must be an object');
    }

    const state = { calls: 0, options };
    const stageRef = new WeakRef(stage); // <-- weak reference

    const head = (...args) => {
      state.calls++;
      const st = stageRef.deref();
      console.log('called with', args, 'calls:', state.calls, 'stage alive?', !!st);
      // use st safely:
      // st?.draw?.(args);
    };

    // expose what you're okay exposing
    head.state = state;
    head.getStage = () => stageRef.deref(); // access when needed

    Object.setPrototypeOf(head, Ink.prototype);
    Object.defineProperty(head, 'constructor', { value: Ink });

    return head;
  }

  eggs() {
    const st = this.getStage?.();
    console.log('eggs — stage alive?', !!st);
  }
}

Object.setPrototypeOf(Ink.prototype, PointInk.prototype);

// --- usage
const stage = { name: 'main' };
const ink = new Ink(stage, { color: 'cyan' });

ink();
ink.eggs();

// later… if `stage` has no strong refs, GC may collect it:
console.log('stage now:', ink.getStage()); // possibly null after GC
```

## Ink Can Do

Ink is built to be _fire and forget_. Typically a point needs its basic cooridinates, then its pen actions. For general setups we can use a shared theme to reduce repetition

It's overloadable, providing a fast `ink()` and tooling to chain your work `ink.nose()`, `ink.hands()`

### Ink is animated

Ink may manipulate visual rendering to perform animations, the pen doesn't animate.

### Ink is smart

Ink will collect sensible defaults where required, such as colours from the theme, or clock speed from the stage. Typically pen and draw attempt to be less inteligent, opting for a thinner set of options per tool

### Ink has reference

The ink can see the context, stage, point (or attached unit). Other tools tend to stick to their own instance, or a parent.

The ink can use the stage context, allowing the developer to omit `ctx` at ink time.
The ink may use themes and point vars to populate unique colours.

### Ink is unique

One per point instance, however holding weak references to external refs, such as the stage.


---

Coupled with these positives, some reasons to avoid the `ink` and opt for lower-level methods

---

### Ink May Mutate

The ink function is pretty but arrogant, and may manipulate visual styles and coordinates. This may hinder more accurate analysis of coordinates.


### Ink Will be Slower

The ink will peform more inspection (over pen and draw). For a few thousands of points this isn't an issue but for larger routines, opting for the draw or raw context will be faster.


### Ink is Opinionated

When putting together an object (such as balloon), common options are applied. But accessing or extending those pre-determined draw choices may be boring. So completely ignoring the ink function for more advanced things.

E.g. Penning complex polygons is easier done with the draw and pen functions (unless a specific `ink.polygon` function is packaged).


