/*
title: Little Measure.
categories: measurement
files:
    head
    stage
    point
    pointlist
    dragging
    stroke
    mouse
    ../point_src/text/beta.js
---

A simple example for presenting _measurements_ at scale, similar to a map scale.
The measure point represents the scale bar. The primary point presents its factored radius,
relative to the measurement.
*/

class MainStage extends Stage {
    canvas = 'playspace'

    mounted() {
        this.measure = new Point(500, 500, 20)
        this.point = new Point(150, 150, 100)
        this.dragging.add(this.measure, this.point)

        /* Base unit of 1, assuming M, or CM,
        it doesn't matter... it's 1 of the them.
        */
        this.base = 1 // m
    }

    firstDraw(ctx) {
        ctx.fillStyle = 'red'
        ctx.font = '400 16px arial'
    }

    compute() {
        /* One compute size. */
        let one = (1 / this.base) * this.measure.radius
        // console.log('one', one)

        let size = this.point.radius / one
        this.point.text.value =  `${size.toFixed(2)}x == ${(this.point.radius * size).toFixed(2)}`
    }

    draw(ctx) {
        this.clear(ctx);
        this.compute()
        this.point.pen.circle(ctx, undefined, 'red')
        this.point.text.fill(ctx)

        this.measure.pen.indicator(ctx, undefined, 'pink')
        let mr = this.measure.radius.toFixed()
        let mt = `${this.base}x (${mr}px)`
        this.measure.text.fill(ctx, mt)
        // this.measure.text.label(ctx, 'words')

    }

}

stage = MainStage.go()
