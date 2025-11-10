/*
title: Parametric Egg Shape
categories: curve
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/stage-clock.js
    ../point_src/extras.js
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/functions/clamp.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/curve-extras.js

 */
class MainStage extends Stage {
    canvas='playspace'
    live = true
    mounted(){

        let size = 200
        let spin = .44
        let pj = this.projectionLength = size * ((Math.sin(spin) + Math.cos(spin) ) * .5)
        this.createPoints(size, pj)
        this.controlPointA = this.pointA.project()
        this.controlPointB = this.pointB.project()

        this.dragging.add(this.pointB, this.pointA,)
                        // this.controlPointA, this.controlPointB)

        // this.controlPointA.onDragMove = this.updatePointsToControl.bind(this)
        // this.controlPointB.onDragMove = this.updatePointsToControl.bind(this)

        this.lineStroke = new Stroke({
            color: '#fff'
            , width: 2
            , dash: [7, 4]
        })

        this.events.wake()

    }

    createPoints(width=200,  pj=this.projectionLength) {

        let x = 400
            , x2 = width + x
            , y = 300
                        // x, y, width, rotation
        this.pointA = new Point(x, y, pj, 90)
        this.pointB = new Point(x2, y, pj, 90) // default rotation == 0 (looking right)

        this.point0 = new Point(500, y, 100)

        this.pointC = new Point(x, y, pj, 90)
        this.pointD = new Point(x2, y, pj, 90) // default rotation == 0 (looking right)

        this.lineA = new BezierCurve(this.pointA, this.pointB)
        this.lineB = new BezierCurve(this.pointC, this.pointD)

        this.lineA.doTips = false;
        this.lineB.doTips = false;

    }

    updatePointsToControl(){
        // this.pointA.lookAt(this.controlPointA)
        // this.pointB.lookAt(this.controlPointB)
        this.pointC.radius = this.pointA.radius // = this.pointA.distanceTo(this.controlPointA)
        this.pointD.radius = this.pointB.radius // = this.pointB.distanceTo(this.controlPointB)

        this.pointC.rotation = this.pointA.rotation + 180
        this.pointD.rotation = this.pointB.rotation + 180

    }

    draw(ctx){
        this.clear(ctx)

        if(this.clock.tick % 5) {
            this.updatePointsToControl()
        }

        // show the spare points
        this.pointA.pen.indicator(ctx, {color: '#444'})
        this.pointB.pen.indicator(ctx, {color: '#444'})
        this.pointC.pen.indicator(ctx, {color: '#444'})
        this.pointD.pen.indicator(ctx, {color: '#444'})
        // this.point0.pen.indicator(ctx, {color: '#ccc'})


        // // Nice bright control point for the bezier curve
        // this.controlPointA.pen.fill(ctx, '#33DDAA')
        // this.controlPointB.pen.fill(ctx, '#33DDAA')

        let lineStroke = this.lineStroke
        lineStroke.set(ctx)

        this.lineA.render(ctx)
        this.lineB.render(ctx)

        lineStroke.unset(ctx)

    }
}

;stage = MainStage.go();