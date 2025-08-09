<div align="center">

<img src="logo-1200.png" alt="Polypoint logo" width="240" />

### Polypoint.js — a tiny playground for 2D points and canvas

Immediate‑mode canvas helpers for creative coding, geometry sketches, and pixel doodles. No build step. Plug in only what you need. Draw now.

</div>

## Highlights

- Zero-build, script-tag friendly. Works from file://, http://, anywhere
- Immediate-mode Stage with draw loop and resize helpers
- First-class Point with math, projection, rotation, lerp, and utilities
- Pen vs Draw helpers to keep canvas code clean and expressive
- Pluggable “head” system: add features at runtime (dragging, distances, events, etc.)
- Tiny and fast; designed to run on modest hardware

## Who is it for?

- Creative coders who want to sketch ideas fast
- Educators teaching vectors, trigs, and canvas basics
- Prototype jammers and demo scene tinkers
- Anyone who prefers immediacy over boilerplate

## Quick start (HTML + canvas)

1) Add a canvas to your page:

```html
<canvas id="playspace" width="800" height="600"></canvas>
```

2) Load the core and a few essentials, then configure the loader to fetch modules from `point_src/`:

```html
<!-- Asset map + loader + library head -->
<script src="point_src/files.js"></script>
<script src="point_src/core/loader.js"></script>
<script src="point_src/core/head.js"></script>

<script>
    // Tell Polypoint where source files live and what to load
    Polypoint.head.configure({
        srcPath: 'point_src/',
        files: polypointFileAssets, // from files.js
        load: [
            'point',     // Point class and helpers
            'pointpen',  // Pen helpers
            'pointdraw', // Draw helpers
            'events',
            'automouse',
            'dragging',
            'stage'      // Stage + resize helpers
        ]
    });
</script>
```

3) Draw something right away:

```html
<script>
class MainStage extends Stage {
    canvas = 'playspace';

    mounted() {
        this.p = this.center.copy();
        this.p.radius = 50;
    }

    draw(ctx) {
        this.clear(ctx);
        this.p.lookAt(Point.mouse.position);
        this.p.pen.indicator(ctx, { color: 'teal', width: 3 });
    }
}

const stage = MainStage.go(); // starts the loop
</script>
```

No bundler, no npm — just scripts. If you prefer, you can also include modules directly via individual `<script src="point_src/…">` tags (see docs below).

## Concepts at a glance

- Point: math and transforms for 2D points (x, y, radius, rotation/radians)
- PointList: small utilities for working with lists of points
- Stage: convenience layer for canvas sizing, update loop, events
- Pen vs Draw: expressive drawing helpers vs raw path building
- Events: lightweight stage events with auto-wiring (onClick, onMousemove, …)
- Dragging: add simple point dragging and hover iris

The system is modular. Features are installed at runtime via the Polypoint “head” (see Add‑ons).

## Add‑ons and late loading

Polypoint’s head lets you install features after the fact — existing instances get new powers without recompilation.

```js
// Load a feature later
Polypoint.head.load('distances');

// Existing points now have distance helpers
p1.distanceTo(p2);
```

You can also mix in methods, lazy properties, and statics to installed classes (Point, Stage, etc.). See `docs/head-methods.md` and `docs/installing-addons.md` for details.

## Pen vs Draw

Use Draw when you want to control the path and styling yourself; use Pen for quick, high-level drawing.

```js
// Draw: build a path, then style
ctx.beginPath();
point.draw.circle(ctx, 24);
ctx.strokeStyle = 'hotpink';
ctx.lineWidth = 2;
ctx.stroke();

// Pen: one-liners with sensible defaults
point.pen.circle(ctx, 24, 'hotpink', 2);
```

More in `docs/pen-v-draw.md`.

## Directory guide

- `point_src/` — library source (Point, Stage, helpers, add‑ons)
- `theatre/` — working, runnable examples (the “theatre files”)
- `examples/` — a grab bag of older/third‑party style experiments for reference
- `site/beta/` — Django + Wagtail site that hosts docs and the theatre/editor
- `docs/` — in‑progress documentation (accurate but evolving)

If you’re here just to use the JS library in a page, `point_src/` is all you need.

## Run the Django beta site (optional)

