# Pen Vs Draw

A Point as `pen` and `draw` methods.

The draw tools provide the movement defined by the method, without applying any
visual updates. You can draw as much as required before applying a visual change:

```js
ctx.beginPath()
p.draw.lineTo(ctx, other)
quickStrokeWithCtx(this.ctx, lineColor, lineWidth)
```

The pen does this for us, accepting a range of arguments fitting the method used.
This is useful when we're just getting stuff done:

```js
p.pen.line(ctx, other, lineColor, lineWidth)
```

---

The `pen` function performs `ctx.beginPath()` and `ctx.closePath()` automatically.

---

Most _draw_ functions have a synonymous _pen_ function, as the pen tools use their associated draw methods. The pen tools are more _convenience_ and offer a smaller subset of all possible drawing options.

Defaults exist for the pen:

```js
point.pen.circle(ctx) // defaults applied
```

And inline:

```js
point.pen.circle(ctx, radius, lineColor, lineWidth) // with all options.
```

The `draw` method provides a narrow range of parameters, as the styling is done manually in a next step

```js
ctx.beginPath()
point.draw.circle(ctx, radius) // Define a circle.
quickStrokeWithCtx(ctx, lineColor, lineWidth) // same options
```