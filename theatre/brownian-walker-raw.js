/*
title: Brownian Walker Raw Implementation
categories: brownian
    random
files:
    head
    point
    stage
    mouse
    dragging
    stroke
    ../point_src/random.js
    ../point_src/relative.js

---

A tiny walker to move towards a browian point.
*/

class MainStage extends Stage {
    canvas = 'playspace'
    updateSpeed = 50
    lookSpeedUpdateSpeed = 10
    touchSpaceUpdateSpeed = 10
    forwardSpeed = 1
    turnSpeed = .1
    maxTouchDistance = 10
    viewSpaceOffset = -20
    viewSpaceMultiplerSize = 10

    mounted(){
        this.modu = 0
        let bodySize = 5

        this.point = this.center.copy().update({radius:bodySize, rotation: random.int(360)})
        this.updateLookSpace()
        this.viewPoint = this.center.copy()
        this.updateWalker()
        this.dragging.add(this.point)
    }


    draw(ctx) {
        this.clear(ctx)
        this.updateAll()

        this.viewSpace.pen.circle(ctx, '#222255')
        this.viewPoint.pen.fill(ctx, 'red', 1)
        this.point.pen.indicator(ctx, '#ddd')
    }

    updateAll(){
        this.modu += 1
        this.modu % this.updateSpeed == 0 && this.updateWalker()
        this.modu % this.lookSpeedUpdateSpeed == 0 && this.updateLookSpace()
        this.modu % this.touchSpaceUpdateSpeed == 0 && this.updateTouchSpace()

        this.point.turnTo(this.viewPoint, this.turnSpeed)
        this.point.relative.forward(this.forwardSpeed)

        let didChange = this.screenWrap(this.point)
        if(didChange) {
            this.updateWalker(.5)
        }
    }

    screenWrap(p, topLeft=[100, 100], bottomRight=[400, 400]) {
        /* wrap */
        let didChange = false;
        let px, opx = p.x
        let py, opy = p.y


        if(opx < topLeft[0]) {
            px = bottomRight[0]
        }

        if(opy < topLeft[1]) {
            py = bottomRight[1]
        }


        if(opx > bottomRight[0]) {
            px = topLeft[0]
        }

        if(opy > bottomRight[1]) {
            py = topLeft[1]
        }

        if(px != undefined) {
            p.x = px
            didChange = true
        }

        if(py != undefined) {
            p.y = py
            didChange = true
        }

        return didChange
    }

    updateTouchSpace(){
        if(this.point.distanceTo(this.viewPoint) < this.maxTouchDistance) {
            this.updateWalker()
        }
    }

    updateLookSpace() {
        let eyeballSpace = this.viewSpaceOffset
        let viewSpaceSize = this.viewSpaceMultiplerSize
        let r = this.point.radius * viewSpaceSize
        this.viewSpace = this.point.project(
                r
                + this.point.radius
                + eyeballSpace
            ).update({radius: r})
    }

    updateWalker(max=.5) {
        this.updateLookSpace()
        this.viewPoint.xy = random.within(this.viewSpace, max)
    }

}

stage = MainStage.go(/*{ loop: true }*/)
