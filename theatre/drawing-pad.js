/*
title: Drawing Pad
category: drawing
files:
    head
    point
    stroke
    pointlist
    mouse
    dragging
    ../point_src/distances.js
    ../point_src/functions/clamp.js
    ../point_src/functions/rel.js
    ../point_src/stage.js
    ../point_src/gradient.js
---

A simple drawing pad.

*/


class MainStage extends Stage {
    canvas='playspace'

    mounted(){

        this.mp = new Point(100, 100, 3)

        this.createGradient()
        this.dragging.add(
                this.gradPointA,
                this.gradPointB,
            )
    }

    createGradient() {
        let c = this.center

        this.gradPointA = c.copy().update({
            x:rel(-250), y:rel(-200),
            radius: 20, color:"hsl(299deg 62% 44%)"})
        this.gradPointB = c.copy().update({
            x:rel(200), y:rel(250),
            radius: 20, color: "hsl(244deg 71% 56%)"})

        this.g = (new Gradient).linear(this.gradPointA, this.gradPointB)
        this.g.addStops({
            0: this.gradPointA,
            1: this.gradPointB
        })
        return this.g;
    }

    onMousedown() {
        this.penDown = true
    }
    onMouseUp() {
        this.penDown = false
    }

    onMousemove(ev) {
        this.mp.xy = Point.from(ev)
    }

    draw(ctx){
        // this.clear(ctx)
        this.g.linear() // refresh hack.
        let grad = this.g.getObject(ctx)

        if(this.penDown) {
            this.mp.pen.line(ctx, this.oldMp, grad, 4)
        }

        this.oldMp = this.mp.copy()
    }
}


;stage = MainStage.go();