The beta site hosts a simple editor/viewer for theatre files and docs pages.

```bash
# From the repo root
python3 -m venv .venv
. .venv/bin/activate
pip install -r site/beta/requirements.txt
python site/beta/manage.py runserver
```

Then open http://127.0.0.1:8000/ and explore. The site is WIP but functional for browsing examples and docs.

## Try the theatre examples

The scripts in `theatre/` are standalone runnable examples. After loading the core (see Quick start), you can load any theatre script and it will set up a Stage and start drawing.

Example (after the loader/head scripts):

```html
<script>
    // Ensure core modules (point, stage, etc.) are loaded first via configure()
    Polypoint.head.load('theatre/clock-face.js');
</script>
```

Alternatively, serve the repo with any static server and open the HTML files under `examples/` to explore various demos.

## Theatre files: one‑load sketches at /theatre/

Each theatre file is a self-contained sketch: one JS file with a short header comment that lists its required assets. The site reads these at the `/theatre/` endpoint and auto-loads everything for you.

Example: a tiny starfield.

```js
/*
title: Starfield
files:
        head
        point
        pointdraw
        pointpen
        events
        automouse
        stage
---
*/

class MainStage extends Stage {
    canvas = 'playspace';
    mounted() {
        // Create a handful of moving points
        this.points = Array.from({ length: 120 }, () => new Point(Math.random()*800, Math.random()*600));
        this.vel = this.points.map(() => new Point((Math.random()-0.5)*2, (Math.random()-0.5)*2));
    }
    draw(ctx) {
        this.clear(ctx, '#000');
        const { width, height } = this.dimensions;
        for (let i = 0; i < this.points.length; i++) {
            const p = this.points[i];
            const v = this.vel[i];
            p.x = (p.x + v.x + width) % width;
            p.y = (p.y + v.y + height) % height;
            p.pen.circle(ctx, 1.5, '#9cf', 1);
        }
    }
}

stage = MainStage.go();
```

How to run it:

- Start the Django beta site (see steps above)
- Open: http://127.0.0.1:8000/theatre/starfield-example (or your chosen file)
- Browse the source: `theatre/starfield-example.js`

## API sketch

This is a tiny taste — see inline JSDoc and the `docs/` folder for more:

- new Point(x, y, radius?, rotation?)
    - set({x, y, radius, rotation}) | set([x,y,r,rot])
    - add/subtract/multiply/divide(other)
    - project(distance, rotationDeg?, relative=true)
    - lookAt(otherPoint, addDeg=0)
    - directionTo/turnTo(otherPoint, multiplier=1)
    - lerp/lerpPixel/midpoint, magnitude/normalized
    - asArray()/asObject(), copy(), uuid

- class Stage
    - prepare(target) | static go({loop=true})
    - draw(ctx), firstDraw(ctx), clear(ctx, fillStyle?)
    - loopDraw(), stop(), nextTick(fn), onDrawBefore/After(fn)
    - resize() with debounced window handling; dimensions.center
    - events: auto-wires onX handlers (e.g., onClick)

- Dragging (lazy on Stage: `stage.dragging`)
    - addPoints(...points), getPoint(), drawIris(ctx)

## Alternative include (no loader)

You can skip the loader and include modules directly via script tags in dependency order. For example:

```html
<script src="point_src/core/head.js"></script>
<script src="point_src/pointdraw.js"></script>
<script src="point_src/pointpen.js"></script>
<script src="point_src/pointlist.js"></script>
<script src="point_src/point.js"></script>
<script src="point_src/events.js"></script>
<script src="point_src/automouse.js"></script>
<script src="point_src/dragging.js"></script>
<script src="point_src/stage.js"></script>
```

Then use the same Stage code from the Quick start.

## Contributing

- Issues and PRs welcome. The code intentionally avoids a heavy toolchain.
- Keep changes small and pluggable where possible (use `Polypoint.head.install`, `mixin`, `lazyProp`).
- If you add a public method, add a short example to `docs/` or a theatre file.

## License

MIT — see `LICENSE`.

## Credits

Created and maintained by @Strangemother. The `l.js` loader is by Jonathan Gotti (MIT/GPL) and bundled under `point_src/core/loader.js`.
