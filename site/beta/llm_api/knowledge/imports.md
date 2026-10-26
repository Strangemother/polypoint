# Metadata, dependencies, and starter

Start the source with a leading `/* ... */` metadata comment, before any code.
The viewer parses the comment as Markdown metadata and loads `files:` before the
theatre script. These are ordered classic scripts with global classes, not ES
module imports. Metadata must appear before a blank line or a closing `---`
separator. A leading `---` is also supported.

```javascript
/*
title: Example title
description: A short description for discovery.
categories: basic, animation
files:
    head
    point
    pointlist
    stage
    mouse
    dragging
---

Optional Markdown description goes here.
*/
```

Indent each dependency under `files:`. Entries may be bundle names from
`point_src/files.json` or explicit paths such as `../point_src/text/beta.js`.
The viewer expands bundles and some source-file dependency headers and removes
duplicate paths, but it does not infer every feature used by your code. Preserve
the order of a working example and include all needed features.

| Entry | Common purpose |
| --- | --- |
| `head` | Polypoint registration and extension infrastructure |
| `point` | Point and its basic pen/draw support |
| `pointlist` | PointList and list pen support |
| `stage` | Stage, hooks, and resize support |
| `mouse` | Stage events and automatic mouse support |
| `dragging` | Dragging, distance, and clamp support; also load point, stage, and mouse |
| `stroke` | Stroke styling helpers |
| `fps` | Stage clock and FPS text helpers |

For a `Point.text` label, add `../point_src/text/beta.js`; for `Line` and
`BezierCurve`, see `example-line` and `example-bezier`. An addon may need more
than its named file. Use the complete header of a relevant bundled example
rather than guessing imports.

This complete starter draws a rotating, draggable point:

```javascript
/*
title: Rotating Point
description: A draggable point with a rotating direction indicator.
categories: basic, animation
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/stage.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/functions/clamp.js
    ../point_src/dragging.js
*/
class MainStage extends Stage {
    canvas = 'playspace';

    mounted() {
        this.point = new Point(this.center.x, this.center.y, 40, 0);
        this.dragging.add(this.point);
        this.lastTime = performance.now();
    }

    draw(ctx) {
        const now = performance.now();
        const dt = Math.min((now - this.lastTime) / 1000, 0.05);
        this.lastTime = now;
        this.point.rotation += 30 * dt;
        this.clear(ctx);
        this.point.pen.indicator(ctx, {color: '#8ad', width: 2});
    }
}

stage = MainStage.go();
```

The validator recognizes `stage`, `other`, `everything`, or the explicit
`../point_src/stage.js` as a Stage import. It does **not** verify that other
paths exist, resolve the full dependency graph, or execute the source. A passing
result is not proof that the scene works. Inspect browser console errors after
loading; a missing script or global often indicates an incomplete header.
