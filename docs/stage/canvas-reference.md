title: Canvas Reference
---

The `Stage` accepts a canvas in multiple ways. 

## Formats  

In all methods, the canvas can be specified either as a string (the ID of the canvas element) or as a direct reference to the HTMLCanvasElement.

+ String: `"my_canvas_id"`
+ Element: `document.getElementById('my_canvas_id')`
+ Selector: `document.querySelector('#my_canvas_id')`

The selector method must resolve to one single `<canvas>` element.

## Providing the canvas

A stage needs a needs a canvas to draw on.

### Stage Constructor

You can pass the canvas ID or element directly to the `Stage` constructor:

```js
class MainStage extends Stage {
    draw(ctx) {}
}

const stage = new MainStage('playspace') // here
stage.go()
```

### Stage Property

You can set the `canvas` property in your `Stage` subclass:

```js
class MainStage extends Stage {
    canvas = "my_canvas_id"             // here
    draw(ctx) {}
}
// Run it.
stage = MainStage.go()
```

### Stage `go()` Method

Alternatively, you can pass the canvas ID directly to the `go()` method: 

```js
class MainStage extends Stage {
    draw(ctx) {}
}
// Run it on a specific canvas.
MainStage.go('my_canvas_id')            // here
```

## With additional options

You can also pass additional options to the `go()` method, such as enabling the drawing loop:

```js
class MainStage extends Stage {
    // canvas is not set here
    draw(ctx) {}
}
// Run it with additional options.
stage = MainStage.go( {
        canvas: 'my_canvas_id',         // here
        loop: false 
})
```

