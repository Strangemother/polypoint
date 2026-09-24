# stage lifecycle

The `Stage` is designed to be a light wrapper to the draw method.

A Polypoint stage has a range of accessbility routines, including methods, events, or functional hooks

## Call Stack

A hot breakdown of the Stage lifecycle. Notably this isn't a comprehensive list of available routines:

    constructor()
        prepare()
            stickCanvasSize()
            mounted()           <-- hook
            ?load()             <-- hook

    go()
        cleanGoConfig()
        ?prepare()             <-- hook
        update()
            stageStartDraw()
                firstDraw()    <-- hook
                update()
        update()
            draw()             <-- hook
        unfreeze()
            loopDraw()
                update()
                    draw()
                loopDraw ...


An absolute minimal example for a typical setup:

```js
class MainStage extends Stage {
    canvas = 'playspace' // id.
    
    mounted() { }
    
    draw(ctx){
        this.clear(ctx)
    }
}

stage = MainStage.go()
```


## Methods

The primary start point to access your running stage instance is the `mounted(canvas)` method. It's called after the `prepare()` has done it's job. 

Importantly the `mounted()` only occurs if an `Stage.canvas` is applied.

```js
class MainStage extends Stage {
    canvas = playspace
    mounted(canvas){
        // Is called. 
    }
}

class NoCanvasMainStage extends Stage {
    // canvas = playspace
    mounted(canvas){
        // is not called. 
    }
}
```

### `prepare(canvas)`

The `prepare(canvas)` method performs any _pre-mounted_ setup for this stage instance to run the canvas tools. This includes resolving and measuring the canvas.

```js
class MainStage extends Stage {
    canvas = playspace
    prepare(target){
        super.prepare(target)
        // ...
    }
}
```
`
This will run automatically if the canvas is given in the constructor:

```js
new MainStage(canvas)
// _prepared == true
```

Once prepared the stage is essentially ready-to-go. Typically the prepare method will:

+ Assign the stage target
+ resolve the canvas (if given)
+ _stick_ the canvas size
+ bind the loop method
+ call `mounted(canvas)`

Run it manually:

```js
stage = new MainStage()
stage.prepare(canvas)
stage.update()
```

### `load()`

Called **once** by the `prepare()` method, to act as a first-time loader for the stage. Apply global hooks here.

```js

class Main extends Stage {
    load() {
        super.load()
    }
}
```

Importantly this is loaded _once_ per instance call. if the `stage.loaded == true`, the method will be skipped.


### `mounted(canvas)`

The `mounted` method is the primary location for your initial code, knowing the canvas is ready to draw.

Importantly this method occurs before the first animation frame queued call:

```js
class MainStage extends Stage {
    canvas = playspace
    mounted(canvas){
        this.thing = new Point()
    }
}
```


### `firstDraw(ctx)`

The `firstDraw(ctx)` method us used _once_ when drawing starts.This occurs before the first `update()` call is performed.

This is useful if you're setting context arguments - but only need to
set them once.

```js
class Main extends Stage {
    firstDraw(ctx) {
        ctx.fillStyle = '#ccc'
        ctx.font = 'normal 1em arial'
    }
}
```

### `draw(ctx)`

The primary rendering function to override. Called by the `update()` method, given the context `ctx` of the target canvas.


```js
class Main extends Stage {
    draw(ctx) {
        this.clear(ctx)
        this.center.pen.fill(ctx, 'pink')
    }
}
```

There is nothing _special_ about this method. It's supported by the stage to be called by the animation frame. The  `ctx` provides the same drawing layer as a standard 
`requestAnimationFrame(func);` call

The `draw(ctx)` method is called by the `update()` method every frame.


#### Manual Draw

The stage builtin is essentially the same as running the update function manually:


```js
const ctx = canvas.getContext('2d');
const stage = new MainStage()

stage.prepare(canvas)

function draw() {

    // or: stage.clear(ctx)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Run the draw routines
    stage.draw(ctx)

    // And rinse repeat.
    requestAnimationFrame(draw);

}

draw()
```
