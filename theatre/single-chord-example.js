/*
title: Circle Segment
category: chords
files:
    head
    ../point_src/math.js
    ../point_src/extras.js
    ../point_src/point-content.js
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

In this example the single point projects a chord within the area point, through
the its own direction.
*/

class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        this.areaPoint = new Point({x: 250, y: 150 , radius: 100})
        this.iPoint = new Point({x: 250, y: 150 , radius: 10, rotation: 33})

        this.dragging.add(this.areaPoint, this.iPoint)
    }

    onMousedown(ev) {
        this.iPoint.rotation = random.int(180)
    }

    draw(ctx){
        this.clear(ctx)

        let p = this.areaPoint
        let chord = this.iPoint

        chord.pen.indicator(ctx)

        let r = chordEndpoints2(p, chord)

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
