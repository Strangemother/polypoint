# Point lists

`PointList` is an array-like collection. Load `head`, `point`, and `pointlist`
alongside `stage`; add `mouse` and `dragging` for interactive points.

```javascript
// In mounted():
this.points = new PointList(
    new Point(100, 120, 15),
    new Point(200, 120, 15),
    new Point(300, 120, 15)
);
this.dragging.add(...this.points);

// In draw(ctx):
this.points.pen.indicators(ctx, {color: 'teal', width: 2});
```

`PointList.generate.grid(24, 6, 50, {x: 100, y: 100})` creates 24 points,
6 per row, spaced 50 units apart. `PointList.generate.random(count, multiplier,
offset)` creates random points; multiplier and offset can be arrays specifying
x, y, radius, and rotation. See the complete `example-grid` and
`example-random-points` sources for imports and use.

`points.forEach(...)` and indexed access work like arrays. Set a property for
every point with `points.each.radius = 10` or
`points.each.radius = (point, index) => point.radius + 10`. Do not use
`points.each.radius += 10`: reading through `each` produces a proxy, not the
points' numeric radii. `points.cast()` returns the converted collection; retain
the return value. `points.copy()` is shallow;
`points.copy(true)` copies the points' basic geometry.

The list pen has methods such as `indicators(ctx, options)`, `line(ctx, options)`,
and `fill(ctx, style)`. Some methods come from additional addons: for rectangles,
load `rectangle.js` as in `example-rectangles`. A `pointlist` import alone is
not a promise that every addon exists.
