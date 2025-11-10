/*
---
title: Directional Tangent
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
    mouse
    dragging
    ../point_src/functions/clamp.js
    stage
---

Acute kite form, where a single item always points towards its acute angle.
*/

function triples(arr) {
    const triples = [];
    const len = arr.length;
    for (let i = 0; i < len; i++) {
        triples.push([
            arr[i % len],
            arr[(i + 1) % len],
            arr[(i + 2) % len]
        ]);
    }
    return triples;
}

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
                ,{x:540, y:140, radius: 30}
                ,{x:440, y:440, radius: 30}
                ,{x:400, y:40, radius: 30}
            ).cast()
        // stage.points.siblings(1).forEach(pair=>{})
        this.dragging.addPoints(...this.points)

    }

    draw(ctx){
        this.clear(ctx)
        triples(this.points).forEach((t)=>{
            let outer = acuteBisect(t[0], t[1], t[2])
            t[1].radians = outer
            t[1].color = isOuterPoint(t[0], t[1], t[2])? 'red': 'yellow'
        });

        this.points.pen.indicator(ctx)
        this.points.pen.line(ctx, {color:'green'})
        this.points[0].pen.line(ctx, this.points.last())
    }
}


;stage = MainStage.go();