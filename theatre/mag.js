/*
title: Point Reflection V3
categories: reflections
files:
    head
    stage
    ../point_src/point-content.js
    stroke
    point
    pointlist
    mouse
    dragging
    ../point_src/text/beta.js
    ../point_src/text/styler.js
*/


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){

        // ray beam
        this.ray = new Point(400, 320, 10)

        this.dragging.add(this.ray)
    }
    firstDraw(ctx) {
        // this.fonting.size = 20
    }
    draw(ctx){
        this.clear(ctx)

        let ray = this.ray;
        // ray.text.fill(ctx, parseInt(ray.magnitude()), {x: 10, y: 10})
        ray.text.fill(ctx, ray.normalized(), {x: 10, y: 10})
        ray.pen.fill(ctx, 'purple', 8)
    }
}


stage = MainStage.go(/*{ loop: true }*/)
