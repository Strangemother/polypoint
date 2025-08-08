## Getting started with Polypoint.js

Polypoint is a tiny, script-tag friendly toolkit for playing with points and canvas. It’s modular, zero-build, and great for quick sketches, teaching, and experiments.

This guide helps you:

- Install or copy the source locally
- Make your first import and draw loop
- Understand “theatre” files and how loading works
- Build a small rope-string demo step by step


## Install

Pick the path that fits your workflow. No bundler is required.

- Clone/copy the repo, then use the `point_src/` folder in your HTML page
- Or open the existing examples under `examples/` in any static server
- Optional: run the beta site (Django) to browse theatre files in a web UI

Static server (optional, but convenient):

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```


## First import (HTML + canvas)

Add a canvas and load the core head/loader plus the file map. Then tell the loader which modules to load.

```html
<canvas id="playspace" width="800" height="600"></canvas>

<!-- Asset map + loader + library head -->
<script src="point_src/files.js"></script>
<script src="point_src/core/loader.js"></script>
<script src="point_src/core/head.js"></script>

<script>
  // Configure Polypoint to load core modules
  Polypoint.head.configure({
    srcPath: 'point_src/',
    files: polypointFileAssets, // from files.js
    load: [
      'point',
      'pointpen',
      'pointdraw',
      'events',
      'automouse',
      'dragging',
      'stage'
    ]
  });

  // Minimal Stage
  class MainStage extends Stage {
    canvas = 'playspace';
    mounted() {
      this.p = this.center.copy();
      this.p.radius = 40;
    }
    draw(ctx) {
      this.clear(ctx);
      this.p.lookAt(Point.mouse.position);
      this.p.pen.indicator(ctx, { color: 'teal', width: 3 });
    }
  }

  // Start!
  const stage = MainStage.go();
  window.stage = stage; // optional dev convenience
</script>
```

Notes

- You can also include modules directly with individual `<script src="point_src/…">` tags (see “Loading files” below).
- Works from file:// or http(s)://. No special server needed for the loader.
- If your checkout doesn’t include `point_src/files.js`, skip the loader approach and use classic script tags (next section).


## The theatre suite

“Theatre” files are just single-file sketches. They’re plain JS with a short header comment for metadata (title, file requirements, etc.). The site can parse these headers to auto-load dependencies and display the sketch.

Example theatre file:

```js
/*
title: Example
files:
  head
  point
  pointpen
  pointdraw
  events
  automouse
  stage
---

This is an example file with a title, imports, and the stage.
*/

class MainStage extends Stage {
  canvas = 'playspace';
  mounted() {
    this.point = new Point(250, 150);
    this.point.radius = 20;
  }
  draw(ctx) {
    this.clear(ctx);
    this.point.pen.indicator(ctx, { color: 'green' });
  }
}

stage = MainStage.go();
```

Ways to run a theatre file

- Via the beta site’s theatre viewer (see repo README for how to run the site)
- Or load it manually after core modules are ready:

```html
<script>
  // After Polypoint.head.configure(...)
  Polypoint.head.load('theatre/your-file.js');
  // Or any relative/absolute path
  // Polypoint.head.load('../point_src/theatre/earth-sun.js');
</script>
```


## Loading files (dynamic and classic)

Polypoint is modular. You can load features at startup or later. Existing instances get new powers when you load add‑ons.

Dynamic load

```js
Polypoint.head.load('distances');
// Now distance helpers are available on Point and the Distances namespace
// p1.distanceTo(p2)
```

Classic script tags (no loader)

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

Mix and match as needed. The loader helps with dependency ordering and late loading; script tags are simple and explicit.


## Build something: a rope string demo

Let’s build a lightweight rope made of points connected by constraints using a tiny Verlet step. One end is fixed; the other follows your mouse.

Contract

- Inputs: canvas, mouse position (from `automouse`), gravity value
- Output: animated rope lines drawn each frame
- Error modes: none critical; ensure modules (`point`, `stage`, `automouse`) are loaded

Step 1 — Base page and modules

Ensure you’ve loaded the core as shown in “First import”. We’ll reuse the same configure block.

Step 2 — Create a Rope class

```html
<script>
class Rope {
  constructor({ origin, segments = 20, spacing = 14, gravity = 900, iters = 3 }) {
    this.points = [];
    this.pinned = new Set();
    this.mousePinnedIndex = segments; // last point follows mouse
    this.spacing = spacing;
    this.gravity = gravity;
    this.iters = iters;

    // Build points in a line; store previous pos for Verlet
    for (let i = 0; i <= segments; i++) {
      const p = new Point(origin.x + i * spacing, origin.y);
      p.px = p.x; p.py = p.y; // previous position
      this.points.push(p);
    }

    // Pin the first point in place
    this.pinned.add(0);
  }

