/*
title: Example
files:
    head.js
    point
    pointlist
    stage
    mouse
    dragging
---

*/


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.point = new Point({x: 250, y: 150 , radius: 20, rotation: 45})

        this.dragging.add(this.point)
    }

    draw(ctx){
        this.clear(ctx)
        this.point.pen.indicator(ctx)

    }
}

stage = MainStage.go(/*{ loop: true }*/)
