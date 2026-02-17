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

            a.rotation += 180
            b.rotation += 180

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
    drawSmoothArc(ctx, pa, pb, tension = 0.55) {
        // Calculate distance for control point offset
        let dist = pa.distanceTo(pb)
        let controlDist = dist * tension

        // Get the radial direction (toward parent center) for each point
        let paDir = pa.parent.radians
        let pbDir = pb.parent.radians

        // For tangent directions, rotate 90 degrees from the radial direction
        // The tangent is perpendicular to the radius
        // We need to pick the correct perpendicular direction based on curve flow

        // cp1: tangent at pa, should flow toward pb
        // Test which perpendicular direction points more toward pb
        let paTangent1 = paDir + Math.PI / 2
        let paTangent2 = paDir - Math.PI / 2
        let toPb = pa.directionTo(pb)
        let cp1Dir = Math.abs(angleDiff(paTangent1, toPb)) < Math.abs(angleDiff(paTangent2, toPb))
            ? paTangent1 : paTangent2

        // cp2: tangent at pb, should flow from pa
        // Test which perpendicular direction points more toward pa
        let pbTangent1 = pbDir + Math.PI / 2
        let pbTangent2 = pbDir - Math.PI / 2
        let toPa = pb.directionTo(pa)
        let cp2Dir = Math.abs(angleDiff(pbTangent1, toPa)) < Math.abs(angleDiff(pbTangent2, toPa))
            ? pbTangent1 : pbTangent2

        // Flip cp2 by 180 degrees - control point goes "behind" pb, not toward pa
        cp2Dir += Math.PI

        let cp1x = pa.x + Math.cos(cp1Dir) * controlDist
        let cp1y = pa.y + Math.sin(cp1Dir) * controlDist

        let cp2x = pb.x + Math.cos(cp2Dir) * controlDist
        let cp2y = pb.y + Math.sin(cp2Dir) * controlDist

        ctx.moveTo(pa.x, pa.y)
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, pb.x, pb.y)
    }

    drawArc(ctx, a, pa, pb) {
        ctx.arc(a.x, a.y, a.radius, a.directionTo(pa), a.directionTo(pb))
    }
}

// Helper to find shortest angular difference
function angleDiff(a, b) {
    let diff = b - a
    while (diff > Math.PI) diff -= 2 * Math.PI
    while (diff < -Math.PI) diff += 2 * Math.PI
    return diff
}

;stage = MainStage.go();