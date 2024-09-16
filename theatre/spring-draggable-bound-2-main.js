/* moved to functions/springs */

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.points = new PointList(
            new Point({
                 x: 150, y: 230
                , radius: 10
                , vx: .1, vy: 0
                , mass: 10
            })
            , new Point({
                 x: 350, y: 200
                , vx: 2, vy: 0
                , radius: 12
                , mass: 12
            })
            , new Point({
                 x: 250, y: 270
                , vx: .4, vy: -1
                , radius: 8
                , mass: 8
            })

        )

        this.dragging.addPoints(...this.points)
        this.dragging.onWheel = this.onWheel.bind(this)
        this.dragging.onDragStart = this.onDragStart.bind(this)
        this.dragging.onDragEnd = this.onDragEnd.bind(this)

        this.restLength = 100;
        this.springConstant = .6;
        this.dampingFactor = 0.92; // Adjust this value between 0 and 1

    }

    onDragStart(ev, p) {
        this.dragPoint = p
    }

    onDragEnd(ev, p) {
        this.dragPoint = undefined
    }

    onWheel(ev, p) {
        p.mass = p.radius
    }

    draw(ctx){
        this.clear(ctx)

        let mouse = Point.mouse.position
        let ps = this.points;
        let sv = this.dragPoint != undefined? [this.dragPoint]: [];
        const lockedPoints = new Set(sv)//ps[0]]); // Lock pointA in place

        const rLen = this.restLength
        const springConstant = this.springConstant
        const damping = this.dampingFactor
        const deltaTime = 1

        ps[0].spring.to(ps[1], rLen, springConstant, damping, lockedPoints, deltaTime)
        ps[1].spring.to(ps[2], rLen, springConstant, damping, lockedPoints, deltaTime)
        ps[2].spring.to(ps[0], rLen, springConstant, damping, lockedPoints, deltaTime)

        this.points.pen.indicators(ctx)

    }
}

stage = MainStage.go(/*{ loop: true }*/)
