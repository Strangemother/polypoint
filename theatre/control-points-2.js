/*
title: Egg 2
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
---

 */
class MainStage extends Stage {
    canvas='playspace'
    live = true

    mounted(){
        let size = 200
        let spin = .44
        // let pj = this.projectionLength = size * ((Math.sin(spin) + Math.cos(spin) ) * .5)
        this.createPoints(size)

        this.dragging.add(...this.points, ...this.controlPoints)

        // this.lineStroke = new Stroke({
        //     color: '#fff'
        //     , width: 2
        //     , dash: [7, 4]
        // })

        // this.lineStroke2 = new Stroke({
        //     color: '#CCC'
        //     , width: 2
        //     , dash: [7, 4]
        // })

        // this.events.wake()
    }

    createPoints(width=200) {
        let x = 400
            , x2 = width + x
            , y = 300

        this.points = new PointList(
            new Point(x, y, 100)
            , new Point(x2, y, 100)
        )

        // this.eggPoints = new PointList(
        //     new Point(x, y, pj)
        //     , new Point(x2, y, pj)

        //     , new Point(x, y, pj, 90)
        //     , new Point(x2, y, pj, 90)
        // )


        this.controlPoints = new PointList(
            this.points[0].project()
            , this.points[1].project()
            // , this.eggPoints[2].project()
            // , this.eggPoints[3].project()
        )

        let stage = this;
        this.controlPoints.forEach((p,i)=>{

            p.onDragStart = function() {
                // console.log('Drag start')
                this._release = true;
            }

            p.onDragMove = function() {
                // console.log('Drag move')
                stage.controlPointsDistances[i] = stage.controlPoints[i].distance2D(
                        stage.points[i])

            }

            p.onDragEnd = function() {
                // console.log('Drag end')
                stage.controlPointsDistances[i] = stage.controlPoints[i].distance2D(
                        stage.points[i])
                this._release = false;
            }
        })

        this.controlPointsDistances = [
            this.controlPoints[0].distance2D(this.points[0])
            , this.controlPoints[1].distance2D(this.points[1])
            // , this.controlPoints[2].distance2D(this.eggPoints[2])
            // , this.controlPoints[3].distance2D(this.eggPoints[3])
        ]

        // this.lineA = new BezierCurve(this.eggPoints[0], this.eggPoints[1])
        // this.lineB = new BezierCurve(this.eggPoints[2], this.eggPoints[3])
        // this.lineA.doTips = false
        // this.lineB.doTips = false
    }

    updatePointsToControl(){

        // const cloneData = (index, pointIndex, extra=0) => {
        //     /* Copy data from the `point` units into the
        //     target eggPoint */
        //     if(pointIndex==undefined) {
        //         pointIndex=index;
        //     }
        //     this.eggPoints[index].xy = this.points[pointIndex].xy
        //     this.eggPoints[index].radius = this.points[pointIndex].radius
        //     this.eggPoints[index].rotation = this.points[pointIndex].rotation + extra
        // }

        /* The egg points should copy the primary point positions */
        // cloneData(0)
        // cloneData(1)
        // cloneData(2,0, 180)
        // cloneData(3,1, 180)

        /* Unless the user is in control,  Move any control point to the correct location,
        */
        this.controlPoints.forEach((p,i)=>{
            if(p._release == true) { return }

            let currentDistance = this.controlPointsDistances[i]
            // let currentDistance = p.distance2D(this.eggPoints[0]);
            p.xy = this.points[i].add(currentDistance).xy
        })

        // this.points[0].lookAt(this.controlPoints[0])
        // this.points[1].lookAt(this.controlPoints[1])

        // this.points[0].radius = this.controlPointsDistances[0].distance
        // this.points[1].radius = this.controlPointsDistances[1].distance

    }

    draw(ctx){
        this.clear(ctx)
        if(this.clock.tick % 2 == 0) {
            this.updatePointsToControl()
        }

        this.points.pen.indicator(ctx, {color: '#336600'})

        this.controlPoints.pen.fill(ctx, '#33DDAA')
        // // this.controlPoints.pen.indicator(ctx, {color: '#33DDAA'})
        // let lineStroke = this.lineStroke
        // let lineStroke2 = this.lineStroke2

        // lineStroke.set(ctx)
        // this.lineA.render(ctx)
        // lineStroke.unset(ctx)

        // lineStroke2.set(ctx)
        // this.lineB.render(ctx)
        // lineStroke2.unset(ctx)


    }
}

;stage = MainStage.go();