title: Stage: Getting Started
---

To make drawing super easy, you can use the `Stage` class. It's just a glorified draw function, with a bunch of tools to helps with setup of the rendering loop.

To get started, can extend and run a stage:

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

And that's it! This is now running at 60FPS.

## For Free

### prepare

performs the first setup with `prepare()` and calls `load()` once.

+ resolve the canvas node
+ dispatch _prepare_ events
+ stick the canvas size
+ set the `loopDraw` method
+ listen for `resize` events
+ listen for addons
+ call `mounted()`
