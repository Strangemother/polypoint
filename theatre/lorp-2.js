/*
title: Bezier Curve Tube Between Points
files:
    head
    point
    pointlist
    stage
    mouse
    dragging
    ../point_src/curve-extras.js
    ../point_src/split.js
    ../point_src/functions/rel.js
---

*/


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.b = new Point({x: 250, y: 150 , radius: 20, rotation: 145})
        this.a = new Point({x: 150, y: 150 , radius: 20, rotation: 45})

        this.dragging.add(this.a, this.b)
        this.makeLines()
    }

    makeLines(){
        let pa = this.a.split(2, undefined, degToRad(90))
        pa.each.rotation = this.a.rotation// - 90
        pa.each.rotation = this.a.rotation// - 90
        // pa.each.radius = this.a.radius
        let pb = this.b.split(2, undefined, degToRad(90))
        pb.each.rotation = this.b.rotation //+ 90
        // pb.each.radius = this.b.radius
        let br2 = this.b.radius
        let ar2 = this.a.radius
        let disA = pa[0].distanceTo(pb[0])
        let disB = pa[1].distanceTo(pb[1])
        let da = Math.sqrt(disA)
        let db = Math.sqrt(disB)
        pb[0].radius = Math.max(br2 - da, 30 + da)
        pb[1].radius = Math.max(br2 - db, 30 + db)
        pa[0].radius = Math.max(ar2 - da, 30 + da)
        pa[1].radius = Math.max(ar2 - db, 30 + db)
        // this.bottomLine = new BezierCurve(this.a, this.b)
        this.topLine = new BezierCurve(pa[1], pb[0])
        this.topLine.doTips = false

        this.bottomLine = new BezierCurve(pa[0], pb[1])
        this.bottomLine.doTips = false

    }

    draw(ctx){
        this.clear(ctx)
        this.makeLines()

        this.a.pen.indicator(ctx, {color: '#333'})
        this.b.pen.indicator(ctx, {color: '#333'})
        ctx.strokeStyle = 'yellow'
        // ctx.strokeStyle = 'red'
        ctx.fillStyle = '#777'
        // this.a.pen.arc(ctx, this.bottomLine.points[0], undefined, undefined, undefined, 0)
        ctx.beginPath()


        this.a.draw.arc(ctx, this.a.radius,
            this.a.directionTo(this.bottomLine.points[0]), // bottom left.
            this.a.directionTo(this.topLine.points[0]), //top left
            // this.a.radians,
            0)

        this.topLine.perform(ctx)
        // ctx.stroke()

        // ctx.beginPath()
        // ctx.strokeStyle = 'red'

        // this.bottomLine.render(ctx)
        // ctx.stroke()
        // ctx.beginPath()
        this.b.draw.arc(ctx, this.b.radius,
            this.b.directionTo(this.topLine.points[1]),
            this.b.directionTo(this.bottomLine.points[1]),
            // this.b.radians,
            // this.b.directionTo(this.topLine.points[1]),
            0)
        // ctx.beginPath()
        ctx.stroke()
        // ctx.fill()

        /* Plop step.
        Add a Point _here_ where the pen currently sits.
        Add an index to display where it is. */

        this.bottomLine.start(ctx)
        this.bottomLine.perform(ctx)

        ctx.stroke()
        // ctx.beginPath()
        // this.bottomLine.start(ctx)

        // ctx.beginPath()
        // ctx.stroke()
        // this.bottomLine.perform(ctx)
        // ctx.fill()

        // ctx.beginPath()
        // ctx.stroke()
        // ctx.fill()


        // this.bottomLine.perform(ctx)
        // ctx.stroke()
        // ctx.beginPath()
        // this.topLine.perform(ctx)
        // ctx.stroke()
    }
}

stage = MainStage.go(/*{ loop: true }*/)
