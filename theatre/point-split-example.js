/*
---
title: Zipper Split
categories: split
    curve
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    stage
    ../point_src/extras.js
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/split.js
    ../point_src/curve-extras.js
    ../point_src/functions/zip.js
*/
class MainStage extends Stage {
    canvas='playspace'
    // live=false
    live = true
    mounted(){

        this.count = 20
        this.speed = 1.3

        this.line = new Point(600, 340, 200, 0)
        this.line2 = new Point(600, 340, 100, 0)
        this.dragging.add(this.line, this.line2)
    }

    draw(ctx){
        this.clear(ctx)
        this.line.pen.indicator(ctx)
        this.line2.pen.indicator(ctx, {color: 'purple'})

        let splits1 = this.line.splitAnimated(this.count, 0, this.speed)
        let splits2 = this.line2.splitAnimated(this.count, 0, this.speed)

        // this.line[0].pen.line(ctx, this.line2[0])
        // this.line[1].pen.line(ctx, this.line2[1])

        for(let xx of zip(splits1, splits2)) {
            xx[0] && xx[0].pen.line(ctx, xx[1], 'red')
        }

    }
}


;stage = MainStage.go();