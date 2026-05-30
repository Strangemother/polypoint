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
    ../point_src/text/beta.js
---


*/

;addButton('Update', {
    onclick(){
        stage.drawAll()
    }
});


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        // this.dragging.add()
        this.point = new Point(400, 400, 400)
        // this.points = PointList.generate.random(3, [100, 200], [50, 50, 10, 0])
    }

    firstDraw(ctx) {
        // this.clear(ctx)
        this.drawAll(ctx)
    }

    // detectEdges(ctx) {
    //     const imageData = ctx.getImageData(0, 0, 400, 400)
    //     const data = imageData.data;
    //     let place = detectEdges(imageData.data, imageData.width)
    //     return place;
    // }

    getChar(){
        return  String.fromCharCode(random.int(65, 90))
    }

    drawAll(ctx=this.ctx){
        this.clear(ctx)

        /* Things to draw */
        // this.points.pen.indicator(ctx, {width:1})

        let r2 = this.point.radius
        // this.point.pen.indicator(ctx, {width:1})

        ctx.fillStyle = 'purple'
        ctx.font = `${r2*2}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        this.point.text.string(ctx, this.getChar())

        // crop this space to detect.
        const imageData = this.cropImage({
                left: 0
                , top: 0
                , width: this.point.x * 2
                , height: this.point.y * 2
            }, ctx);

        let place = detectEdges(imageData.data, imageData.width)

        this.place = place

        this.plotEdgePoints(place)
        this.drawPins(ctx)

        const mr = (v)=>{
            return Math.min(Math.round(v), 255);
        }

        let space = 10
        let stash = [];

        eachPixel(imageData, (rgb, irgb, i, j, data)=>{
            let [r,g,b] = rgb;
            // debugger;
            if(i % space == 0 && (~~j) % space == 0){
                stash.push({x:i, y:(~~j) * 20, color:rgb})
                return [0, 255, 0]
            }
        })

        let plotPoints = new PointList(...stash).cast();
        plotPoints.update({ radius: 5})
        plotPoints.pen.indicator(ctx)
        // Reapply the data.
        ctx.putImageData(imageData, 0, 400);

    }

    plotEdgePoints(place){
        this.boxPoints = new PointList(
                [place.left, place.top]
                , [place.left, place.bottom]
                // , [place.right, place.bottom]
                // , [place.right, place.top]
                // , [place.left, place.top]
            ).cast();

        this.boxPoints2 = new PointList(
                // [place.left, place.top]
                // , [place.left, place.bottom]
                 [place.right, place.bottom]
                , [place.right, place.top]
                // , [place.left, place.top]
            ).cast();

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

    cropImage(xywh=this.dimensions, ctx=this.ctx){
        /* return image data at the given position. */
        const imageData = ctx.getImageData(
            xywh.left, //x
            xywh.top, //y
            xywh.width,
            xywh.height
        )

        return imageData;
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
        // this.drawPins(ctx)
    }
}


;stage = MainStage.go({ loop: false});