/*
title: Pointlist Split
files:
    head
    point
    pointlist
    stage
    mouse
    dragging
    stroke
    ../point_src/random.js
    ../point_src/relative.js

---

A Tool to split pointlists

*/

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){

        let count = 10
        let multiplier = [400, 400, 5, 270]
        this.points = PointList.generate.random(count, multiplier, [100, 100])
        this.points.each.color = ()=>random.color([290, 310], [50,100], [22,60])
        this.points.each.radius = 10

        this.dragging.add(...this.points)
    }

    draw(ctx){
        this.clear(ctx)
        this.points.pen.circle(ctx, { width: 2, color: '#444'})
        // this.points.pen.indicator(ctx, { width: 2})
        // this.points.pen.line(ctx, { width: 2, color: 'purple'})
        this.points.pen.quadCurve(ctx, { width: 2, color: 'purple'})
    }
}

stage = MainStage.go(/*{ loop: true }*/)
