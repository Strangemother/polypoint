/*
---
title: Directional Tangent 5
categories: tangents
    bisector
    raw
files:
    head
    stroke
    ../point_src/point-content.js
    pointlist
    point
    ../point_src/tangents.js
    ../point_src/bisector.js
    ../point_src/math.js
    ../point_src/split.js
    mouse
    dragging
    ../point_src/functions/clamp.js
    stage
    ../point_src/tangents.js
    ../point_src/text/beta.js
---

Another loopy.

*/


class MainStage extends Stage {
    canvas='playspace'

    mounted(){

        this.points = new PointList(
                {x:100, y:230, radius: 30}
                ,{x:200, y:90, radius: 20}
                // ,{x:300, y:240, radius: 20, isFlipped: true}
                // ,{x:340, y:640, radius: 30}
                ,{x:530, y:270, radius: 30}
                ,{x:440, y:440, radius: 30}
            ).cast();
        this.dragging.addPoints(...this.points)
    }

    draw(ctx){
        this.clear(ctx)
        this.points.pen.circle(ctx, {color: '#555'})
        // this.points.pen.line(ctx)
        // this.points.last().pen.line(ctx, this.points[0])
        let stips = new PointList;
        let pairs = []
        this.points.siblings(1).forEach((ps,i)=>{
            ps[1].lookAt(ps[0])
            let a = ps[1].project()

            ps[0].lookAt(ps[1])
            let b = ps[0].project()
            a.parent = ps[1]
            b.parent = ps[0]

            stips.push(b)
            stips.push(a)

        })


        stips.pen.indicators(ctx, {color: 'red'})
        stips.pen.line(ctx, {color: 'purple'})
        // stips.last().pen.line(ctx, stips[0])

        stips.unshift(stips.pop())

        stips.pairs(0).forEach((ps,i)=>{
            // ps[1].pen.line(ctx, ps[0], 'white', 1, null, 0)
            // ps[0].pen.line(ctx, ps[1], 'white', 1, null, 0)
            // ps[0].pen.arc(ctx, ps[1], 'white', 1, null, 1)
            let [a,b] = ps
            ctx.beginPath()
            // ctx.arcTo(a.x, a.y, b.x, b.y, 50)
            let ac = a.midpoint(b)
            ac.radius = a.distanceTo(b) * .5
            this.drawArc(ctx, ac, a, b)
            ctx.stroke()
        })

        // let pair = pairs[0];

        // stips.pen.quadCurve(ctx,{ loop: 1})
    }
    drawArc(ctx, a, pa, pb) {
        ctx.arc(a.x, a.y, a.radius, a.directionTo(pa), a.directionTo(pb))
    }
}


;stage = MainStage.go();