/*
---
title: pseudo3D Orthogonal vs Perspective
tags: pseudo3D
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/extras.js
    ../point_src/random.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/stage-clock.js
    ../point_src/text/alpha.js
    ../point_src/rotate.js
    ../point_src/text/fps.js
    ../point_src/functions/clamp.js
    ../point_src/distances.js
    ../point_src/dragging.js

Rotate a plane in 3D

 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.center.radius = 50

        this.rotSize = 0
        this.projection = 300
        this.perspective = true

        let radius = 7
        let rowCount = 5 /* How many items per row within the grid */
        let count = 50
        let cy = this.center.y
        let center = {x:500, y:cy}
        const pointList = PointList.generate.grid(20, 5, 30, {x:400, y:cy-200})
        const pointList2 = PointList.generate.grid(20, 5, 30, {x:400, y:cy+100})
        this.centerPoint = new Point(center)
        // pointList.forEach(p=>p.radius = 2 + random.int(15))
        this.points = pointList
        this.points2 = pointList2

        this.dragging.add(this.centerPoint)
        this.events.wake()

    }

    step() {
        this.rotSize += 1
        let spin = {x:0, y: this.rotSize, z: 0}

        // orthogonal
        let spunPoints
        let center = this.centerPoint;
        if(this.perspective) {
            spunPoints = pseudo3DRotate(this.points, spin, center, false)
            spunPoints = pseudo3DRotatePerspective(spunPoints, center, this.projection)
        }

        this.spunPointsA = spunPoints.map(p=>new Point(p))
        this.spunPointsB = pseudo3DRotate(this.points2, spin, center, true).map(p=>new Point(p))
    }

    draw(ctx){
        this.step()
        this.clear(ctx)

        this.spunPointsA.pen.indicators(ctx, { color: 'gray', width: 1})
        this.spunPointsB.pen.indicators(ctx, { color: '#aaa', width: 1})
        this.centerPoint.pen.indicator(ctx, { color: 'red', width: 1})
        // this.points.pen.indicators(ctx, { color: 'gray', width: 1})

        this.fps.drawFPS(ctx);
    }
}

stage = MainStage.go()
