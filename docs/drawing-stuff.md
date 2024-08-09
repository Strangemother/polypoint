# Drawing Stuff

Polypoint is designed to expose the raw canvas drawing features, whilst providing an API to wield them.

A `Point` and all tools generally have a _draw_ function, of which accepts a canvas context `ctx`, to perform pen changes. When using a `Stage` the `draw(ctx)` performs all drawing.

```js
class MyStage {
    draw(ctx){

        this.clear(ctx)

        let point = new Point(200, 200)
        point.pen.circle(ctx)
    }
}
```

The `this.clear(ctx)` is the _literal_ clear context function. The `point.pen.circle(ctx)` draws a _circle_ at the point position.

---

This allows us do any preferred alterations to the canvas, without the limitations of a library with enforced procedures:

```js
class MyStage {
    draw(ctx){
        this.clear(ctx)

        let h = new Text(ctx, 'Bicycles By Cycles')

        ctx.translate(200, 300)
        // Spin the text to the desired rotation.
        ctx.rotate(h.rotation)
        // ctx.rotate(Math.PI/2 + (rot * .02))

        h.writeText()

        ctx.translate(10, 10)
        h.writeText()

        ctx.translate(10, 10)
        h.writeText()

        ctx.translate(10, 10)
        h.writeText()

        // Undo the translate and continue.
        ctx.restore();
    }
}
```
