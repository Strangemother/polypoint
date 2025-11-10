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
a psuedo center. This ensures the arc is drawn _through_ the center rather
than arcing around the outside.

It works very well at small scales, but at larger scales the tangent lines to points
tends to overshoot the center, causing the two lines to cross before reaching the center point.

This should be fixed by limiting the length of the tangent lines to a reasonable distance, given the radius of the arc (the target point).

For example, if four points are connected, with A and C being very large radius points, when moving B, the tangent lines from A and C 
will intersect before reaching B, causing the arc to loop back on itself.

*/

const isOuterPoint = function(a,b,c) {
    return calculateAngleWithRef(a,b,c) > 180
    // return obtuseBisect(previousPoint, p, nextPoint) > -1
}

class MainStage extends Stage {
    canvas='playspace'

    mounted(){

        this.points = new PointList(
                {x:130, y:230, radius: 30}
                ,{x:300, y:240, radius: 20, isFlipped: true}
                ,{x:230, y:340, radius: 30}
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
        let getNextWrapped = function(points, i) {
            let next = points[i+1]
            if(!next) { next = points[0] /*wrap*/ }
            return next;
        }

        biPoints.siblings(1).forEach((pairs, i, items)=>{
            let next = getNextWrapped(this.points, i)
            let p = this.points[i]
            let typ = (p.isOuter || p.isFlipped)
            let [da,db] = typ? ['bb', 'ab']: ['ba', 'aa']
            let fname = (next?.isOuter || next?.isFlipped)? da: db
            res.push(pairs[0].tangent[fname](pairs[1]))
        })

        return res;
    }

    generateBiPoints(points) {
        // this.biPoints = this.generate(this.points)
        let res = new PointList;

        points.forEach(p=>{
            /* To only project the _inside_ pin for the loop.*/
            let pin = p.project()
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
            let outer = acuteBisect(t[0], t[1], t[2])
            let isOuter = isOuterPoint(t[0], t[1], t[2])
            t[1].radians = outer
            t[1].isOuter = isOuter
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

            /* Draw an arc from A to B, from the original projected point.*/
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

            ctx.beginPath()
            // ctx.arcTo(a.x, a.y, b.x, b.y, p.radius)
            // this.drawArc(ctx, p, pa, pb)
            p.draw.arc(ctx, p.radius, start, end, isOuterPoint)
            ctx.stroke()
            // pair.forEach(p=>{
            //     new Point(p).pen.circle(ctx, {color})
            // })
        })
    }
    drawArc(ctx, a, pa, pb) {
        ctx.arc(a.x, a.y, a.radius, a.directionTo(pa), a.directionTo(pb))
    }
}


;stage = MainStage.go();