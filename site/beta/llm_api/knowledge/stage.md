# Stage lifecycle

Use the complete starter in `imports` or fetch `example-point`. The viewer
provides `<canvas id="playspace">`; bind it with `canvas = 'playspace'`.

```javascript
class MainStage extends Stage {
    canvas = 'playspace';
    mounted() {
        this.point = new Point(this.center.x, this.center.y, 30, 0);
    }
    draw(ctx) {
        this.clear(ctx);
        this.point.pen.indicator(ctx, {color: 'orange'});
    }
}
stage = MainStage.go();
```

This is the class body and startup only: include a metadata header and the
required dependencies when storing it.

`MainStage.go()` creates and prepares an instance, calls `mounted()` once,
performs an initial update, and starts the requestAnimationFrame loop by default.
`firstDraw(ctx)` is a one-time drawing hook before ordinary drawing begins.
`draw(ctx)` receives the canvas 2D context on each update. Store state on `this`
and initialize it in `mounted`; do not start another animation loop in `draw`.
`MainStage.go({loop: false})` prepares and performs an initial draw without the
ongoing loop.

After preparation, `this.canvas` is the canvas element; `this.ctx` is its 2D
context; `this.dimensions` holds measured dimensions and `this.center` is the
center point. Size can change: calculate responsive positions from current
dimensions rather than assuming a fixed viewport. The `stage` bundle includes
the resize helper; an explicit `stage.js` import also relies on its resolved
dependencies. Test resize behavior in the target viewer.

`this.clear(ctx)` clears the canvas but does not reset transforms, styles, or
paths. Restore any world transform before clearing. For a background, a
`fillRect` after the clear is straightforward. See `canvas` for state and
coordinate rules, and `interaction` for input.