  step(dt) {
    const dt2 = dt * dt;

    // Verlet integration: update positions
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      const pinned = this.pinned.has(i);

      if (i === this.mousePinnedIndex) {
        // Hard-pin last point to mouse
        const m = Point.mouse.position;
        p.x = m.x; p.y = m.y;
        p.px = p.x; p.py = p.y;
        continue;
      }

      if (pinned) continue;

      const vx = (p.x - p.px) * 0.995; // small damping
      const vy = (p.y - p.py) * 0.995;
      p.px = p.x; p.py = p.y;
      p.x += vx;
      p.y += vy + this.gravity * dt2;
    }

    // Satisfy constraints a few times
    for (let k = 0; k < this.iters; k++) {
      for (let i = 0; i < this.points.length - 1; i++) {
        const p1 = this.points[i];
        const p2 = this.points[i + 1];
        let dx = p2.x - p1.x;
        let dy = p2.y - p1.y;
        const dist = Math.hypot(dx, dy) || 1;
        const diff = (this.spacing - dist) / dist;
        const ox = dx * 0.5 * diff;
        const oy = dy * 0.5 * diff;

        const pin1 = this.pinned.has(i);
        const pin2 = (i + 1) === this.mousePinnedIndex; // last follows mouse

        if (!pin1) { p1.x -= ox; p1.y -= oy; }
        if (!pin2) { p2.x += ox; p2.y += oy; }
      }
    }
  }

  draw(ctx) {
    // Lines
    ctx.beginPath();
    for (let i = 0; i < this.points.length - 1; i++) {
      const a = this.points[i];
      const b = this.points[i + 1];
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    }
    ctx.strokeStyle = '#8cf';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Points (optional)
    for (const p of this.points) p.pen.circle(ctx, 2, '#9cf', 1);
  }
}
</script>
```

Step 3 — Wire it into a Stage

```html
<script>
class RopeStage extends Stage {
  canvas = 'playspace';
  mounted() {
    this.rope = new Rope({ origin: this.center.add(-140, -100), segments: 24, spacing: 12 });
    this.last = performance.now();
  }
  draw(ctx) {
    const now = performance.now();
    const dt = Math.min(0.033, (now - this.last) / 1000); // clamp ~30fps max step
    this.last = now;
    this.clear(ctx, '#111');
    this.rope.step(dt);
    this.rope.draw(ctx);
  }
}

stage = RopeStage.go();
</script>
```

Try it

- Move the mouse: the free end follows
- Tweak `segments`, `spacing`, `gravity`, and `iters` for different feels
- Pin both ends by adding `this.pinned.add(lastIndex)` in the Rope constructor

Related

- See `examples/demo-cloth.html` and `demos/cloth-2.js` for a 2D cloth variant
- For dragging points with the cursor, add points to `stage.dragging`


## Troubleshooting

- Nothing draws: ensure `stage.js` is loaded, and your Stage’s `canvas` points to an existing element ID
- Path errors: if using the loader, set `srcPath` correctly and pass `polypointFileAssets` from `files.js`
- Mouse isn’t moving: include `events` and `automouse` modules


## Next steps

- Browse `docs/` for topics like events, pen vs draw, and labels
- Explore `theatre/` and `examples/` for runnable sketches
- Add your own add‑ons with the head system (see `docs/installing-addons.md`)
