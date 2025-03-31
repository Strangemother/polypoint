/*
title: Two Point Circle Segment
category: chords
files:
    head
    ../point_src/extras.js
    pointlist
    point
    stage
    mouse
    dragging
    stroke
    ../point_src/random.js
    ../point_src/chords.js
---

A _segment_, is a non-equidistant chord. !here the points are _anywhere_ around the edge.

In this example the the two points project a chord within the area point.
*/

class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        this.areaPoint = new Point({x: 250, y: 150 , radius: 100})
        this.iPoint = new Point({x: 250, y: 150 , radius: 10, rotation: 0})
        this.iPoint2 = new Point({x: 350, y: 150 , radius: 10, rotation: 0})
        this.dragging.add(this.areaPoint, this.iPoint, this.iPoint2)
    }

    draw(ctx){
        this.clear(ctx)

        let p = this.areaPoint
        let chord = this.iPoint
        let chord2 = this.iPoint2
        chord.pen.indicator(ctx)
        chord2.pen.indicator(ctx)
        let r = chordEndpoints2(p, chord, chord2)
        p.pen.circle(ctx, undefined, 'purple')

        if(r) {
            new Point(r[0]).pen.line(ctx, r[1], 'green')

            r.forEach(d=>{
                new Point(d).pen.fill(ctx, 'purple')
            });
        }
    }
}


stage = MainStage.go(/*{ loop: true }*/)
