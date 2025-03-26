title: PointList
---

A `PointList` maintains many `Point` objects. It's secretly just an `Array` (with some extra function for convenience).


## Getting Started

A `PointList` accepts many points.

```js
const points = new PointList(
                    new Point(100, 200),
                    new Point(350, 200),
                    new Point(700, 200),
                    // ...
                );
```

You gain typical _array_ functionality.

```js
/* Iterate every point in the list */
points.forEach(point=>console.log(point))
```

Plus a few poly extras, such as the `pen` tooling.

```js
/*_Pen_ methods exist for easy drawing:*/
points.pen.indicators(ctx, {color: 'green'})
```

## Casting

We can load Point specific values for each entry, then `cast()` them in-place as `Point` types:

```js
const objects = new PointList(
     { x: 300, y: 100, vx: 0, vy: 0}
    , { x: 500, y: 100, vx: 0, vy: 0}
    , { x: 700, y: 100, vx: 0, vy: 0}
    , { x: 900, y: 100, vx: 0, vy: 0}
)

const points = objects.cast()
```


## Generate

Generate 100 random points:

```js
randomPoints = PointList.generate.random(100)
```

Generate a circle of points:

```js
pointCount = 100
radius = 100
topLeftOrigin = point(200,200)

circle = PointList.generate.radius(pointCount, radius, topLeftOrigin)
```

Iterate and edit:

```js
randomPoints = PointList.generate.random(100)
randomPoints.forEach(p => {
    let mass = Math.random() * 10
    p.mass = mass
    p.rotation = Math.random() * 360
    p.radius = Math.max(5, mass)
})
```