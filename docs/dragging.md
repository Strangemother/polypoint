# Dragging

Setup mouse dragging for any Point:

```js
class MyStage extends Stage{
    mounted(){
        this.myPoint = new Point(100, 200)
        // dtagging is lazt enabled.
        this.dragging.addPoints(this.myPoint)
    }

    draw(ctx) {
        this.dragging.drawIris(ctx) //circle around the active point
    }
}
```

## Manual Setup

If required intall the `dragging` tools:

```jinja2
<script src="point_src/distances.js"></script>
```

The `dragging` functionality is a lazy property for an instance of the `Dragging` class.

```js
let drag = this.drag = new Dragging
// Enable events on the target
drag.initDragging(stage)
// Apply points to track manually.
drag.addPoints(stage.point, stage.clickPoint)
// Custom drag handlers.
drag.onClick = stage.dragOnClick.bind(stage)
```

To perform `drawIris` manually (draw any discovered hover points):

```js
let p = stage.dragging.getPoint();
if(p) {
    p.pen.circle(stage.ctx)
}
```