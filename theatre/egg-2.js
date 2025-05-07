/*
title: Egg 2
categories: curve
src_dir: ../point_src/
files:
    head
    pointlist
    point
    ../point_src/math.js
    ../point_src/point-content.js
    mouse
    stage
    ../point_src/stage-clock.js
    ../point_src/extras.js
    ../point_src/random.js
    dragging
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/curve-extras.js
    xybind
---

 */
class MainStage extends Stage {
    canvas='playspace'
    live = true

    mounted(){
        let size = 200
        let spin = .44
        let pj = this.projectionLength = size * ((Math.sin(spin) + Math.cos(spin) ) * .5)
        this.createPoints(size, pj)

        this.dragging.add(...this.points)

        this.lineStroke = new Stroke({
            color: '#fff'
            , width: 2
            , dash: [7, 4]
        })

        this.lineStroke2 = new Stroke({
            color: '#CCC'
            , width: 2
            , dash: [7, 4]
        })

        this.events.wake()
    }

    createPoints(width=200,  pj=this.projectionLength) {
        let x = 400
            , x2 = width + x
            , y = 300

        this.points = new PointList(
            new Point(x, y, pj)
            , new Point(x2, y, pj)
        )

        this.eggPoints = new PointList(
            new Point(x, y, pj)
            , new Point(x2, y, pj)

            , new Point(x, y, pj, 90)
            , new Point(x2, y, pj, 90)
        )

        this.lineA = new BezierCurve(this.eggPoints[0], this.eggPoints[1])
        this.lineB = new BezierCurve(this.eggPoints[2], this.eggPoints[3])
        this.lineA.doTips = false
        this.lineB.doTips = false
    }

    updatePointsToControl(){

        const cloneData = (index, pointIndex, extra=0) => {
            /* Copy data from the `point` units into the
            target eggPoint */
            if(pointIndex==undefined) {
                pointIndex=index;
            }
            this.eggPoints[index].xy = this.points[pointIndex].xy
            this.eggPoints[index].radius = this.points[pointIndex].radius
            this.eggPoints[index].rotation = this.points[pointIndex].rotation + extra
        }

        /* The egg points should copy the primary point positions */
        cloneData(0)
        cloneData(1)
        cloneData(2,0, 180)
        cloneData(3,1, 180)
    }

    draw(ctx){
        this.clear(ctx)
        if(this.clock.tick % 5) {
            this.updatePointsToControl()
        }

        // this.eggPoints.pen.indicator(ctx, {color: '#336655'})
        this.points.pen.indicator(ctx, {color: '#336600'})

        let lineStroke = this.lineStroke
        let lineStroke2 = this.lineStroke2

        lineStroke.set(ctx)
        this.lineA.render(ctx)
        lineStroke.unset(ctx)

        lineStroke2.set(ctx)
        this.lineB.render(ctx)
        lineStroke2.unset(ctx)
    }
}

;stage = MainStage.go();