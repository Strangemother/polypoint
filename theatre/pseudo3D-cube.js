/*
---
title: pseudo3D Cube
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
    ../point_src/rotate.js
    ../point_src/text/fps.js
    ../point_src/functions/clamp.js
    ../point_src/distances.js
    ../point_src/dragging.js

Pseudo 3D Cube

 */
class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){

        this.projectionLength = 300
        this.rotSize = 0

        this.setupCuboid()

        this.dragging.add(this.projectionPoint, this.perspectiveCenter)
        this.events.wake()
    }

    setupCuboid(padding=100, plane=9) {
        let row = Math.sqrt(plane)
        let offset = this.center.subtract(padding)

        const frontSet = PointList.generate.grid(plane, row, padding, offset)
        const backSet = PointList.generate.grid(plane, row, padding, offset)

        frontSet.each.z = padding * -.5
        backSet.each.z = padding * .5

        this.frontSet = frontSet
        this.backSet = backSet
        let cp = this.frontSet.center.copy()
        this.projectionPoint = cp
        this.perspectiveCenter = this.projectionPoint.copy().add(-200, 0)
    }

    step() {
        this.rotSize += .6
        let spin = this.spin = {
                x: -this.rotSize
                , y:  this.rotSize
                , z: 0
            }

        this.frontSpunPoints = this.frontSet.pseudo3d.perspective(
                  this.spin
                , this.projectionPoint
                , this.projectionLength
                , this.perspectiveCenter
            )

        this.backSpunPoints = this.backSet.pseudo3d.perspective(
                  this.spin
                , this.projectionPoint
                , this.projectionLength
                , this.perspectiveCenter
            )
    }

    draw(ctx){
        this.step()
        this.clear(ctx)

        this.drawCube(ctx)

        this.fps.drawFPS(ctx);
    }

    drawCube(ctx){
        this.frontSpunPoints.pen.indicators(ctx, { color: 'gray', width: 1})
        this.backSpunPoints.pen.indicators(ctx, { color: 'gray', width: 1})

        this.frontSet.center.pen.indicator(ctx)
        this.backSet.center.pen.indicator(ctx)

        this.projectionPoint.pen.indicator(ctx, {color: 'green'})

        this.perspectiveCenter.pen.indicator(ctx, {color: 'white'})
    }
}

stage = MainStage.go()
