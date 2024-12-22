# Stage: Getting Started

To make drawing super easy, we can use the `Stage` class. It helps with setup of the rendering loop (plus a few extra features.)

---

To get started, we can extend and run a stage:

```js
class MainStage extends Stage {
    canvas = "my_canvas_id"

    draw(ctx) {
        this.clear(ctx)
        // Draw stuff.
        this.center.pen.indicator(ctx)
    }
}

// Run it.
const stage = MainStage.go()
```

And that's it!

---
