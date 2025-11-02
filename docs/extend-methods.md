# Polypoint _extend_

The `extend` object provides a clean, intuitive API for extending Polypoint classes with new functionality. These methods allow you to dynamically add properties, methods, and behaviors to installed classes at runtime.

- [prop](#prop) - Per-instance lazy properties
- [singleton](#singleton) - Shared singleton properties
- [getter](#getter) - Custom lazy getters
- [functions](#functions) - Multiple methods at once
- [mixin](#mixin) - Complex property descriptors
- [static](#static) - Class-level properties
- [Comparison: prop vs singleton vs getter](#comparison-prop-vs-singleton-vs-getter)
- [Working with Installed Classes](#working-with-installed-classes)
- [Best Practices](#best-practices)
- [See Also](#see-also)

> [!Note]
> Remember, target objects to extend must be registered with Polypoint via `Polypoint.install()` [Installing Addons](./installing-addons.md)

All methods are available through `Polypoint.extend.*` for a clear, discoverable interface.


| Method | Scope | Caching | Use Case |
|--------|-------|---------|----------|
| [`prop`](#prop) | Per-instance | Automatic | Unique helper per instance (typical) |
| [`singleton`](#singleton) | Global | Automatic | Shared utility across all instances |
| [`getter`](#getter) | Custom | Manual | Full control over behavior |
| [`functions`](#functions) | Per-instance | N/A | Multiple methods at once |
| [`mixin`](#mixin) | Per-instance | Custom | Complex property descriptors |
| [`static`](#static) | Class | N/A | Class-level utilities |

---

## prop

Add a lazy-loaded property that's unique to each instance. The property initializer runs once per instance, caching the result for future access.

**Use when:** You want each instance to have its own unique helper object.

```js
class PointJiggler {
    constructor(point) {
        this.point = point
    }
    
    wiggle() {
        // Jiggle logic here
    }
}

Polypoint.extend.prop('Point',
    function jiggler() {
        return new PointJiggler(this)
    }
);

// Each point gets its own jiggler instance
let p1 = new Point(100, 100)
let p2 = new Point(200, 200)

p1.jiggler.wiggle()  // Creates jiggler for p1
p2.jiggler.wiggle()  // Creates separate jiggler for p2

p1.jiggler !== p2.jiggler  // true - unique instances
```

The property is cached on the instance itself:

```js
p1._jiggler === undefined  // true (before first access)
p1.jiggler                 // Creates and caches PointJiggler
p1._jiggler === PointJiggler  // true (now cached)
```

---

## singleton

Add a lazy-loaded property that returns the same instance across all instances of a class. The initializer runs once globally, and all instances share the result.

**Use when:** You want a shared utility that doesn't need per-instance state.

```js
class Dragging {
    constructor(stage) {
        this.stage = stage
        this.active = []
    }
    
    add(point) {
        this.active.push(point)
    }
}

Polypoint.extend.singleton('Stage', function dragging() {
    console.log('Creating shared dragging manager')
    let dr = new Dragging(this)
    dr.initDragging()
    return dr
});

// All stages share the same dragging instance
let stage1 = new Stage()
let stage2 = new Stage()

stage1.dragging.add(point1)  // Creates singleton
stage2.dragging.add(point2)  // Returns same instance

stage1.dragging === stage2.dragging  // true - shared singleton
```

The singleton is stored on `Polypoint` itself, not the instances:

```js
Polypoint._dragging === undefined  // true (before first access)
stage.dragging                     // Creates singleton
Polypoint._dragging === Dragging   // true (now cached globally)
```

---

## getter

Add a custom lazy getter with full control over the caching logic. You write the getter function manually, including any caching behavior you need.

**Use when:** You need custom initialization logic or non-standard caching behavior.

```js
class PointTangents {
    constructor(point) {
        this.point = point
    }
}

Polypoint.extend.getter('Point', {
    tangent() {
        // Custom caching logic
        let r = this._tangents
        if(r == undefined) {
            r = new PointTangents(this)
            this._tangents = r
        }
        return r
    }
    
    , angle() {
        // Different caching strategy - always recalculate
        return Math.atan2(this.y, this.x)
    }
});

let p = new Point(100, 50)
p.tangent   // Your getter runs
p.angle     // Recalculates each time
```

This gives you full control - cache when you want, recalculate when you need.

---

## functions

Add multiple methods to a class in one call. This is a convenient way to install several functions at once.

```js
Polypoint.extend.functions('Point', {
    /* Move this point toward another point */
    track(other, distance) {
        return constraints.distance(other, this, distance)
    }

    /* Keep this point within range of another */
    , leash(other, maxDistance) {
        return constraints.within(other, this, maxDistance)
    }

    /* Push this point away if it gets too close */
    , avoid(other, minDistance) {
        return constraints.inverse(other, this, minDistance)
    }
});

// Now available on all Point instances
let p1 = new Point(100, 100)
let p2 = new Point(200, 200)

p1.track(p2, 50)   // Follow p2 at 50px distance
p1.leash(p2, 100)  // Stay within 100px of p2
p1.avoid(p2, 30)   // Keep at least 30px away
```

All functions are writable, so they can be overridden if needed.

---

## mixin

Install complex properties with full descriptor control. Use this when you need to define getters, setters, or control property attributes like `writable` or `enumerable`.

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
    
    , isOrigin: {
        get() {
            return this.x === 0 && this.y === 0
        }
    }
})

let p = new Point(100, 100)
p.draggable = false  // Uses setter
p.draggable          // Uses getter: false
p.isOrigin           // false (read-only computed property)
```

The mixin accepts standard `Object.defineProperties` descriptors, giving you complete control.

---

## static

Add static properties to a class (on the class itself, not instances). Useful for shared utilities or factory methods.

```js
const autoMouse = new AutoMouse(Point)

Polypoint.extend.static('Point', {
    mouse: {
        value: autoMouse
    }
    
    , fromPolar: {
        value: function(radius, angle) {
            return new Point(
                radius * Math.cos(angle),
                radius * Math.sin(angle)
            )
        }
    }
})

// Available on the class, not instances
Point.mouse.position          // Shared mouse tracker
Point.fromPolar(100, Math.PI) // Factory method

let p = new Point()
p.mouse === undefined         // true - not on instances
```

Static properties are perfect for class-level utilities and factory patterns.

---

## Comparison: prop vs singleton vs getter

```js
// prop - each instance gets its own
Polypoint.extend.prop('Point', function pen() {
    return new PointPen(this)
})

p1.pen !== p2.pen  // true - different pens


// singleton - all instances share one
Polypoint.extend.singleton('Stage', function fps() {
    return new FramerateExt(this)
})

stage1.fps === stage2.fps  // true - same fps tracker


// getter - you control everything
Polypoint.extend.getter('Point', {
    velocity() {
        // Recalculate every time - no caching
        return Math.sqrt(this.vx ** 2 + this.vy ** 2)
    }
})
```

---

## Working with Installed Classes

All `extend` methods work with classes registered through `Polypoint.install()`:

```js
class CustomShape {
    constructor(points) {
        this.points = points
    }
}

Polypoint.install(CustomShape)

// Now extend it
Polypoint.extend.functions('CustomShape', {
    rotate(angle) {
        // Rotation logic
    }
})

let shape = new CustomShape([...])
shape.rotate(Math.PI / 4)
```

You can extend before or after the class is installed - the system queues extensions and applies them when ready.

---

## Best Practices

**Choose `prop` for per-instance state:**
```js
// Good - each point needs its own pen
Polypoint.extend.prop('Point', function pen() {
    return new PointPen(this)
})
```

**Choose `singleton` for shared utilities:**
```js
// Good - one keyboard handler for all stages
Polypoint.extend.singleton('Stage', function keyboard() {
    return new StageKeyboard(this)
})
```

**Choose `getter` for computed values:**
```js
// Good - recalculate on each access
Polypoint.extend.getter('Point', {
    magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2)
    }
})
```

**Choose `functions` for multiple related methods:**
```js
// Good - grouped related functionality
Polypoint.extend.functions('Point', {
    moveBy(dx, dy) { /* ... */ },
    moveTo(x, y) { /* ... */ },
    moveTowards(other, distance) { /* ... */ }
})
```

---

## See Also

- [head-methods.md](./head-methods.md) - Lower-level API (advanced usage)
- [getting-started.md](./getting-started.md) - Basic Polypoint usage
- [installing-addons.md](./installing-addons.md) - Adding plugins
