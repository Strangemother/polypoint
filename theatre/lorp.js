/*
title: Bezier Curve Between Split Points
files:
    head
    point
    pointlist
    stage
    mouse
    dragging
    ../point_src/curve-extras.js
    ../point_src/split.js
---

*/


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.b = new Point({x: 250, y: 150 , radius: 20, rotation: 45})
        this.a = new Point({x: 150, y: 150 , radius: 20, rotation: 145})

        this.dragging.add(this.a, this.b)
        this.makeLines()
    }

    makeLines(){
        let pa = this.a.split(2)
        pa.each.rotation = this.a.rotation - 90
        // pa.each.radius = this.a.radius
        let pb = this.b.split(2)
        pb.each.rotation = this.b.rotation + 90
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
        this.line = new BezierCurve(pa[0], pb[0])
        this.line.doTips = false
        this.line2 = new BezierCurve(pa[1], pb[1])
        this.line2.doTips = false
        // this.line = new BezierCurve(this.a, this.b)

    }

    draw(ctx){
        this.clear(ctx)
        this.makeLines()

        this.a.pen.indicator(ctx, {color: '#333'})
        this.b.pen.indicator(ctx, {color: '#333'})
        ctx.strokeStyle = 'red'
        ctx.fillStyle = '#777'
        // this.a.pen.arc(ctx, this.line.points[0], undefined, undefined, undefined, 0)
        ctx.beginPath()
        this.a.draw.arc(ctx, this.a.radius,
            this.a.radians,
            this.a.directionTo(this.line2.points[0]),
            0)

        ctx.stroke()
        ctx.beginPath()
        this.b.draw.arc(ctx, this.b.radius,
            this.b.directionTo(this.line2.points[1]),
            this.b.radians,
            0)
        ctx.stroke()

        // ctx.beginPath()
        // ctx.stroke()
        // ctx.fill()

        // ctx.beginPath()
        // this.line.perform(ctx)
        // ctx.stroke()
        this.line.render(ctx)
        this.line2.render(ctx)


        // this.line.perform(ctx)
        // ctx.stroke()
        // ctx.beginPath()
        // this.line2.perform(ctx)
        // ctx.stroke()
    }
}

stage = MainStage.go(/*{ loop: true }*/)
