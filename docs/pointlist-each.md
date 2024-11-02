# `PointList.each`


The `each` object acts similar to `PointList.setMany`, but with a convenient syntax.

We can target any property on all the points in a list:

```js
const pointList = PointList.generate.grid(100, 10)

pointList.each.x = 100
pointList.each.radius = 20
```

If given a function, it'll be called for each point:

```js
const pointList = PointList.generate.grid(100, 10)

// return a number
pointList.each.x = () => 100

/* calculate a new offset for each point.*/
pointList.each.y = (point, index) => index * 10
```

We can also use this to _collect_ the a value from all points through a function call:


```js
const pointList = PointList.generate.grid(100, 10)

pointList.each.y = (point, index) => index * 10

let items = pointList.each.y()
console.log(items)
// [10, 20, 30, 40, ... ]
```
