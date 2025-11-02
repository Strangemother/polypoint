title: Canvas Go
---

The `Stage` class provides a convenient static method `go()` to start the drawing loop on a specified canvas.

The target canvas can be specified in two ways:

+ By setting the `canvas` property in the `Stage` subclass.
+ By passing the canvas string or node as an argument to the `go()` method.


Notice the `canvas` property in the class definition:

```js
class MainStage extends Stage {
    canvas = "my_canvas_id"
    draw(ctx) {
        this.clear(ctx)
        // Draw stuff.
        this.center.pen.indicator(ctx)
    }
}
// Run it on a specific canvas.
MainStage.go()
```

Alternatively, you can pass the canvas ID directly to the `go()` method:

```js

// Run it on a specific canvas.
MainStage.go('my_canvas_id')
```

You can also pass additional options to the `go()` method, such as enabling the drawing loop:

```js
class MainStage extends Stage {
    // canvas is not set here

    draw(ctx) {}
}

// Run it with additional options.
stage = MainStage.go( { 
        canvas: 'my_canvas_id',
        loop: true 
})
```

The canvas can be specified either as a string (the ID of the canvas element) or as a direct reference to the HTMLCanvasElement.

```js
const myCanvas = document.getElementById('my_canvas_id')
class MainStage extends Stage {
    draw(ctx) {}
}
// Run it with a canvas element.
stage = MainStage.go(myCanvas)
```

```js
const myCanvas = document.getElementById('my_canvas_id')
class MainStage extends Stage {
    draw(ctx) {}
}
// Run it with additional options.
stage = MainStage.go( { 
        canvas: myCanvas,
        loop: true
})
```

## Instance `go()`

In addition to the static `go()` method, you can also start the stage using an instance method `go()`. This allows you to create an instance of the Stage first and then start it.

```js
class MainStage extends Stage {
    draw(ctx) {}
}
const stage = new MainStage('my_canvas_id')
stage.go( { loop: true } )
```

This is identical in effect to calling the static `go()` method with the same parameters. 
