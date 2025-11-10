/*
title: Frames Per Second Counter
categories: fps
    text
files:
    head
    pointlist
    point
    stage
    mouse
    dragging
    fps
---

Render the "frames per second" as text. The FPS will match your screen refresh rate.
Commonly this is 60Hz.

Apply to the draw call.


    draw(ctx) {
        stage.fps.drawFPS(ctx)
    }

this provides a more stable method to rendering the live frames, by taking an
average over the previous few iterations.
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
