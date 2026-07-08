/*
---
title: Simple Jiggle Animation
categories: iteration
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/stage.js
    ../point_src/point.js
    ../point_src/distances.js
    ../point_src/pointlist.js
    ../point_src/events.js
    ../point_src/functions/clamp.js
    ../point_src/relative.js
    ../point_src/keyboard.js
    ../point_src/automouse.js
    ../point_src/dragging.js
    ../point_src/iter/alpha.js
    ../point_src/text/alpha.js
    ../point_src/text/label.js
    ../point_src/text/beta.js
    ../point_src/jiggle.js

---

Speedy motion at a singular position.
https://youtube.com/clip/UgkxbshWOsMf_ukuMO-Zq9Mimj1UYlFDIQ9Q?si=RgotghYr0We685BC
 */
class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.a = this.center.copy().update({radius: 20})
        this.lockPoint = this.center.copy().update({radius: 20})
        this.dragging.addPoints(this.lockPoint)
        // this.iter = new Iter(1, 4, 20)
        this.ticker = 0
        this.jiggleOptions = {
            /* defaults */
            speedReducer: .2
            , xSpeed: .7
            , ySpeed: .5
            , width: 3
            , height: 3
            , tick: 1
        }
    }

    getJiggle(lock=this.lockPoint, settings) {

        const o = Object.assign(this.jiggleOptions, settings)

        let xO = Math.cos(o.tick * (o.speedReducer * o.xSpeed))
        let yO = Math.sin(o.tick * (o.speedReducer * o.ySpeed))

        return {
            x: lock.x + (xO * o.width)
            , y: lock.y + (yO * o.height)
        }

    }

    draw(ctx){
        this.clear(ctx)
        let tick = this.ticker += 1
        const a = this.a
        let speedReducer = (20 / this.mouse.point.distanceTo(this.lockPoint))
        speedReducer = clamp(speedReducer, .1, 1)
        let width = clamp(speedReducer * 10, 1, 3)
        let height = clamp(speedReducer * 10, 1, 3)
        a.radius = this.lockPoint.radius
        a.update(this.getJiggle(this.lockPoint, { tick, width, height }))
        this.lockPoint.text.value = width.toFixed(2)
        a.pen.fill(ctx, '#22BB55')
        ctx.fillStyle = '#000'
        this.lockPoint.text.fill(ctx)
    }
}


;stage = MainStage.go();