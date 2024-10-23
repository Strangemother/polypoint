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

        this.points = PointList.generate.random(4, 1, {x: 200, y:200})
        this.points.each.update({vx:0, vy:0, mass:10});

        this.dragging.addPoints(...this.points)
        this.dragging.onWheel = this.onWheel.bind(this)
        this.dragging.onDragStart = this.onDragStart.bind(this)
        this.dragging.onDragEnd = this.onDragEnd.bind(this)

        this.restLength = 100;
        this.springConstant = .6;
        this.dampingFactor = 0.92; // Adjust this value between 0 and 1
        this.deltaTime = .9;
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
        const deltaTime = this.deltaTime

        // ps.spring.loop(rLen, springConstant, damping, lockedPoints, deltaTime)
        this.springsManual(this.points)

        this.points.pen.indicators(ctx)
    }

    springsManual(ps){

        let sv = this.dragPoint != undefined? [this.dragPoint]: [];
        const lockedPoints = new Set(sv)//ps[0]]); // Lock pointA in place

        const rLen = this.restLength
        const springConstant = this.springConstant
        const damping = this.dampingFactor
        const deltaTime = this.deltaTime

        let previous = ps[0]

        ps[1].spring.to(ps[3], rLen, springConstant, damping, lockedPoints, deltaTime)

        ps[2].spring.to(ps[0], rLen, springConstant, damping, lockedPoints, deltaTime)



        for (var i = 1; i < ps.length; i++) {
            let current = ps[i]
            previous.spring.to(current, rLen, springConstant, damping, lockedPoints, deltaTime)
            previous = current
        }

        ps.last().spring.to(ps[0], rLen, springConstant, damping, lockedPoints, deltaTime)

        // ps[0].spring.to(ps[1], rLen, springConstant, damping, lockedPoints, deltaTime)
        // ps[1].spring.to(ps[2], rLen, springConstant, damping, lockedPoints, deltaTime)
        // ps[2].spring.to(ps[0], rLen, springConstant, damping, lockedPoints, deltaTime)
    }
}

stage = MainStage.go(/*{ loop: true }*/)
