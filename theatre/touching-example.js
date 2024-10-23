class Reactor {

    velocityReductionFactor = .99
    constructor(points=[]){
        this.points = points
    }

    step(speed=1) {

        for(let point of this.points) {
            this.addMotion(point, speed)
        }
    }

    addMotion(point, speed=1) {
        /* Because we're in a zero-gravity space, the velocity is simply _added_
        to the current XY, pushing the point in the direction of forced. */
        point.x += point.vx *= this.velocityReductionFactor
        point.y += point.vy *= this.velocityReductionFactor
    }

}


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.center.radius = 50

        let radius = 7
        let rowCount = 5 /* How many items per row within the grid */
        let count = 50
        const pointList = PointList.generate.random(count, 500, {x: 50, y:50})

        this.point = new Point({x:200, y:200, radius: 30})

        this.dragging.add(this.point)
        pointList.forEach((p)=> p.radius = 10 + random.int(20))
        this.points = pointList

        this.dis = new Distances
        this.dis.addPoints(...pointList)

        this.reactor = new Reactor([this.point])
    }

    draw(ctx){
        this.clear(ctx)

        this.reactor.step()

        let mousePoint = Point.mouse.position
        let p = this.point
        this.points.lookAt(p)
        /* Draw each point; wrapping the _draw_ call_ with our own functionality.*/
        this.points.pen.indicators(ctx, { color: 'gray', width: 1})


        p.pen.indicator(ctx, { color: '#3399DD', width: 2})

        // let v = this.dis.closest(mousePoint)
        let v = this.dis.near(p, this.point.radius)
        for(const p of v){
            p.pen.indicator(ctx, { color: 'green', width: 3})
        }
        // console.log(v.length)
    }
}

stage = MainStage.go()
