title: FPS Text
doc_imports: fps
---

# FPS (LT unit)

A friendly, zero-setup way to show your app’s framerate on the canvas. The FPS display is built on the LT (Label/Text) unit — a lightweight text helper that draws styled text on your stage. When the `fps` import is loaded, it mounts a helper onto every `Stage` at `stage.fps`, so you can drop a live FPS label in one line.

Quick use:

```js
// inside your Stage.draw(ctx)
stage.fps.drawFPS(ctx)
```

This renders a smoothed, readable frames-per-second label in the top-left by default.

## What you get

- Auto-mounted helper: `stage.fps.drawFPS(ctx)` works as soon as the `fps` module is imported.
- Smoothing built-in: values are averaged with a small history so numbers don’t flicker.
- Easy styling via LT: position, font size, weight, and color are customizable.

## Class overview

Under the hood, `stage.fps` is a tiny wrapper around an `FPS` label:

- Class: `FPS extends TextAlpha`
- Default color: `green`
- Position: starts at `[40, 30]` (pixels from the canvas origin)
- Smoothing: `SmoothNumber` with a sliding window
    - `width`: number of samples to keep (default 20)
    - `modulusRate`: update cadence to slow visual changes (default 10)
    - `fixed`: decimal places (default 0)
- Methods you may care about:
    - `setup()`: sets initial position
    - `update()`: pulls `stage.clock.fps` and smooths it
    - `draw(ctx, color)`: draws text using LT’s `writeText`

Accessing the underlying label for customization:

```js
// The underlying label instance
const label = stage.fps.label

// Move it
label.position.x = 16
label.position.y = 20

// Style it (inherited from TextAlpha)
label.fontSize = 14
label.fontWeight = '600'
label.fontName = '"lexend deca"'

// FPS-specific smoothing controls
label.width = 30          // longer average
label.modulusRate = 6     // update a bit more frequently
label.fixed = 0           // whole numbers

// Color
label.color = 'lime'
```

Note: `stage.clock.fps` is provided by the Stage Clock and is updated each frame. The FPS label reads this value and renders a smoothed number.

## Step-by-step: build a tiny orbit with a live FPS

Let’s make something slightly more fun than a static label: a dot orbiting the center at a constant period, independent of FPS, while the FPS label displays performance.

1) Import and set up a stage

```html
<canvas id="playspace" width="800" height="600"></canvas>
<script src="./point_src/text/fps.js"></script>
```

2) Create a stage that animates an orbit

```js
class OrbitStage extends Stage {
    canvas = 'playspace'
    angle = 0
    radius = 120

    draw(ctx) {
        this.clear(ctx)

        // Time-based rotation: one full turn every 3 seconds,
        // regardless of actual FPS.
        const step = this.clock.frameStepValue(3) // returns per-frame fraction of a whole
        this.angle += step * Math.PI * 2

        // Compute the orbit position around the stage center
        const cx = this.center.x
        const cy = this.center.y
        const x = cx + Math.cos(this.angle) * this.radius
        const y = cy + Math.sin(this.angle) * this.radius

        // Draw the orbit guide
        ctx.strokeStyle = '#888'
        ctx.lineWidth = 1
        ctx.beginPath();
        ctx.arc(cx, cy, this.radius, 0, Math.PI * 2); ctx.stroke()

        // Draw the orbiting dot
        ctx.fillStyle = '#3cf'
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill()

        // Finally, the FPS label
        this.fps.drawFPS(ctx)
    }
}

const stage = OrbitStage.go()
```

3) Tweak the label (optional)

```js
stage.fps.label.position.x = 14
stage.fps.label.position.y = 18
stage.fps.label.fontSize = 12
stage.fps.label.color = '#0f0'
```

That’s it. You now have a smooth FPS readout and a time-consistent animation that won’t speed up or slow down on different machines.

## Tips

- Want snappier numbers? Decrease `label.width` and/or `label.modulusRate`.
- Prefer precise decimals? Set `label.fixed = 1` or `2`.
- Keep your animations time-based. Utilities like `this.clock.frameStepValue(seconds)` help you write frame-rate-independent motion.

## Use the FPS class directly

If you prefer to manage the label yourself (instead of using `stage.fps.drawFPS(ctx)`), instantiate `FPS` and drive its lifecycle explicitly.

Basic pattern:

```js
// Ensure ./point_src/text/fps.js is imported

class MyStage extends Stage {
    canvas = 'playspace'

    constructor() {
        super()
        this.myFps = new FPS(this) // bind to this stage
        this.myFps.setup()         // set initial position and defaults
        // Optional tweaks
        this.myFps.position.x = 16
        this.myFps.position.y = 20
        this.myFps.color = 'lime'
        this.myFps.fontSize = 12
        this.myFps.width = 30          // smoothing window
        this.myFps.modulusRate = 6     // visual update cadence
        this.myFps.fixed = 0           // decimals
    }

    draw(ctx) {
        this.clear(ctx)

        // Update the value (reads this.clock.fps) and draw it
        this.myFps.update()
        this.myFps.draw(ctx)           // or: this.myFps.draw(ctx, '#0f0')
    }
}

const stage = MyStage.go()
```

Notes:

- `FPS` extends `TextAlpha`, so you can use the same text styling properties: `fontSize`, `fontWeight`, `fontName`, `textAlign`, `textBaseline`, and the `position` point.
- `draw(ctx, color?)` accepts an optional color; if omitted it uses `this.color` (default `green`).
- `draw()` can be called without a `ctx` argument; it will default to `this.stage.ctx`.
- Call `update()` every frame before `draw()` so the value stays live.

Multiple instances are fine:

```js
this.fpsTopLeft = new FPS(this)
this.fpsTopLeft.setup()

this.fpsTopRight = new FPS(this)
this.fpsTopRight.setup()
this.fpsTopRight.position.x = this.dimensions.width - 40
this.fpsTopRight.textAlign = 'right'

// in draw(ctx)
this.fpsTopLeft.update();  this.fpsTopLeft.draw(ctx)
this.fpsTopRight.update(); this.fpsTopRight.draw(ctx, 'orange')
```

## Minimal inline example

```js
class MainStage extends Stage {
    canvas = 'playspace'
    draw(ctx) {
        this.clear(ctx)
        this.fps.drawFPS(ctx)
    }
}

const stage = MainStage.go()
```