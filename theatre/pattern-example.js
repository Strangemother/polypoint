/*
title: Using createPattern()
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/extras.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/point.js
    ../point_src/stage.js
    mouse
    dragging
    stroke
---

Presenting the raw feature `ctx.createPattern()`, we can generate a "pattern"
using an `OffscreenCanvas` and apply it as a fill.

*/


class MainStage extends Stage {
    canvas = 'playspace'
    mounted(){
        this.offScreen = new OffscreenCanvas(50, 50)
        let oCtx = this.offScreen.getContext('2d')
        oCtx.fillStyle = '#010101'; //set fill color
        oCtx.fillRect(10, 10, 40, 40);
        Point.from(30,30, 10, 77).pen.indicator(oCtx, { width: 2})

        this.pattern = this.ctx.createPattern(this.offScreen, 'repeat')
        this.point = new Point(10, 10)
    }

    draw(ctx){
        this.clear(ctx)
        ctx.fillStyle = this.pattern;
        ctx.fillRect(0, 0, 300, 300);

        this.point.rotation += 1
        this.point.pen.indicator(ctx)
    }

}


stage = MainStage.go()//{ loop: false })