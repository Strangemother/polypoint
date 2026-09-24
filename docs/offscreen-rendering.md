# OffScreen Canvas

> https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas

Polypoint supports offscreen rendering through a range of integrated or native methods.
For our first flavour, let's look at a more native implementation.

## Easy Native

Using a `Stage` is optional, but it saves the boilerplate and we can override anything as required.

Here, we see the typical `Stage.canvas` property completely ommited. Therefore the `MainStageOffScreenNoPrimary` will not hook a canvas by default.

In the `mounted`, we manually create a `new OffscreenCanvas()` and glue it to the stage.

```js
class MainStageOffScreenNoPrimary extends Stage {
    /* In this this example, we completely ignore the _setup_ canvas,
    opting to create an offScreen canvas after the setup.

    The offscreen is rendered to the onscreen using the `copyToOnScreen`
    */
    // canvas = document.getElementById('playspace');
    // canvas = 'playspace'
    // canvas = new OffscreenCanvas(500, 400)

    mounted(){
        this.canvas = new OffscreenCanvas(500, 400)
        // this.offScreenCanvas = this.canvas.transferControlToOffscreen()
        this._ctx = this.canvas.getContext('2d')
        
        this.onScreenCanvas = document.getElementById("playspace")
        this.onScreenCanvas.width = 500
        this.onScreenCanvas.height = 400
        this.point = new Point(10, 10)

    } 
    // .. Continued below.
```

Because we applied an offscreen canvas to the `this.canvas`, the Polypoint stage will render to the offscreen canvas.

The `onScreenCanvas` is our own thing, somewhere we'll eventually push a rendered frame.
Next we need to utilise the draw frame at the correct time. continuing the class example from above, we add the `draw(ctx)` method.

```js
    // .. continued from above. 
    draw(ctx){
        // this.clear(ctx)

        ctx.fillStyle = '#444'; //set fill color
        ctx.fillRect(10, 10, 40, 40);

        this.point.rotation += 1
        this.point.pen.indicator(ctx)

        copyToOnScreen(this.canvas, this.onScreenCanvas)
    }

} // close class. 
```

The draw method performs some typical drawing on the _offscreen_ canvas, and then calls the important method: `copyToOnScreen(offScreen, onScreen)`.

This grabs the frame at the very end of our draw method, and applies it to the waiting on-screen canvas. 

## Easy Native - Reversed!

It doesn't matter which canvas is owned by the stage. For fun, here's the same thing where the _onscreen_ canvas is unchanged, but we _draw_ to the offscreen canvas

```js

class MainStageOffScreenContext extends Stage {
    canvas = 'playspace'

    mounted(){
        this.offScreenCanvas = new OffscreenCanvas(500, 400)
        this._ctx = this.offScreenCanvas.getContext('2d')
        this.point = new Point(10, 10)
    }

    draw(ctx){
        /* Draw to the offscreen canvas,
       then copy to the internal onscreen canvas. */
        var context = this.offScreenCanvas.getContext("2d");
        
        context.fillStyle = '#444'; //set fill color
        context.fillRect(10, 10, 40, 40);
        (new Point(20,20,20)).pen.indicator(context)

        this.point.rotation += 1
        this.point.pen.indicator(ctx)

        copyToOnScreen(this.offScreenCanvas, this.canvas)
    }

}
```


## Offscreen Bitmap

```js

class MainStageOffScreenNoPrimary extends Stage {
  
    canvas = document.getElementById('playspace');

    mounted(){
        this.offscreenCanvas = new OffscreenCanvas(100, 100)
        this.point = new Point(50, 50, 10)
        this.image = new ImageLoader()

    }

    draw(ctx){
        var octx = this.offscreenCanvas.getContext("2d");

        /* Draw onto the offscreen canvas. */
        octx.fillRect(0, 0, 100, 100);
        this.point.rotation += 1
        this.point.pen.indicator(octx)

        // Create bitmap from offscreen canvas
        let bitmap = this.offscreenCanvas.transferToImageBitmap()

        // Draw bitmap onto the main canvas with scaling
        /* Draw Image (bitmap),
        gathering a 2d top left, bottom right slice from the bitmap
        then drawing the 2d 2 points on the context.

        The dimensions of the _write_ should match the expected shape.
        This allows scaling when applying the image.
        */
        ctx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height, 10, 10, 110, 110);

    }

}

stage = MainStageOffScreenNoPrimary.go()//{ loop: false })
// stage = MainStageOffScreenDirect.go()//{ loop: false })

```