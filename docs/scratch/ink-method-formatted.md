# The `ink()` Method

Polypoint supplies three rendering methods: **draw**, **pen**, and **ink**. By default, these target canvas or SVG layers.

Draw methods handle the _sketching_ phase, while pen actions render the final output. For simple shapes, pen alone suffices. For complex fills, you sketch with multiple draws then finalize with a single pen call.

---

## What is `ink()`?

The `ink()` function combines draw and pen routines for built-in units (like springs). It handles all the plotting without the hassle.

```js
// without ink
let p = new Point;
p.pen.fill(ctx, {color: 'red'})

// with ink
let p = new Point;
p.ink()
```

The ink method renders a unit using pre-determined settings. A spring's ink shows a zigzag, a balloon's ink runs multiple pen routines.

### What Ink Can Do

+ Run draw and pen methods
+ Execute animations
+ Manipulate internal variables
+ Access context or workspace defaults

Typically, draw and pen methods don't edit unit arguments or rely on out-of-context defaults.

---

## Why No `render()` Function?

Polypoint is built for customization. The `render()` method is usually the first thing developers override, so Polypoint keeps tooling under _pen_, targeting the _draw_ layer.

The `ink()` method provides the bones of a unit until you create your own custom routine.

---

## Options and Context

Most draw and pen routines require an explicit context for code clarity and runtime speed. But when sketching ideas, mandating `ctx` gets annoying.

The ink method makes context optional - options come first:

```js
let p = new Point;
p.ink()
p.ink(options)
p.ink(options, stage.ctx)
```

Ink is also an overloadable executable method:

```js
let p = new Point;
p.ink()
p.ink.tips()
```

### Implementation Patterns

**Function Constructor Pattern:**

```js
function Ink() {
  const state = { calls: 0 };

  function head(...args) {
    state.calls++;
    console.log('called with', args, 'total calls:', state.calls);
  }

  Object.setPrototypeOf(head, Ink.prototype);
  Object.defineProperty(head, 'constructor', { value: Ink });

  return head;
}

Ink.prototype.eggs = function() {
  console.log('eggs');
};

// usage
let foo = new Ink();
foo();
foo.eggs();
console.log(foo instanceof Ink); // true
```

**Class with Bound Function:**

```js
class Ink {
  constructor() {
    this.state = { calls: 0 };

    const head = (...args) => {
      this.state.calls++;
      console.log('called with', args, 'total calls:', this.state.calls);
    };

    return head.bind(this);
  }

  eggs() {
    console.log('eggs  -  calls so far:', this.state.calls);
  }
}
```

**Hybrid Pattern:**

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
    console.log('eggs  -  calls so far:', this.state.calls);
  }
}

Object.setPrototypeOf(Ink.prototype, PointInk.prototype);

const ink = new Ink();
ink();
ink.eggs();
console.log(ink instanceof Ink);      // true
console.log(ink instanceof PointInk); // true
```

### Stage Weak Reference

```js
function Ink(...args) {
  if (!new.target) return new Ink(...args);
  return new PointInk(...args);
}

class PointInk {
  constructor(stage, options = {}) {
    if (stage == null || typeof stage !== 'object') {
      throw new TypeError('PointInk: stage must be an object');
    }

    const state = { calls: 0, options };
    const stageRef = new WeakRef(stage);

    const head = (...args) => {
      state.calls++;
      const st = stageRef.deref();
      console.log('called with', args, 'calls:', state.calls, 'stage alive?', !!st);
      // use st safely: st?.draw?.(args);
    };

    head.state = state;
    head.getStage = () => stageRef.deref();

    Object.setPrototypeOf(head, Ink.prototype);
    Object.defineProperty(head, 'constructor', { value: Ink });

    return head;
  }

  eggs() {
    const st = this.getStage?.();
    console.log('eggs  -  stage alive?', !!st);
  }
}

Object.setPrototypeOf(Ink.prototype, PointInk.prototype);

// usage
const stage = { name: 'main' };
const ink = new Ink(stage, { color: 'cyan' });

ink();
ink.eggs();

// if stage has no strong refs, GC may collect it
console.log('stage now:', ink.getStage()); // possibly null after GC
```

---

## Ink Advantages

### Fire and Forget

Ink is built for convenience. A point needs coordinates, then pen actions. Shared themes reduce repetition.

It's overloadable - use quick `ink()` or chain methods like `ink.nose()`, `ink.hands()`.

### Animated

Ink may manipulate visual rendering to perform animations. Pen doesn't animate.

### Smart

Ink collects sensible defaults where needed - colors from themes, clock speed from stage. Pen and draw stay thinner, with fewer options per tool.

### Context-Aware

Ink sees the context, stage, and attached unit. Other tools stick to their own instance or parent.

Ink uses the stage context, letting developers omit `ctx` at ink time. It may use themes and point vars for unique colors.

### Unique

One per point instance, holding weak references to external refs like the stage.

---

## When to Avoid Ink

Sometimes lower-level methods work better:

### Ink May Mutate

Ink is pretty but arrogant - it may manipulate visual styles and coordinates, hindering accurate coordinate analysis.

### Ink Will be Slower

Ink performs more inspection than pen and draw. For thousands of points, no problem. For massive routines, use draw or raw context for better performance.

### Ink is Opinionated

Objects like balloons get common options applied automatically. But accessing or extending pre-determined draw choices can be limiting.

For advanced work, ignore ink entirely. Penning complex polygons is easier with draw and pen functions (unless a specific `ink.polygon` function exists).
