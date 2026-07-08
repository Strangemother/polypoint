/*
title: Image Data Reshading
categories: imagedata
    raw
files:
    head
    pointlist
    point
    stage
    stroke
    ../point_src/random.js
    ../point_src/image.js
---

*/

class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        // this.dragging.add()
        this.points = PointList.generate.random(30, [100, 200], [40,20, 10, 0])
    }

    firstDraw(ctx) {
        // this.clear(ctx)
        this.points.pen.fill(ctx, '#999')
        this.points.pen.indicator(ctx)
        const imageData = ctx.getImageData(0, 0, 400, 400)
        const data = imageData.data;

        sepia(data)
        ctx.putImageData(imageData, 200, 10);

        invert(data)
        ctx.putImageData(imageData, 400, 30);

        grayscale(data)
        ctx.putImageData(imageData, 600, 30);

        // blur(data, 400, 150)
        // blur3(data, 400, 150, 10)
        // blurSeparable(data, 400, 150, 3)

    }

    draw(ctx){
    }
}


;stage = MainStage.go();