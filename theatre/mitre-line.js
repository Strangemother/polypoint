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
        this.point = this.center.copy().update({radius: 100})
        this.points = new PointList(
                [233, 325, 20]
                , [189, 169, 30]
                , [442, 113, 30]
                , [626, 215, 70]
                , [525, 419, 20]
            ).cast()

        this.dragging.add(...this.points)
    }

    draw(ctx){
        this.clear(ctx)
        ctx.strokeStyle = '#444'
        this.points.pen.circle(ctx)
        ctx.strokeStyle = '#880000'
        this.points[0].rotation = 0
        this.points[1].rotation = -180

        let midPoint = this.points[0].project()
        let midPoint2 = this.points[1].project()
        this.points[0].pen.line(ctx, midPoint)
        midPoint.pen.line(ctx, midPoint2)
        midPoint2.pen.line(ctx, this.points[1])
    }
}


stage = MainStage.go(/*{ loop: true }*/)

