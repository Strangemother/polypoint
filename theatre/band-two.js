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
            this.drawSmoothArc(ctx, a, b)
            ctx.stroke()
        })

        // let pair = pairs[0];

        // stips.pen.quadCurve(ctx,{ loop: 1})
    }

    /**
     * Draw a smooth arc from point A to B, aligned with their entry/exit rotations.
     * Uses cubic Bezier curves with control points projected along each point's direction.
     */
    drawSmoothArc(ctx, pa, pb, tension = 0.5) {
        // Calculate distance for control point offset
        let dist = pa.distanceTo(pb)
        let controlDist = dist * tension

        // Get the direction each point is facing (from their parent's lookAt)
        // pa's direction points toward its parent, pb's direction points toward its parent
        let paDir = pa.parent ? pa.parent.rotation : pa.directionTo(pb)
        let pbDir = pb.parent ? pb.parent.rotation : pb.directionTo(pa)

        // Project control points along the tangent directions
        // cp1 extends from pa in the direction pa is facing
        let cp1x = pa.x + Math.cos(paDir) * controlDist
        let cp1y = pa.y + Math.sin(paDir) * controlDist

        // cp2 extends from pb in the opposite of the direction pb is facing
        // (approaching pb from the curve)
        let cp2x = pb.x + Math.cos(pbDir + Math.PI) * controlDist
        let cp2y = pb.y + Math.sin(pbDir + Math.PI) * controlDist

        ctx.moveTo(pa.x, pa.y)
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, pb.x, pb.y)
    }

    drawArc(ctx, a, pa, pb) {
        ctx.arc(a.x, a.y, a.radius, a.directionTo(pa), a.directionTo(pb))
    }
}


;stage = MainStage.go();