/*
title: Spring Pop-On Effect
categories: springs
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/random.js
    ../point_src/extras.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/events.js
    ../point_src/point.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/stage.js
    ../point_src/automouse.js
    ../point_src/functions/springs.js
    ../point_src/functions/clamp.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/collisionbox.js


moved to functions/springs */

addButton('Add', {
    onclick() {
        stage.pushPoint()
    }
})

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted() {
        this.points = new PointList(
            {
                x: 150, y: 230
                , radius: 10
                , vx: 0, vy: 0
                , mass: 5
            }, {
                x: 350, y: 200
                , vx: 0, vy: 0
                , radius: 8
                , mass: 5
            }, {
                x: 250, y: 270
                , vx: 0, vy: 0
                , radius: 8
                , mass: 5
            }
        ).cast(Point)

        this.dragging.addPoints(...this.points)
        this.restLength = 40;
        this.springConstant = .6;
        this.dampingFactor = 0.92; // Adjust this value between 0 and 1

        this.collisionBox = new CollisionBox(this.points)
    }

    pushPoint() {
        let target = random.choice(this.points) // this.points.last()
        let xy = target.add(this.restLength).xy
        let p = new Point({
             x: xy.x, y: xy.y
            , vx: 0, vy: 0
            , radius: 8
            , mass: 5
        })
        this.dragging.add(p)
        this.points.push(p)
    }

    onWheel(ev, p) {
        if (p) {
            p.mass = p.radius
        }
    }

    draw(ctx){
        this.clear(ctx)

        this.collisionBox.shuffle()
        let mouse = Point.mouse.position
        let ps = this.points;
        let near = this.dragging._near
        let sv = near != undefined? [near]: [];
        const lockedPoints = new Set(sv)//ps[0]]); // Lock pointA in place

        const rLen = this.restLength
        const springConstant = this.springConstant
        const damping = this.dampingFactor
        const deltaTime = 1

        ps.spring.chain(rLen, springConstant, damping, lockedPoints, deltaTime)

        this.points.pen.fill(ctx, 'green')
        this.points.pen.line(ctx, {color: 'pink'})

    }
}

stage = MainStage.go(/*{ loop: true }*/)
