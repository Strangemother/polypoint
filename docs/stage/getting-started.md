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

And that's it!

## Starting a Stage

The `go()` function is a convenient _static method_ to execute the Stage.

Alternatively we can manually run the `loopDraw()`

```js
class MainStage extends Stage {

    mounted() {
        console.log('mounted')
    }

    draw(ctx) {
        this.center.pen.indicators(ctx, {color:'#33aa99'})
    }

}

const stage = new MainStage('playspace')
stage.loopDraw()
// stage.go()
```

When using the `go()` method, you can apply additional properties


The `go()` function is a convenient _static method_ to execute the Stage.

Alternatively we can manually run the `loopDraw()`

```js
class MainStage extends Stage {

    draw(ctx) {
        this.center.pen.indicators(ctx, {color:'#33aa99'})
    }

}

const stage = new MainStage('playspace')
stage.go({ loop: true })
```


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
