/*
---
title: Directional Tangent 4
categories: tangents
    bisector
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

Acute kite form, where a single item always points towards its acute angle.
*/

// function triples(arr) {
//     const triples = [];
//     const len = arr.length;
//     for (let i = 0; i < len; i++) {
//         triples.push([
//             arr[i % len],
//             arr[(i + 1) % len],
//             arr[(i + 2) % len]
//         ]);
//     }
//     return triples;
// }

const isOuterPoint = function(a,b,c) {
    return calculateAngleWithRef(a,b,c) > 180
    // return obtuseBisect(previousPoint, p, nextPoint) > -1
}

class MainStage extends Stage {
    canvas='playspace'

    mounted(){

        this.points = new PointList(
                {x:130, y:230, radius: 30}
                ,{x:300, y:240, radius: 30}
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
            let [da,db] = this.points[i].isOuter? ['bb', 'ab']: ['ba', 'aa']
            let fname = (next?.isOuter)? da: db
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
        this.biPoints.pen.indicator(ctx)
        this.points.pen.circle(ctx)

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

        this.tangentPoints.forEach(pair=>{
            if(!pair) { return }
            let [a,b] = pair;
            new Point(a).pen.line(ctx, b)

            pair.forEach(p=>{
                new Point(p).pen.circle(ctx, {color:'#555'})
            })
        })
    }
}


;stage = MainStage.go();