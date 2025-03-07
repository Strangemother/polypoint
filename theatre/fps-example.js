/*
title: FPS Example
files:
    head
    pointlist
    point
    stage
    mouse
    dragging
    fps
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
        // this.point.pen.indicator(ctx)
        this.fps.drawFPS(ctx)
        // console.log('draw')

    }
}

stage = MainStage.go(/*{ loop: true }*/)
