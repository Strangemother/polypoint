/*
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/text/beta.js
    mouse
    ../point_src/random.js
    dragging
    stage
    stroke
    ../point_src/split.js
    ../point_src/bisector.js
    ../point_src/angle.js
*/
class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        // this.point = this.center.copy().update({radius: 100})
        this.points = new PointList(
                [233, 325, 20]
                , [189, 169, 30]
                // , [442, 113, 30]
                // , [626, 215, 70]
                // , [525, 419, 20]
            ).cast()

        this.dragging.add(...this.points)
    }

    draw(ctx){
        this.clear(ctx)
        ctx.strokeStyle = '#444'
        this.points.pen.circle(ctx)
        ctx.strokeStyle = '#880000'
        let a = this.points[0]
        let b = this.points[1]

        let deg = radiansToDegrees(a.directionTo(b))
        a.rotation = quantizeAngle(deg, 4)

        deg = radiansToDegrees(b.directionTo(a))
        b.rotation = quantizeAngle(deg, 4)

        // a.rotation = 0
        // b.rotation = -180

        /* Draw a line from center, to the projected tip (radius)*/
        let aTip = a.project()
        a.pen.line(ctx, aTip)

        /* Draw a line from center, to the projected tip (radius)
        Other Line.*/
        let bTip = b.project()
        bTip.pen.line(ctx, b)

        /* Draw the line between the two target points.*/
        aTip.pen.line(ctx, bTip)
    }
}


stage = MainStage.go(/*{ loop: true }*/)

