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
        // this.offScreen = this.canvas.transferControlToOffscreen()
        this._ctx = this.canvas.getContext('2d')
        this.onScreenCanvas = document.getElementById("playspace")//.getContext("2d");
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
        var context = ctx // this.offScreen.getContext("2d");

        // this.clear(ctx)

        ctx.fillStyle = '#444'; //set fill color
        ctx.fillRect(10, 10, 40, 40);

        this.point.rotation += 1
        this.point.pen.indicator(ctx)

        copyToOnScreen(this.canvas, this.onScreenCanvas)
    }

}

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
        this.offScreen = new OffscreenCanvas(500, 400)
        this._ctx = this.offScreen.getContext('2d')
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
        var context = this.offScreen.getContext("2d");

        // this.clear(ctx)

        context.fillStyle = '#444'; //set fill color
        context.fillRect(10, 10, 40, 40);

        this.point.rotation += 1
        this.point.pen.indicator(ctx)

        copyToOnScreen(this.offScreen, this.canvas)
    }

}


stage = MainStageOffScreenContext.go()//{ loop: false })
// stage = MainStageOffScreenNoPrimary.go()//{ loop: false })
// stage = MainStage.go()//{ loop: false })
