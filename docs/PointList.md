# PointList

A `PointList` maintains many points. It's actually an `Array` with some convenience functions.


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