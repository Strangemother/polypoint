/*
---
title: 3D Pseudo Rotation Plane
categories: pseudo3D
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
    ../point_src/text/fps.js
    ../point_src/functions/clamp.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/rotate.js

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
        const pointList = PointList.generate.random(count, [300,300], {x: 200, y:200})

        pointList.forEach(p=>p.radius = 2 + random.int(15))
        this.points = pointList

        this.dragging.add(...pointList)
        this.events.wake()

    }

    step() {
        this.rotSize += .1
        let spin = {x:this.rotSize, y: this.rotSize, z: this.rotSize}

        // orthogonal
        let center = {x:350, y:350}
        let spunPoints
        if(this.perspective) {
            spunPoints = pseudo3DRotate(this.points, spin, center, false)
            spunPoints = pseudo3DRotatePerspective(spunPoints, center, this.projection)
        } else {
            spunPoints = pseudo3DRotate(this.points, spin, center, true)
        }
        this.spunPoints = spunPoints.map(p=>new Point(p))
    }

    draw(ctx){
        this.step()
        this.clear(ctx)

        this.spunPoints.pen.indicators(ctx, { color: 'gray', width: 1})
        // this.points.pen.indicators(ctx, { color: 'gray', width: 1})

        this.fps.drawFPS(ctx);
    }
}

stage = MainStage.go()
