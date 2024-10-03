class Zoom {
    constructor(stage, factor=1) {
        this.stage = stage
        this.points = []
        this.factor = factor
        this.center = {x:0, y:0}
    }

    add(...points) {
        this.points = this.points.concat(points)
    }

    update(center=this.center, factor=this.factor) {
        // move and scale all items relative to the factor and center.

    }
}

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.center.radius = 50

        let radius = 7
        let rowCount = 5 /* How many items per row within the grid */
        let count = 200
        const pointList = PointList.generate.random(count, 1000, {x: 50, y:50})

        pointList.forEach(p=>p.radius = random.int(20))
        this.points = pointList
        this.dis = new Distances
        this.dis.addPoints(...pointList)

        this.zoom = new Zoom(this)
        this.zoom.add(...pointList)
        this.dragging.add(...pointList)
        this.dragging.onEmptyDown = this.onEmptyDown.bind(this)
        this.dragging.onWheelEmpty = this.onWheelEmpty.bind(this)
        this.events.wake()

        this.innerZoom = 0
    }

    onWheelEmpty(ev) {
        this.innerZoom += ev.deltaY
        console.log('wheel', this.innerZoom)
    }

    onEmptyDown(ev) {
        console.log('onEmptyDown')
        this.isPanning = true
        this.origin = Point.from(ev)

    }

    onMousemove(ev) {
        if(!this.isPanning) {
            return
        }

        let d = Point.from(ev).distance2D(this.origin)
        console.log('Pan', d)
    }


    onMouseup(ev) {
        this.isPanning = false
    }

    draw(ctx){
        this.clear(ctx)

        let mousePoint = Point.mouse.position
        this.points.lookAt(mousePoint)
        /* Draw each point; wrapping the _draw_ call_ with our own functionality.*/
        this.points.pen.indicators(ctx, { color: 'gray', width: 1})

        this.origin?.pen.circle(ctx)
        // let v = this.dis.closest(mousePoint)
        let v = this.dis.near(mousePoint, 200)

        for(const p of v){
            p.pen.indicator(ctx, { color: 'green', width: 3})
        }
        // console.log(v.length)
    }
}

stage = MainStage.go()
