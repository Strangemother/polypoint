/*
title: Brownian Blur
categories: brownian
    random
    blur
files:
    head
    point
    stage
    mouse
    dragging
    stroke
    ../point_src/random.js
---

In this example we simply turn off the `clear` call to allow allow a persistent
canvas. For each step (`stage.count`) performs hundreds of randomly positioned points,
using the `random.within` function.

As this function uses `Math.random` roughly 36k times per second, we gain a good insight to
_how random_ the random function is.

If this function was **truly random** the image should resolve to a pure sphere.
However you may to see a persistent pattern with micro gaps (undrawn dark spots).

The gaps show the random function doesn't generate _some_ numbers.
Given the image stabilises over time (it essentially stops changing) shows the random
repeats the same numbers after a certain period.

```
xy = random.within(point, max=.5)
```
*/

class MainStage extends Stage {
    canvas = 'playspace'
    updateSpeed = 1
    mounted(){
        this.count = 1000
        this.pixelColor = '#fff'
        this.pin = this.center.copy().update({radius: 200})
        this.point = new Point({radius: .3})
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

    firstDraw(ctx) {
        this.pin.pen.fill(ctx, '#222255')
        ctx.fillStyle = this.pixelColor
    }

    draw(ctx) {
        // this.clear(ctx)
        let count = this.count;
        let p = this.point
        for(var i = count - 1; i >= 0; i--) {
            this.updateWalker()
            ctx.beginPath()
            p.draw.arc(ctx, p.radius)
            ctx.fill()
        }

        // this.point.pen.fill(ctx, this.pixelColor)
    }

    updateWalker(max=.5) {
        this.point.xy = random.within(this.pin, max)
    }

}

stage = MainStage.go({ loop: true })
