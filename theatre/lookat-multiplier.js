/*
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/stage.js
    ../point_src/distances.js
    ../point_src/automouse.js
    ../point_src/extras.js
---

The `turnTo` method acts very similar to the `lookAt` method, but accepts a
speed to denote _how quickly_ the origin point should turn to the target.

    const origin = new Point(200, 200, 20)
    // between 0 and 1
    origin.turnTo(Point.mouse.poition, .01)

*/


const drawView = function(ctx, lookerPoint){

    /* Project to the distance of the mouse. */
    const projectedPoint = lookerPoint.project()
    /* Draw from the projected point back to the origin. */
    projectedPoint.pen.line(ctx, lookerPoint, 'red')
    projectedPoint.pen.circle(ctx, {color: 'red'})
}


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.pointA = this.center.copy().update({ radius: 100 })
        this.pointB = this.pointA.copy()
        this.pointC = this.pointA.copy()
    }

    draw(ctx){
        this.clear(ctx)
        let targetPosition = Point.mouse.position

        this.pointA.turnTo(targetPosition, .01)
        this.pointB.turnTo(targetPosition, 1)
        this.pointC.turnTo(targetPosition, .001)

        drawView(ctx, this.pointA)
        drawView(ctx, this.pointB)
        drawView(ctx, this.pointC)
    }
}


stage = MainStage.go(/*{ loop: true }*/)
