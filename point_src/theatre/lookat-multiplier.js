
const drawView = function(ctx, lookerPoint){

    // let lookerPoint = this.lookerPoint
    // lookerPoint.pen.indicator(ctx, { color: 'green', width: 3})

    // Draw a circle at the origin point.
    // lookerPoint.pen.circle(ctx)
    // quickStroke('green', 2)

    /* Then project the point; default radius, rotation; and draw a circle. */
    let targetPosition = Point.mouse.position;
    let distanceToMouse = lookerPoint.distanceTo(targetPosition)
    /* Clamp the object. */
    let distance = Math.min(distanceToMouse, lookerPoint.radius);
    // let distance = Math.max(distanceToMouse, lookerPoint.radius);
    /* Alterntively project to the distance of the mouse. */
    const projectedPoint = lookerPoint.project()//distance)
    /* Draw from the projected point back to the origin. */
    projectedPoint.pen.line(ctx, lookerPoint)
    projectedPoint.pen.circle(ctx)
    // quickStroke(ctx, 'red', 1)

    /* And draw a circle at the tip of projection. */
    // quickStroke(ctx, 'yellow', 1)
}

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){

        const pointA = point(200, 200)
        pointA.radius = 100
        this.pointA = pointA

        const pointB = point(200, 200)
        pointB.radius = 100
        this.pointB = pointB

        const pointC = point(200, 200)
        pointC.radius = 100
        this.pointC = pointC
    }

    draw(ctx){
        this.clear(ctx)
        let targetPosition = Point.mouse.position;
        this.pointA.turnTo(targetPosition, .01)
        this.pointB.turnTo(targetPosition, 1)
        this.pointC.turnTo(targetPosition, .001)
        // this.lookerPoint.lookAt(targetPosition, 1)
        drawView(ctx, this.pointA)
        drawView(ctx, this.pointB)
        drawView(ctx, this.pointC)
    }
}

stage = MainStage.go(/*{ loop: true }*/)

// Point.mouse.listen(canvas)

