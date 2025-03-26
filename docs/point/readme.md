> The entire library is focused upon the single 2D Point.

## Getting Started

A `Point` accepts many properties, or an object.

Default properties:

```js
// accepts: (x, y, radius, rotation)
new Point(100, 200, 20, 90)
```

Or array of the same four attributes

```js
// accepts: (x, y, radius, rotation)
new Point([100, 200, 20, 90])
```

The same properties may be applied through an object:

```js
new Point({
    x: 100
    , y: 200
    , radius: 20
    , rotation: 90
})
```

Anything can be applied to the point instance directly:

```js
let point = new Point

point.x = 100
point.y = 200
point.radius = 20
point.rotation = 90
```

