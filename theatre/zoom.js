class Zoom {
    constructor(stage, points=[], factor=1, center={x:0, y:0}) {
        this.stage = stage
        this.points = points
        this.factor = factor
        this.center = center
        this._cachePoints = new PointList
    }

    add(...points) {
        this.points = this.points.concat(points)
    }

    update(center=this.center, factor=this.factor) {
        // move and scale all items relative to the factor and center.
        let zoomPoints = this.getZoomPoints()
        let originPoints = this.points
        originPoints.forEach((originPoint,i,a)=>{
            let sibling = zoomPoints[i]
            // the xy is a scale of the origin distance from the center
            let dis = originPoint.distance2D(center)

            // let offs = {x: 20, y: 20 } // originPoint.distance2D(center)

            sibling.update({
                x: center.x + (dis.x * factor)
                , y: center.y + (dis.y * factor)
                , radius: originPoint.radius * factor
                , rotation: originPoint.rotation

                // x: originPoint.x + (dis.x * factor)
                // , y: originPoint.y + (dis.y * factor)
                // , radius: originPoint.radius * (1+factor)
                // , rotation: originPoint.rotation
            })
        })
    }

    get zoomPoints() {
        if(this._zoomPoints) {
            return this._zoomPoints
        }

        return this._cachePoints;
    }

    getZoomPoints() {
        if(this._zoomPoints) {
            return this._zoomPoints
        }

        let zoomPoints = this._cachePoints
        this.points.forEach((e,i,a)=>{
            zoomPoints.push(e.copy())
        })

        this._zoomPoints = zoomPoints
        return zoomPoints
    }
}

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){

        let radius = 7
        let count = 100
        const pointList = PointList.generate.random(count, 600, {x: 300, y:100})
        this.factor = 1

        pointList.forEach(p=>p.radius = random.int(20))
        this.points = pointList
        this.dis = new Distances
        this.dis.addPoints(...pointList)

        this.zoom = new Zoom(this, pointList)
        // this.zoom.add(...pointList)

        this.dragging.add(...pointList)
        this.dragging.onEmptyDown = this.onEmptyDown.bind(this)
        this.dragging.onWheelEmpty = this.onWheelEmpty.bind(this)
        this.events.wake()

        this.innerZoom = 0
    }

    onWheelEmpty(ev) {
        this.innerZoom += ev.deltaY
        let factor = this.factor = 1 + (this.innerZoom * -.001)

        if(this.origin) {
            this.zoom.update(this.origin, factor)
        }
    }

    onEmptyDown(ev) {
        // console.log('onEmptyDown')
        this.isPanning = true
        this.origin = Point.from(ev)
        this.zoom.update(this.origin, this.factor)
    }

    onMousemove(ev) {
        if(!this.isPanning) {
            return
        }

        this.origin.copy(this.mouse.position)
        // let d = Point.from(ev).distance2D(this.origin)
        // console.log('Pan', d)
    }

    onMouseup(ev) {
        this.isPanning = false
    }

    draw(ctx){
        this.clear(ctx)
        if(this.origin){
            this.zoom.update(this.origin, this.factor)
        }

        let mousePoint = Point.mouse.position
        this.points.lookAt(mousePoint)
        /* Draw each point; wrapping the _draw_ call_ with our own functionality.*/
        this.points.pen.indicators(ctx, { color: '#444', width: 1})

        this.zoom.zoomPoints.pen.indicators(ctx, { color: 'gray', width: 1})

        this.origin?.pen.circle(ctx, 5, 'red')
        // let v = this.dis.closest(mousePoint)
        let v = this.dis.near(mousePoint, 200)

        for(const p of v){
            p.pen.indicator(ctx, { color: 'green', width: 3})
        }
        // console.log(v.length)
    }
}

stage = MainStage.go()
