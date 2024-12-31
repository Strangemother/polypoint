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


+ prepare
    performs the first setup (prepare)
    And calls load() once.

    + resolve the canvas node
    + distpatch prepare events
    + stick the canvas size
    + set the loopDraw method
    + listen for resize events
    + listen for addons
    + call mounted()

+ load
    called first time the stage is prepared.
+ mounted
    prepared and ready to draw
+ clear
    clear a rectangle.

+ draw
    perform one frame of the loop - this.clear() is called by default

+ onDrawAfter(func)

    add a function to run after the draw step

+ ctx
    return the ctx (read only)

+ loopDraw
    runs itself forever after the first call to continuly call the 'update()' method

+ go({})
    A static method to run the stage with minimal effort

resize()
    calls upon the stickCanvasSize to set the dimensions. Occurs after a resize event.

distpatch
    send an event from the stage.

+ center `Point`
    A center point

+