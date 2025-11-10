/*
title: Offscreen Canvas with Context Replacement
category: offscreen
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/extras.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/point.js
    ../point_src/stage.js
    ../point_src/offscreen.js
    mouse
    dragging
    stroke
---

In this example, there is no `Stage.canvas` applied (initially).

Instead an `OffscreenCanvas`  canvas is created on `mount()` stage, replacing the
inner `stage.ctx` with the offscreen alternative.

The `draw(ctx)` context entity is the _offscreen_ canvas layer. Once everything is complete,
we call `copyToOnScreen(offscreenCanvas, onScreenCanvas)` to push the content into
something visible.

Fundamentally the stage works in the same manner, as with a standard canvas,
The only change is the final `copyToOnScreen` call.
 */


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
        this.onScreenCanvas = document.getElementById("playspace")//.getContext("2d");
        this.onScreenCanvas.width = 500
        this.onScreenCanvas.height = 400
        this.point = new Point(10, 10)
    }

    // resolveCanvas() {}

    // stickCanvasSize(canvas){
    //     const onScreenCanvas = document.getElementById("playspace")//.getContext("2d");
    //     onScreenCanvas.width = 300
    //     onScreenCanvas.height = 200
    //     return
    // }

    draw(ctx){
        var context = ctx // this.offScreenCanvas.getContext("2d");

        // this.clear(ctx)

        ctx.fillStyle = '#444'; //set fill color
        ctx.fillRect(10, 10, 40, 40);

        this.point.rotation += 1
        this.point.pen.indicator(ctx)

        copyToOnScreen(this.canvas, this.onScreenCanvas)
    }

}

stage = MainStageOffScreenNoPrimary.go()//{ loop: false })
// stage = MainStageOffScreenDirect.go()//{ loop: false })
