/*
title: Offscreen Direct
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

 */


class MainStageOffScreenDirect extends Stage {
    /* In this format we Install an "offscreen canvas" as the primary rendering unit.

    the `copyToOnScreen` copies the offScreen canvas into the visible onscreen canvas.
    */
    // canvas = document.getElementById('playspace');
    // canvas = 'playspace'
    canvas = new OffscreenCanvas(500, 400)

    mounted(){
        this.onScreenCanvas = document.getElementById("playspace")//.getContext("2d");
        this.point = new Point(10, 10)
    }

    draw(ctx){
        // this.clear(ctx)

        ctx.fillStyle = '#444'; //set fill color
        ctx.fillRect(10, 10, 40, 40);

        this.point.rotation += 1
        this.point.pen.indicator(ctx)

        copyToOnScreen(this.canvas, this.onScreenCanvas)
    }

}



// stage = MainStageOffScreenContext.go()//{ loop: false })
// stage = MainStageOffScreenNoPrimary.go()//{ loop: false })
stage = MainStageOffScreenDirect.go()//{ loop: false })
