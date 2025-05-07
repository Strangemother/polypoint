/*
title: Example
categories: basic
    dragging
files:
    head
    point
    pointlist
    stage
    mouse
    dragging
    stroke
    ../point_src/constrain-distance.js
---

*/


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.speed = 1
        this.tick = 0
        this.size = 100
        this.points = new PointList(
                        [250 , 150]
                        , [250 , 170]
                        , [250 , 190]
                    ).cast()
        this.dragging.add(...this.points)
    }

    draw(ctx){
        this.clear(ctx)
        this.tick += 1
        let ps = this.points
        let size = this.size + (ps[1].radius *2)
        // ps[1].lookAt(ps[0], 2)
        ps[1].leash(ps[0], size)

        ps[2].xy = ps[1].project(ps[0].distanceTo(ps[1]) - size)
        ps[0].pen.fill(ctx, 'red')
        ps[1].pen.indicator(ctx, 'green')
        ps[2].pen.fill(ctx, 'green')
        ps.pen.quadCurve(ctx)
    }
}

stage = MainStage.go(/*{ loop: true }*/)
