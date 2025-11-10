/*
title: Iterator Range Counter
categories: iteration
    mutators
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/extras.js
    ../point_src/iter/beta.js
---

An iterator can automatically count between a range.

*/
/* iter/beta */

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        const mutators = new Mutators(this)
        let x = 200
            , y = 200
            , amplitude = this.amplitude = 90
            , c = this.c = new Point(x,y)
            , p = this.point = new Point(x, y)
            ;
        p.radius = 30
        c.radius = amplitude

        this.xIter = new Iterator(x, [
                (v)=> mutators.stageLimit(v, 'width')
                // , (v)=>mutators.sin(v, amplitude)
            ])
        this.yIter = new Iterator(y, [
                (v)=>mutators.stageLimit(v, 'height')
                // , (v)=>mutators.cos(v, amplitude)
            ])
        this.rotIter = new Iterator(0, [
                (v)=>mutators.modulus(v, 360)
            ])
    }

    draw(ctx){
        this.clear(ctx)
        let c = this.c
        let p = this.point
        let speed = .02
        let amplitude = this.amplitude

        p.x = c.x + Math.sin(this.xIter.step(speed)) * amplitude
        p.y = c.y + Math.cos(this.yIter.step(speed)) * amplitude

        p.rotation = this.rotIter.step(-2)

        c.pen.indicator(ctx, {color:'grey'})
        p.pen.indicator(ctx, {color:'green'})
    }
}

stage = MainStage.go()
