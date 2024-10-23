/*
A relative motion of each point witin a random pointlist
*/
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.center.radius = 50

        let radius = 7
        let rowCount = 5 /* How many items per row within the grid */
        let count = 180
        const pointList = PointList.generate.random(count, 900, {x: 50, y:50})

        pointList.forEach(p=>p.radius = 2 + random.int(15))
        this.points = pointList

        this.dragging.add(...pointList)
        this.dragging.onEmptyDown = this.onEmptyDown.bind(this)
        this.events.wake()
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

    step() {
        let tick = this.clock.tick * .01
        let offset = 40
        this.points.forEach(p=>{
            let r = p.rel
            r.x = Math.sin(p.x * .02 + tick) * offset
            r.y = Math.cos(p.y * .02 + tick) * offset
        })
    }

    draw(ctx){
        this.step()
        this.clear(ctx)
        let mousePoint = Point.mouse.position
        this.points.lookAt(mousePoint)
        /* Draw each point; wrapping the _draw_ call_ with our own functionality.*/
        this.points.pen.indicators(ctx, { color: 'gray', width: 1})

        this.origin?.pen.circle(ctx)

        this.fps.drawFPS(ctx);
    }
}

stage = MainStage.go()
