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
    ../point_src/recttools.js
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

        // this.points.pen.fill(ctx, '#999')
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
        console.log('place', place)
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

    draw(ctx){
        this.boxPoints.pen.indicator(ctx, {color: 'red'})
        this.boxPoints2.pen.indicator(ctx, {color: 'yellow'})
    }
}


var detectEdges = function(data, width) {

    const round = Math.round;
    const min = Math.min;
    const max = Math.max;
    let dl = data.length
    let lineCount = (dl * .25) / width
    let rowAlpha = 0
    let lastCurrentRow = -1
    let doneSide = false;
    let tolerance = 2
    let leftValue = width // -1
    let rightValue = -1
    let topValue = 0
    let bottomValue = 0

    let doneRowLeft = false
    let doneRowTop = false

    for (var i = 0; i < dl; i += 4) {
        let currentRow = Math.floor(i / (width * 4));
        let currentColumn = (i * .25) % width;
        let alpha = data[i+3];

        if(currentRow > lastCurrentRow) {
            // moved to new row
            doneRowLeft = false

            /* top -> down */
            if(doneRowTop == false) {
                if(rowAlpha > tolerance) {
                    doneRowTop = true
                } else {
                    topValue += 1
                }
            }

            /* bottom -> up */
            if(rowAlpha > tolerance) {
                bottomValue = currentRow
            }

            rowAlpha = 0
        }

        rowAlpha += alpha

        /* right to left. */
        if(alpha > tolerance) {
            rightValue = max(rightValue, currentColumn)
        }

        /* left to right */
        if(doneRowLeft == false && rowAlpha > tolerance) {

            if(currentColumn < leftValue) {
                leftValue = currentColumn;
            }

            doneRowLeft = true
        }

        lastCurrentRow = currentRow
    }

    let d = {
        'top': topValue
        , 'left': leftValue
        , 'right': rightValue
        , 'bottom': bottomValue
    }

    return d
}


;stage = MainStage.go({ loop: false});