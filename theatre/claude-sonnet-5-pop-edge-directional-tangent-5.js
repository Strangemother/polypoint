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

This version presents a more complete version of tangent lines.

It builds a line by plotting the tangent points to the siblings through
a psuedo center (a "pin" projected out from each point along its bisector
direction). This ensures the arc is drawn _through_ the center rather than
arcing around the outside, and - importantly - keeps the belt's tangent
side selection changing continuously as a point is dragged, rather than
snapping between the two inbound tangent sides whenever a point crosses the
center-line of its neighbours.

The pin is projected a distance scaled by how sharp the local bend actually
is (`bendMagnitude`, 0 for a point sitting in a near straight line between
its neighbours, up to 2 for a sharp reversal). Projecting a full radius
regardless of bend sharpness caused the pin offset and the tangent formula's
own radius offset to compound on gentle/near-straight bends, landing the
plotted meeting tips up to a full diameter away from the real point.

The arc sweep direction (`resolveArcDirection`) still needs a guard for the
near-collinear case: when a point sits (almost) in a straight line between
its neighbours, the two touch points collapse onto nearly the same spot, so
floating point jitter alone shouldn't be allowed to pick the reflex/near-full
loop over the intended near-zero arc.

*/

const isOuterPoint = function(a,b,c) {
    return calculateAngleWithRef(a,b,c) > 180
    // return obtuseBisect(previousPoint, p, nextPoint) > -1
}

class MainStage extends Stage {
    canvas='playspace'

    mounted(){

        this.points = new PointList(
                {x:130, y:190, radius: 30}
                ,{x:270, y:360, radius: 20, isFlipped: true, name: "TARGET"}
                ,{x:390, y:580, radius: 30}
                ,{x:540, y:140, radius: 30}
                // ,{x:440, y:440, radius: 30}
                // ,{x:400, y:40, radius: 30}
                // ,{x:420, y:140, radius: 30}
            ).cast();
        this.dragging.addPoints(...this.points)
    }

    regen() {
        this.twistAll(this.points)
        this.biPoints = this.generateBiPoints(this.points)
        this.tangentPoints = this.generateTangents(this.biPoints)
        this.arcPointPairs = this.orderArcPoints(this.tangentPoints)
    }

    orderArcPoints(tangentPoints) {
        let orders = tangentPoints

        const rearranged = orders.map((_, i) => {
            const current = orders[i];
            const next = orders[(i + 1) % orders.length];
            return [current ? current[1]: next[0], next ? next[0]: current[0]];
        });

        return rearranged
    }

    generateTangents(biPoints) {
        /* Built tangent lines to later plot*/
        let res = [];

        biPoints.siblings(1).forEach((pairs, i, items)=>{
            let p = pairs[0]
            let next = pairs[1]
            let typ = (p.isOuter || p.isFlipped)
            let [da,db] = typ? ['bb', 'ab']: ['ba', 'aa']
            let fname = (next?.isOuter || next?.isFlipped)? da: db
            res.push(pairs[0].tangent[fname](pairs[1]))
        })

        return res;
    }

    generateBiPoints(points) {
        let res = new PointList;

        points.forEach(p=>{
            /* Project the pseudo-center pin only as far as the sharpness of
            the turn requires. `bendMagnitude` is 0 for a point sitting in a
            straight line between its neighbours and up to 2 for a sharp
            reversal (see twistAll). Scaling the projection distance by this
            prevents a fixed full-radius projection from compounding with
            the tangent formula's own radius offset and overshooting past
            the real point (previously up to a full diameter away) on
            gentle/near-straight bends. */
            let pinDistance = p.radius * Math.min(1, (p.bendMagnitude ?? 2) / 2)
            let pin = p.project(pinDistance)
            pin.radius = p.radius
            pin.color = p.isOuter? 'red': 'yellow'
            pin.isOuter = p.isOuter
            pin.isFlipped = p.isFlipped
            res.push(pin)
        })

        return res
    }

    twistAll(points) {
        // triples(this.points).forEach((t)=>{
        points.triples().forEach((t)=>{
            let bisector = calculateBisector(t[0], t[1], t[2])
            let outer = t[1].directionTo(t[1].add(bisector))
            let isOuter = isOuterPoint(t[0], t[1], t[2])
            t[1].radians = outer
            t[1].isOuter = isOuter
            t[1].bendMagnitude = bisector.magnitude()
            t[1].color = isOuter? 'red': 'yellow'
        });
    }

