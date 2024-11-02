
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.rotSize = 0

        let padding = 40
        let center = this.center.copy()
        const pointList = PointList.generate.grid(100, 10, padding)
        this.offsetPoints(pointList, padding, center)

        this.points = pointList
        this.centerPoint = new Point(center)

        this.dragging.add(this.centerPoint, this.points)
        this.events.wake()
    }

    offsetPoints(pointList, padding, center) {
        let size = pointList.getSize()
        let p2 = (new Point({x:padding+size.width, y: padding+size.height})).multiply(.5)
        let oc = (new Point(center)).subtract(p2)
        pointList.offset(oc)
    }

    step() {
        this.rotSize += .6
        let spin = this.spin = {
                x: 0
                , y:this.rotSize
                , z: 0
            }

        // this.spunPoints = this.points.pseudo3d.orthogonal(this.spin)
        this.spunPoints = this.points.pseudo3d.perspective(this.spin)
    }

    draw(ctx){
        this.step()
        this.clear(ctx)

        this.spunPoints.pen.indicators(ctx, { color: 'gray', width: 1})
        this.centerPoint.pen.indicator(ctx, { color: 'red', width: 1})
        this.fps.drawFPS(ctx);
    }
}

stage = MainStage.go()
