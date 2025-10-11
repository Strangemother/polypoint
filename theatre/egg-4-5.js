/*
title: Egg 2
categories: curve
src_dir: ../point_src/
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
    ../point_src/stage-clock.js
    ../point_src/extras.js
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/functions/clamp.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/curve-extras.js
    xybind
    ../point_src/functions/springs.js
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
        // this.dragging.add(...this.points, ...this.controlPoints)

        this.lineStroke = new Stroke({
            color: '#ccc'
            , width: 2
            , dash: [10,2]
        })

        this.lineStroke2 = new Stroke({
            color: '#CCC'
            , width: 2
            , dash: [8, 2]
        })

        // this.events.wake()
    }

    createPoints(width=200,  pj=this.projectionLength) {
        let x = 400
            , x2 = width + x
            , y = 300

        this.points = new PointList(
            new Point({x, y
                , radius: pj
                , rotation: 90
                , vx: 0, vy: 1
                , mass: 1
            })
            , new Point({x:x2, y
                , radius: pj
                , rotation: -90
                , vx: 0, vy: 1
                , mass: 1
            })
        )

        this.eggPoints = new PointList(
            new Point(x, y, pj - 30)
            , new Point(x2, y, pj - 30)

            , new Point(x, y, pj)
            , new Point(x2, y, pj)
        )

        this.lineA = new BezierCurve(this.eggPoints[0], this.eggPoints[1])
        this.lineB = new BezierCurve(this.eggPoints[2], this.eggPoints[3])
        this.lineA.doTips = false
        this.lineB.doTips = false
    }

    updatePointsToControl() {
        this.eggPoints[0].radians = this.points[0].radians
        this.eggPoints[2].radians = this.points[0].radians + Math.PI
        this.eggPoints[0].xy = this.eggPoints[2].xy = this.points[0].xy
        this.eggPoints[1].radians = this.points[1].radians
        this.eggPoints[3].radians = this.points[1].radians + Math.PI
        this.eggPoints[1].xy = this.eggPoints[3].xy = this.points[1].xy

        this.points[0].lookAt(this.points[1], Math.PI * .58)
        this.points[1].lookAt(this.points[0], Math.PI * -.58)
    }

    draw(ctx){
        this.clear(ctx)
        if(this.clock.tick % 5) {
            this.updatePointsToControl()
        }

        this.eggPoints.pen.indicator(ctx, {color: '#880000'})
        this.points.pen.indicator(ctx, {color: '#336600'})

        // this.points.spring.loop(100, .2, .0, new Set, .2)
        this.points[0].spring.to(this.points[1], 130, 2, .7, new Set([]), .1)
        // this.controlPoints.pen.fill(ctx, '#33DDAA')
        // this.controlPoints.pen.indicator(ctx, {color: '#33DDAA'})
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