    draw(ctx){
        this.clear(ctx)
        this.regen()

        /* The indicators */
        // this.biPoints.pen.indicator(ctx, {color: "#222"})

        /* pull point for each corner */
        this.points.pen.circle(ctx, {color:'pink'})

        // this.biPoints.forEach(pair=>{
        //     pair.pen.indicator(ctx)
        // })
        // this.points.pen.line(ctx, {color:'green'})
        // this.points[0].pen.line(ctx, this.points.last())

        ctx.fillStyle = '#DDD'
        ctx.font = '400 22px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // this.points.forEach((p, i)=>{
        //     p.text.fill(ctx, i)
        // })

        this.tangentPoints.forEach((pair, i)=>{
            if(!pair) { return }
            let [a,b] = pair;

            /* The primary line*/
            new Point(a).pen.line(ctx, b, '#5544EE', 3)

            /* tiny tangent drop points.*/
            let color = i==0? 'red': '#555'
            pair.forEach(p=>{
                // new Point(p).pen.circle(ctx, {color})
            })
        })

        ctx.strokeStyle = 'white'

        this.arcPointPairs.forEach((pair, i, all)=>{
            if(!pair) { return }
            let [a,b] = pair;

            // if(i != 0) {
            //     return
            // }

            /* Draw an arc from A to B, from the pseudo-center pin.*/
            let color = i==1? 'red': '#555'
            let p = this.biPoints[i+1]//.pen.arc(ctx)

            if(p==undefined) {
                p = this.biPoints[0]//.pen.arc(ctx)
            }
            let isOuterPoint = p.isFlipped || p.isOuter

            let ang = p.radians
            // let start =(Math.PI2 + p.directionTo(new Point(a)) + ang) % Math.PI2
            // let end =(Math.PI2 +  p.directionTo(new Point(b)) + ang) % Math.PI2
            let pa = new Point(a)
            let pb = new Point(b)

            let start = p.directionTo(pa) //- ang
            let end = p.directionTo(pb) //+ ang

            // pa.pen.fill(ctx)
            // pb.pen.indicator(ctx, {color: 'red'})

            // let pp = new Point(p)
            // pp.pen.indicator(ctx, {color: p.isOuter? 'red': '#333'})

            let direction = this.resolveArcDirection(p, pa, pb, start, end, isOuterPoint)

            ctx.beginPath()
            // ctx.arcTo(a.x, a.y, b.x, b.y, p.radius)
            // this.drawArc(ctx, p, pa, pb)
            p.draw.arc(ctx, p.radius, start, end, direction)
            ctx.stroke()
            // pair.forEach(p=>{
            //     new Point(p).pen.circle(ctx, {color})
            // })
        })
    }
    drawArc(ctx, a, pa, pb) {
        ctx.arc(a.x, a.y, a.radius, a.directionTo(pa), a.directionTo(pb))
    }

    resolveArcDirection(p, pa, pb, start, end, isOuterPoint) {
        /* Fix for the "popping"/looping arc bug:

        When the two neighbour points align with `p` to form a (near)
        straight line, the two tangent touch points `pa`/`pb` collapse onto
        (almost) the same spot on the circle. At that singularity the raw
        `start`/`end` angles are nearly identical, so tiny floating point
        jitter can flip which side of the circle is "shorter". Since the
        arc direction is otherwise fixed by `isOuterPoint`, that jitter can
        suddenly make the *reflex* (near full-circle) arc get drawn instead
        of the intended near-zero arc, producing a visible pop/loop right at
        the straight-line alignment.

        When `pa`/`pb` are this close together, ignore `isOuterPoint` and
        always choose whichever direction produces the smaller sweep -
        both options are visually a no-op at that scale, so this keeps the
        transition continuous. */
        let touchDistance = pa.distanceTo(pb)
        let isNearSingularity = touchDistance < p.radius * 0.5

        if(!isNearSingularity) {
            return isOuterPoint
        }

        let clockwiseSweep = ((end - start) + Math.PI2) % Math.PI2
        return clockwiseSweep > Math.PI
    }
}


;stage = MainStage.go();