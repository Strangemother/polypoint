/*
title: Offscreen rendering.
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

Use the `copyToOnScreen` function to copy an offscreen canvas to the onscreen
canvas.

However we see when applied, offscreen canvas image is distorted due to
a dimensions mismatch
 */

class MainStageOffScreenContext extends Stage {
    /* In this format we Install an "offscreen canvas" as the primary rendering unit.

    the `copyToOnScreen` copies the offScreen canvas into the visible onscreen canvas.
    */
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'
    // canvas = new OffscreenCanvas(500, 400)

    mounted(){
        // this.canvas = new OffscreenCanvas(500, 400)
        // this.canvas = this.canvas.transferControlToOffscreen()
        this.offScreenCanvas = new OffscreenCanvas(500, 400)
        this._ctx = this.offScreenCanvas.getContext('2d')
        // this.onScreenCanvas = document.getElementById("playspace")//.getContext("2d");
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
        var context = this.offScreenCanvas.getContext("2d");

        // this.clear(ctx)

        context.fillStyle = '#444'; //set fill color
        context.fillRect(10, 10, 40, 40);
        (new Point(20,20,20)).pen.indicator(context)

        this.point.rotation += 1
        this.point.pen.indicator(ctx)

        copyToOnScreen(this.offScreenCanvas, this.canvas)
    }

}


stage = MainStageOffScreenContext.go()