
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.rotSize = 0
        this.projectionLength = 900
        let padding = 20
        let height = 10
        let center = this.center.copy()
        const pointList = PointList.generate.grid(100, 10, padding)
        const pc = pointList.center
        pointList.each.z = (p)=> {
                let d = p.distanceTo(pc)
                return (Math.cos(d * .1) ) * 10
            }

        this.offsetPoints(pointList, padding, center)

        this.points = pointList
        this.centerPoint = new Point(center)

        this.projectionCenter = new Point(center)
        this.dragging.add(this.centerPoint, this.points, this.projectionCenter)
        this.events.wake()
    }

    offsetPoints(pointList, padding, center) {
        let size = pointList.getSize()
        let p2 = (
                    new Point({
                        x: padding+size.width
                        , y: padding+size.height
                    })
                ).multiply(.5)
        let oc = (new Point(center)).subtract(p2)
        pointList.offset(oc)
    }

    step() {
        this.rotSize += .02
        let spin = this.spin = {
                x: 130
                , y: 0
                , z: this.rotSize
            }

        // this.spunPoints = this.points.pseudo3d.orthogonal(this.spin)
        this.spunPoints = this.points.pseudo3d.perspective(this.spin
                , undefined
                , this.projectionLength
                , this.projectionCenter
                )
    }

    draw(ctx){
        this.step()
        this.clear(ctx)

        this.spunPoints.pen.indicators(ctx, { color: 'gray', width: 1})
        this.centerPoint.pen.indicator(ctx, { color: 'red', width: 1})
        this.projectionCenter.pen.indicator(ctx, { color: 'green', width: 1})
        this.fps.drawFPS(ctx);
    }
}

stage = MainStage.go()