/*
title: Offscreen rendering.
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
    ../point_src/image.js
    ../point_src/offscreen.js
    mouse
    dragging
    stroke
---

.
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

        this.offScreenCanvas = this.offscreen.create({width:100, height:100})
        this.image = new ImageLoader;

        let oCtx = this.offScreenCanvas.getContext('2d')
        oCtx.fillStyle = '#444'; //set fill color
        oCtx.fillRect(10, 10, 40, 40);

        this.point = new Point(10,20)
        this.point.rotation += 10
        this.point.pen.indicator(oCtx)

        this.updateImage()

        this.image.position.radius = 50
        this.dragging.add(this.image.position)
        // this.onScreenCanvas = document.getElementById("playspace")//.getContext("2d");
    }

    updateImage(data){
        if(data == undefined){
            data = this.offScreenCanvas.transferToImageBitmap()
        }
        this.image.setImageData(data)
    }


    draw(ctx){
        this.clear(ctx)
        // this.mouse.point.pen.indicator(ctx)
        this.point.rotation += 1
        // this.point.pen.indicator(ctx)

        // let data = this.offScreenCanvas.transferToImageBitmap()
        // this.updateImage(data)
        this.image.position.pen.circle(ctx, {color:'#3356FF'})
        this.image.draw(ctx)
    }

}



stage = MainStageOffScreenContext.go()//{ loop: false })
// stage = MainStageOffScreenNoPrimary.go()//{ loop: false })
// stage = MainStage.go()//{ loop: false })
