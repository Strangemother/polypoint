/*
title: Image Data Boundry Edge Detection
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
    ../point_src/image-edge-detection.js
    ../point_src/recttools.js
    ../point_src/offscreen.js
---


*/

class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        // this.dragging.add()
        this.point = new Point(100, 100, 50)
        this.points = PointList.generate.random(3, [100, 200], [50, 50, 10, 0])
    }

    firstDraw(ctx) {
        // this.clear(ctx)
        this.drawAll(ctx)
    }

    detectEdges(ctx) {
        const imageData = ctx.getImageData(0, 0, 400, 400)
        const data = imageData.data;
        let place = detectEdges(imageData.data, imageData.width)
        return place;
    }

    drawAll(ctx=this.ctx){
        this.clear(ctx)
        this.points.pen.fill(ctx, '#999')
        this.points.pen.indicator(ctx, {width:1})

        // this.point.pen.indicator(ctx)

        const imageData = ctx.getImageData(0, 0, 400, 400)
        const data = imageData.data;

        // sepia(data)
        // ctx.putImageData(imageData, 200, 10);

        // invert(data)
        // ctx.putImageData(imageData, 400, 30);

        // grayscale(data)
        // ctx.putImageData(imageData, 600, 30);

        // const reImageData = ctx.getImageData(0, 0, 800, 600)
        let place = detectEdges(imageData.data, imageData.width)

        ctx.putImageData(imageData, 0, 300);

        this.place = place

        this.plotEdgePoints(place)
        this.drawPins(ctx)
    }

    plotEdgePoints(place){
        this.boxPoints = new PointList(
                [place.left, place.top]
                , [place.left, place.bottom]
                // , [place.right, place.bottom]
                // , [place.right, place.top]
                // , [place.left, place.top]
            ).cast()
        this.boxPoints2 = new PointList(
                // [place.left, place.top]
                // , [place.left, place.bottom]
                 [place.right, place.bottom]
                , [place.right, place.top]
                // , [place.left, place.top]
            ).cast()
    }

    drawPins(ctx){
        this.boxPoints.pen.indicator(ctx, {color: 'red'})
        this.boxPoints2.pen.indicator(ctx, {color: 'yellow'})
    }

    onResize(ev) {
        console.log('Resize', this)
        /* Resize may occur before mounted().
        As such - easy back-out... */
        if(this.points) {
            this.drawAll()
        }
    }

    createImage(){
        /* grab the placement, and create a new download image with cropping.*/
        let edges  = this.place
        let offscreen = this.offscreen.create(edges)
        let ctx = this.ctx
        const imageData = ctx.getImageData(
            edges.left, //x
            edges.top, //y
            edges.width,
            edges.height
        )
        // const data = imageData.data;
        let offCtx = offscreen.getContext('2d')
        offCtx.putImageData(imageData, 0, 0);
        setTimeout(()=>{
            let cb = (blob) => {
                const anchor = document.createElement('a');
                anchor.download = name
                anchor.href = URL.createObjectURL(blob);
                anchor.click(); // ✨ magic!
                // URL.revokeObjectURL(anchor.href); // remove it from memory and save on memory! 😎
                setTimeout(()=> URL.revokeObjectURL(anchor.href), 1000)
            }
            offscreen.convertToBlob().then(cb);
        },1)

    }

    draw(ctx){
        this.drawPins(ctx)
    }
}


;stage = MainStage.go({ loop: false});