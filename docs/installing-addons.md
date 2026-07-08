# Installing Addons

Polypoint and all its assets are _pluggable_ through a process of `install` and `extend` prototype loading. This allows us to _import_ files that hoist methods on existing assets.

> **Recommended:** Use the [`Polypoint.extend.*` API](./extend-methods.md) for the cleanest, most intuitive experience.

## Table of Contents

- [Install](#install) - Register classes with Polypoint
- [Extending Classes](#extending-classes) - Add functionality to installed classes
  - [extend.mixin](#extendmixin) - Complex property descriptors
  - [extend.functions](#extendfunctions) - Multiple methods at once
  - [extend.prop](#extendprop) - Per-instance lazy properties
  - [extend.singleton](#extendsingleton) - Shared singleton properties
- [Arrow Functions](#arrow-functions-) - Important scope considerations
- [Legacy API](#legacy-api) - Migration guide

---

## Quick Start

Like this:

```js
// Pretend Polypoint.Stage
class Stage {}

// Register with Polypoint
Polypoint.head.install(Stage)

const stage = new Stage();
/* could also become */
// const stage = new Polypoint.Stage();


// No dragging tools yet
console.log(stage.dragging)
undefined
```

Install something:

```js
// We can install a new singleton property
Polypoint.extend.singleton('Stage', function dragging(){
    console.log('new dragging instance')
    let dr = new Dragging(this)
    dr.initDragging();
    return dr
});

console.log(stage.dragging)
// "new dragging instance"
// <Dragging>
```


---

## Install

A Polypoint asset should be loaded into the primary object using `install`, then extended with new functionality.

Use `Polypoint.head.install()` to register a class with Polypoint:

```js
class Thing {}

// Register with Polypoint
Polypoint.head.install(Thing)

// Now accessible through Polypoint
Polypoint.Thing == Thing
```

Once installed, you can extend the class with new properties and methods.

---

## Extending Classes

The `Polypoint.extend.*` API provides clean, intuitive methods for adding functionality. See [extend-methods.md](./extend-methods.md) for full documentation.

### `extend.mixin`

Install properties with full descriptor control. The target may be any _installed_ asset:

```js
Polypoint.extend.mixin('Point', {

    _draggable: {
        value: true,
        writable: true
    }

    , draggable: {
        get() {
            return this._draggable
        },
        set(value) {
            this._draggable = Boolean(value)
        }
    }
})

this.center.draggable == true
this.center.draggable = false
this.center.draggable == false
```

The mixin accepts standard `Object.defineProperties` descriptors.


### `extend.functions`

Install multiple methods at once:

```js
Polypoint.extend.functions('Point', {
    track(other, settings) {
        return constraints.distance(other, this, settings)
    }

    , leash(other, settings) {
        return constraints.within(other, this, settings)
    }
});
```

All functions are writable and can be overridden if needed.


### `extend.prop`

Add a lazy-loaded property unique to each instance. The initializer runs once per instance:

```js
Polypoint.extend.prop('Point', function pen() {
    return new PointPen(this)
})

// Each point gets its own pen
stage.center._pen == undefined  // true (before first access)
stage.center.pen                // Creates PointPen
stage.center._pen == PointPen   // true (now cached)
```

The property is automatically cached on first access.


### `extend.singleton`

Add a lazy-loaded property that returns the same instance across all instances:

> [!TIP]
> Arrow functions may not maintain the correct scope for `this` within the call. Read the "Arrow Functions" section below for more info.

```js
Polypoint.extend.singleton('Stage', function screenshot() {
    return new Screenshot(this)
})
```

This creates the `screenshot` property on Stage, but will only initialize once.
Any subsequent calls to `stage.screenshot` will yield the same shared object:

```js
const stage1 = new Stage
const stage2 = new Stage

Polypoint._screenshot == undefined  // true (before first access)
stage1.screenshot                   // Creates Screenshot (singleton)
Polypoint._screenshot == Screenshot // true (cached globally)
stage2.screenshot === stage1.screenshot  // true (shared instance)
```

The singleton is cached on the `Polypoint` object itself, not the instances.

---

## Arrow Functions `()=>{}`

When using `extend.prop` or `extend.singleton`, the callback is executed with `this` bound to the target instance (e.g., `new Point()`). Arrow functions do not maintain this binding.

If your class requires a reference to the owning entity (like `Point.as` methods needing a reference to their `point`), use classic function syntax:

**Example:** The `PointCast` class requires a reference to `this` of type `Point`:

```js
// Without extend.prop:
const point = new Point(100, 200)
point.as = new PointCast(point)
point.as.array()
// [100, 200]
```

**With `extend.prop`**, use `function(){}` to ensure correct scope:

```js
// ✅ Correct - `this` refers to the Point instance
Polypoint.extend.prop('Point', function as() {
    return new PointCast(this)
})
```

**Arrow functions will not work:**

```js
// ❌ Wrong - `this` is undefined or Window
Polypoint.extend.prop('Point', () => new PointCast(this), 'as')
```

In this case, `this` does not correctly reference the `Point` instance.

---

## Legacy API

The older `Polypoint.head.*` API remains available for backwards compatibility:

- `Polypoint.head.deferredProp()` → Use `Polypoint.extend.prop()`
- `Polypoint.head.lazierProp()` → Use `Polypoint.extend.singleton()`
- `Polypoint.head.lazyProp()` → Use `Polypoint.extend.getter()`
- `Polypoint.head.installFunctions()` → Use `Polypoint.extend.functions()`

See [head-methods.md](./head-methods.md) for the legacy documentation.

---

## See Also

- [extend-methods.md](./extend-methods.md) - **Recommended API** with full examples
- [head-methods.md](./head-methods.md) - Legacy API documentation
- [getting-started.md](./getting-started.md) - Basic Polypoint usage