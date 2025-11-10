/*
title: Multi-Layer Spring Shape
categories: springs
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
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
        let p = new Point({
             x: 280, y: 290
            , vx: 0, vy: 0
            , radius: 8
            , mass: 5
        })

        stage.points.push(p)

        // p.spring.to(ps.last(), rLen, springConstant, damping, lockedPoints, deltaTime)

    }
})

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){

        this.toEdges = true
        this.stack = [
                3, 5, 3
            ]

        this.createNet()

        // this.points = new PointList(
        //     new Point({
        //          x: 150, y: 230
        //         , radius: 10
        //         , vx: .1, vy: 0
        //         , mass: 5
        //     })
        //     , new Point({
        //          x: 350, y: 200
        //         , vx: 2, vy: 0
        //         , radius: 8
        //         , mass: 5
        //     })
        //     , new Point({
        //          x: 250, y: 270
        //         , vx: .4, vy: -1
        //         , radius: 8
        //         , mass: 5
        //     })
        // )

        // this.dragging.addPoints(...this.points)
        // this.dragging.onWheel = this.onWheel.bind(this)
        // this.dragging.onDragStart = this.onDragStart.bind(this)
        // this.dragging.onDragEnd = this.onDragEnd.bind(this)

        this.restLength = 40;
        this.springConstant = .6;
        this.dampingFactor = 0.92; // Adjust this value between 0 and 1

        // this.collisionBox = new CollisionBox(this.points)
    }

    createNet(stack=this.stack){
        let spreadY = 50
            , spreadX = 150
        let top = 100
            , left = 100

        let points = []
            , maxVal = Math.max.apply(Math, stack)
            ;

        for(let stackItem of stack) {
            let i = points.length
            let offset = ((maxVal * spreadY) - (spreadY * stackItem)) * .5

            let ps = PointList.generate.list(stackItem
                    , spreadY // distance between nodes in one column.
                    , [left + (spreadX * i), top + offset]
                );

            ps.forEach(p=>{
                p.update({
                    radius: 19
                    , vx: .4
                    , vy: -1
                    , radius: 8
                    , mass: 5
                })
            })
            // ps.each.radius = 19
            points.push(ps)
            this.dragging.add(...ps)
        }

        this.pointStack = points;
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

        // this.collisionBox.shuffle()
        let mouse = Point.mouse.position
        let sv = this.dragPoint != undefined? [this.dragPoint]: [];
        const lockedPoints = new Set(sv)//ps[0]]); // Lock pointA in place

        const rLen = this.restLength
        const springConstant = this.springConstant
        const damping = this.dampingFactor
        const deltaTime = 1

        ctx.strokeStyle = '#990000'
        this.pointStack.forEach(ps=>{
            // let ps = this.points;
            ps.spring.chain(rLen, springConstant, damping, lockedPoints, deltaTime)

            ps.pen.stroke(ctx)
        })

    }
}

stage = MainStage.go(/*{ loop: true }*/)
