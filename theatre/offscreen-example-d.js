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
    ../point_src/offscreen.js
    ../point_src/image.js
    mouse
    dragging
    stroke
---

convert the offscreen canvas through `transferToImageBitmap`
and perform `drawImage(bitmap, ...)`
*/

class MainStageOffScreenNoPrimary extends Stage {
    /* */
    canvas = document.getElementById('playspace');

    mounted(){
        this.offscreenCanvas = new OffscreenCanvas(100, 100)
        this.point = new Point(50, 50, 10)
        this.image = new ImageLoader()

    }

    draw(ctx){
        var octx = this.offscreenCanvas.getContext("2d");

        // this.clear(ctx)
        // ImageBitmap { width: 256, height: 256 }
        // this.image.imageData = bitmap
        // this.image.position.xy = [20, 20]
        // ctx.drawImage(this.image.imageData, 1, 1)
        // ctx.fillStyle = '#444'; //set fill color

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
