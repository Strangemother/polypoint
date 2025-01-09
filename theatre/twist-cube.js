/*
---
title: Rotate 3D
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
    ../point_src/rotate.js
    stroke
    ../point_src/distances.js
    ../point_src/dragging.js

---

*/
class MainStage extends Stage {
    canvas='playspace'
    // live=false
    live = true
    mounted(){
        this.points = PointList.generate.random(100, 500, {x: 100, y: 100})
        this.points.each.z = ()=>Math.random() * 200
        this.projectionPoint = this.points.center.copy()
        this.projectionLength = 800
        this.perspectiveCenter = this.projectionPoint.copy().add(0, 0)
        this.rotSize = 0
        this.performSpin = false

    }

    step(){
        let spin = this.spin = {
                x: 0
                , y:  this.rotSize
                , z: 0
            }

        this.spunPoints = this.points.pseudo3d.perspective(
                  this.spin
                , this.projectionPoint
                , this.projectionLength
                , this.perspectiveCenter
            )

    }

    onMousedown(){
        this.performSpin = !this.performSpin
    }
    draw(ctx){
        this.clear(ctx)
        if(this.performSpin){
            this.rotSize += .16
        }
        this.step()
        let color = '#666'
        // this.points.pen.indicators(ctx, {color})
        this.spunPoints.pen.indicators(ctx)
    }
}


;stage = MainStage.go();