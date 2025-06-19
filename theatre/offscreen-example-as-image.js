/*
title: Offscreen as image.
category: offscreen
files:
    head
    ../point_src/math.js
    ../point_src/extras.js
    ../point_src/point-content.js
    pointlist
    point
    stage
    ../point_src/image.js
    ../point_src/offscreen.js
    mouse
    dragging
    stroke
---

*/

class MainStageOffScreenContext extends Stage {
    /* In this format we Install an "offscreen canvas" as the primary
    rendering unit.

    the `copyToOnScreen` copies the offScreen canvas into the visible onscreen
    canvas.
    */

    canvas = 'playspace'

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

    updateImage(data=this.offScreenCanvas.transferToImageBitmap()){
        // if(data == undefined){
        //     data = this.offScreenCanvas.transferToImageBitmap()
        // }
        this.image.setImageData(data)
    }

    redrawOffscreen() {
        let oCtx = this.offScreenCanvas.getContext('2d')
        oCtx.fillStyle = '#444'; //set fill color
        oCtx.fillRect(10, 10, 40, 40);

        this.point.pen.indicator(oCtx)
        this.updateImage()

    }

    draw(ctx){
        this.clear(ctx)
        // this.mouse.point.pen.indicator(ctx)
        this.point.rotation += 2
        // this.point.pen.indicator(ctx)
        this.redrawOffscreen()
        // let data = this.offScreenCanvas.transferToImageBitmap()
        // this.updateImage(data)
        this.image.position.pen.circle(ctx, {color:'#3356FF'})
        this.image.draw(ctx)
    }

}



stage = MainStageOffScreenContext.go()//{ loop: false })