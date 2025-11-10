/*
---
title: Pseudo-3D Cube with Faces
categories: pseudo3D
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/shapes/cube.js
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
        this.depth = 400
        let count = 5
        /* Generate 100 points, within a 500px box, at origin 0,0 */
        // this.points = PointList.from(generateSpherePoints(count, 300)).cast()
        this.points = PointList.from(generateCubeShellPoints(count, 400)).cast()
        this.points.each.radius = 10
        this.projectionPoint = this.points.center.copy()
        this.projectionLength = 1000
        this.perspectiveCenter = this.center.copy()

        this.rotSize = 0
        this.performSpin = true
        this.zFix = true
        let stage = this;
    }

    step(){
        let spin = this.spin = {
                x: this.rotSize
                , y:  this.rotSize
                , z: -this.rotSize
            }

        this.spunPoints = this.points.pseudo3d.perspective(
                  this.spin
                , this.projectionPoint
                , this.projectionLength
                , this.perspectiveCenter
            )
        let maxDepth = this.depth
        let deepColor = 300
        this.spunPoints.forEach((p, i)=>{
            let z = p.z
            let red = deepColor - ((z / maxDepth) * deepColor)
            // let colorBlue = "hsl(184 50% 40%)"
            // let colorRed = "hsl(0 66% 40%)"
            let color = `hsl(${red} 66% 35%)`
            p.color = color
        })
        this.zFix && this.spunPoints.sortByZ()
        // this.perspectiveCenter = this.spunPoints.copy().add(0, 0)


    }

    onMousedown(){
        this.performSpin = !this.performSpin
    }

    draw(ctx){
        this.clear(ctx)
        let sv = 0.02
        if(this.performSpin){
            sv = .2
        }
        this.rotSize += sv
        this.step()
        // let color = '#666'
        // this.points.pen.indicators(ctx, {color})
        // this.spunPoints.pen.indicators(ctx)
        let maxDepth = this.depth
        let deepColor = 200

        this.spunPoints.forEach((p, i)=>{
            let z = p.z
            let red = deepColor - ((z / maxDepth) * deepColor)
            // let colorBlue = "hsl(184 50% 40%)"
            // let colorRed = "hsl(0 66% 40%)"
            // let color = `hsl(${red} 66% 35%)`
            p.pen.fill(ctx, p.color)
        })
    }
}


;stage = MainStage.go();