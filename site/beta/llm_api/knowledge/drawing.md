# Drawing with pens, paths, lines, and text

`Point.pen` performs visible drawing. `Point.draw` generally constructs canvas
paths; begin a path and stroke or fill it yourself. These fragments assume the
required imports and `ctx` from a Stage's `draw(ctx)`.

```javascript
point.pen.circle(ctx, {color: 'teal', width: 2});
point.pen.fill(ctx, 'orange');
point.pen.indicator(ctx, {color: 'purple', width: 2});
point.pen.line(ctx, otherPoint, 'red', 2);

ctx.beginPath();
point.draw.lineTo(ctx, otherPoint);
ctx.strokeStyle = 'white';
ctx.stroke();
```

`indicator` draws the point's circle and direction; its style is an options
object, not a third positional color argument. For a circle use `circle(ctx)`,
`circle(ctx, {color, width, radius})`, or
`circle(ctx, radius, color, width)`. Do not call `circle(ctx, undefined)`:
the two-argument form expects an options object.

`pen.ngon(ctx, sides, radius, fromCenter, color, width, angle)` draws a regular
polygon; the angle is in radians. `pen.arc(ctx, otherPoint, color, distance,
width, direction)` uses the two points' rotations. Fetch `example-polygon` and
`example-arcs` for complete examples.

`Line` and `BezierCurve` are addons from `curve-extras.js`, not built-in canvas
classes. Fetch `example-line` or `example-bezier` for their dependencies,
construction, and `render(ctx, options)`. With `text/beta.js`, use
`point.text.string(ctx, text)` for unrotated text or `point.text.label(ctx, text,
offset)` for point-rotated text; configure `ctx.font` and `ctx.fillStyle`.
`example-text` is complete.

Avoid assuming every similarly named method is complete: in this revision
`Point.draw.line` is a placeholder and `Point.pen.ellipse` references an
undefined variable. Use `draw.lineTo` or `pen.line` for lines; use the canvas
`ctx.ellipse` API for ellipses. `example-stroke`, `example-gradient`, and
`example-rectangles` show other drawing features and their imports.
