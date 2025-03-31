/*
title: Brownian Within a Point
categories:
    brownian
    random
files:
    ../point_src/core/head.js
    ../point_src/point-content.js
    pointlist
    point
    stage
    mouse
    dragging
    stroke
    ../point_src/random.js
    ../point_src/functions/clamp.js

---

Plot a random point within a circle,

*/

class MainStage extends Stage {
    canvas = 'playspace'
    updateSpeed = 10
    mounted(){
        this.modu = 0
        this.pin = this.center.copy().update({radius: 200})
        this.point = new Point()
        this.dragging.add(this.pin)

        addControl('updateSpeed', {
            field: 'range'
            , label: 'update speed'
            , step: 1
            , max: 200
            , stage: this
            , onchange(ev) {
                /*slider changed. */
                let sval = ev.currentTarget.value
                this.stage.updateSpeed = parseInt(Math.sqrt(this.max)*2 + 1) - parseInt(Math.sqrt(sval)*2)
            }
        })
    }

    draw(ctx) {
        this.clear(ctx)
        this.modu += 1
        this.modu % this.updateSpeed == 0 && this.updateWalker()

        this.pin.pen.fill(ctx, '#222255')
        this.point.pen.fill(ctx, '#ddd')
    }

    updateWalker(max=.5) {
        this.point.xy = random.within(this.pin, max)
    }

}

stage = MainStage.go(/*{ loop: true }*/)
