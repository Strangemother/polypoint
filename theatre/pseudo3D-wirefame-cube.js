/*
---
title: Pseudo-3D Wireframe Cube
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
        let count = 2
        /* Generate 100 points, within a 500px box, at origin 0,0 */
        // this.points = PointList.from(generateSpherePoints(count, 300)).cast()
        this.points = PointList.from(generateCubeShellPoints(count, 200)).cast()
        this.points.each.radius = 5
        this.projectionPoint = this.points.center.copy()
        this.projectionLength = 1200
        this.perspectiveCenter = this.center.copy()

        this.rotSize = 0
        this.performSpin = true
        this.zFix = false

        this.strokes.create('a', {
            dash: [7,4]
            , march: .3
        })
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

        this.zFix && this.spunPoints.sortByZ()
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
        this.strokes.get('a').wrap(ctx, ()=>this.drawSpokes(ctx))
        this.drawShell(ctx)

        this.spunPoints.forEach((p, i)=>{
            p.pen.fill(ctx, 'purple')
            // ctx.fillStyle = 'red'
            // p.text.label(ctx, i)
        })
    }

    connect(ctx, ia, ib, color='#555', width=2) {
        return this.spunPoints[ia].pen.line(ctx, this.spunPoints[ib], color, width)
    }

    drawSpokes(ctx) {
        // inner spokes.
        let c = (a,b, c,d)=>this.connect(this.ctx, a, b, c, d)
        let color = 'purple'
        let w = 1
        c(0, 7, color, w)
        c(0, 1, color, w)
        c(1, 6, color, w)
        c(2, 5, color, w)
        c(2, 3, color, w)
        c(3, 4, color, w)
    }


    drawShell(ctx) {
        let c = (a,b, c,d)=>this.connect(this.ctx, a, b, c, d)

        // outer shell
        c(0, 1)
        c(0, 2)
        c(0, 4)

        c(1, 5)
        c(1, 3)

        c(2, 6)
        c(2, 3)

        c(3, 7)

        c(4, 5)
        c(4, 6)

        c(5, 7)

        c(6, 7)
    }

}


;stage = MainStage.go();