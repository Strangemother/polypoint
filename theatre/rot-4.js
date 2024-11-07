/* # Pseudo 3D Cube */
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
