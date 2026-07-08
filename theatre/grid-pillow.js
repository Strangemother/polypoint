/*
title: Grid Pillow
category: grid
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/extras.js
    ../point_src/distances.js
 */

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.center.radius = 50

        let pointSpread = 55 /* Distance between points */
        let rowCount = 10 /* How many items per row within the grid */

        const pointList = PointList.generate.list(100, 0)

        /* To set the position of the grid generator, we can just edit the
        first point. */
        pointList[0].set(50, 50)
        /* Then reshape internally */
        pointList.shape.grid(pointSpread, rowCount)
        pointList.forEach(p => p.radius = 10)
        // pointList.each.radius = 10

        this.points = pointList
    }

    draw(ctx){
        this.clear(ctx)

        let mousePoint = Point.mouse.position
        /* Draw each point; wrapping the _draw_ call_ with our own functionality.*/
        this.points.pen.points(ctx, (item,f)=>{
            item.lookAt(mousePoint)
            /* Perform the given rendering function*/
            f(item)
            /* to draw _cushion_ style, we _project_ towards the mouse,
            then draw a point.*/
            item.project().pen.indicator(ctx, item)
        })
    }
}

stage = MainStage.go()
