title: Dragging
---

> _drag_ using _mousedown_ and _mouseup_ to move a point.

Setup mouse dragging for any Point, by importing the `dragging` tools and applying
any point to the free `stage.dragging` instance:

```js
class MyStage extends Stage {
    mounted(){
        this.myPoint = new Point(100, 200)
        // dtagging is lazy enabled.
        this.dragging.addPoints(this.myPoint)
    }

    draw(ctx) {
        // optional circle around the active point
        this.dragging.drawIris(ctx)
    }
}
```

That's it.

## Manual Setup

The `dragging` functionality is a lazy property for an instance of the `Dragging` class. You can generate this manually, allowing custom functionality:

```js
const drag = new Dragging
// Enable events on the target
drag.initDragging(stage)
// Apply points to track manually.
drag.addPoints(stage.point, stage.clickPoint)
// Custom drag handlers.
drag.onClick = stage.dragOnClick.bind(stage)
```

To perform `drawIris` manually (draw any discovered hover points), you can query the `stage.dragging.getPoint()` function. It will return a point under the mouse pointer.

```js
let p = stage.dragging.getPoint();
if(p) {
    p.pen.circle(stage.ctx)
}
```