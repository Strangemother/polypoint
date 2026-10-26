# Input and dragging

Load `mouse` for stage events and automatic mouse tracking. Load `dragging` as
well for draggable points, and register points once in `mounted()`:

```javascript
/*
title: Example
files: 
    head 
    stage
    mouse
    dragging
*/ 

class MainStage extends Stage {
    mounted() {
        this.point = new Point(200, 200, 30);
        this.dragging.add(this.point);
    }
}
```

The lazy `this.dragging` helper initializes its listeners when accessed; it
expects a prepared stage and mouse. Add multiple points with
`this.dragging.add(a, b)` or `this.dragging.add(...points)`, not on every frame.
`example-line`, `example-grid`, and `example-bisector` include complete headers.

With `events.js`, Stage methods such as `onClick(event)`, `onMousemove(event)`,
and `onMousedown(event)` can be hooked to canvas events. `this.events.wake()`
ensures the hooks are installed and is safe to call again. Example:

```javascript
onClick(event) {
    this.clicked = new Point(event.offsetX, event.offsetY);
}
```

Use the complete `example-click` starter. In this revision `Point.from(event)`
tests `offsetX` by truthiness, so an event at x=0 can take a different path;
explicit offsets avoid that edge case. Offsets are CSS-pixel coordinates; if
you change backing-buffer scaling, convert them to your drawing coordinates.

`this.mouse.position` (also `Point.mouse.position`) returns a new point at the
last mouse position; `this.mouse.point` is a persistent point updated by the
mouse helper. `example-pointer-direction` and `example-follow` use the former.
Register window-level listeners only once, retain handler references, and remove
them when the scene is disposed or replaced. Use arrow functions or `.bind(this)`
when callbacks need the stage instance.
