/*
title: Offscreen transferControlToOffscreen
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


In this example we call `canvas.transferControlToOffscreen()` on mount and
set the stage context to the returned offscreen canvas.
This copies the stage dimensions is similar to `stage.offscreen.create()`.
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

        // this.offScreenCanvas = this.offscreen.create()
        this.offScreenCanvas = this.canvas.transferControlToOffscreen()
        this._ctx = this.offScreenCanvas.getContext('2d')
        // this.onScreenCanvas = document.getElementById("playspace")//.getContext("2d");
        this.point = new Point(40, 40)
    }

    draw(ctx){
        // this.clear(ctx)
        ctx.fillStyle = '#444'; //set fill color
        ctx.fillRect(10, 10, 40, 40);
        this.mouse.point.pen.indicator(ctx)
        this.point.rotation += 1
        this.point.pen.indicator(ctx)
    }

}



stage = MainStageOffScreenContext.go()//{ loop: false })
// stage = MainStageOffScreenNoPrimary.go()//{ loop: false })
// stage = MainStage.go()//{ loop: false })
