/*
---
title: Rotate 3D
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
        let depth = this.depth = 1000
        let z = ()=> -(depth) + Math.random() * depth + (depth * .5)
        this.points = PointList.generate.random(100, 500, {x: 200, y: 200, z})
        this.projectionPoint = this.points.center.copy()
        this.projectionLength = 1000
        this.perspectiveCenter = this.projectionPoint.copy()
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
        this.spunPoints.sortByZ()
        // this.perspectiveCenter = this.spunPoints.copy().add(0, 0)

    }

    onMousedown(){
        this.performSpin = !this.performSpin
    }

    draw(ctx){
        this.clear(ctx)
        if(this.performSpin){
            this.rotSize += .2
        }
        this.step()
        // let color = '#666'
        // this.points.pen.indicators(ctx, {color})
        // this.spunPoints.pen.indicators(ctx)
        let maxDepth = this.depth
        let deepColor = 200
        this.spunPoints.forEach((p)=>{
            let z = p.z
            let red = deepColor - ((z / maxDepth) * deepColor)
            // let colorBlue = "hsl(184 50% 40%)"
            // let colorRed = "hsl(0 66% 40%)"
            let color = `hsl(${red} 66% 35%)`
            p.pen.fill(ctx, color)
        })
    }
}


;stage = MainStage.go();