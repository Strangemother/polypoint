/*
title: Example
categories: basic
    dragging
files:
    head
    point
    pointlist
    stage
    mouse
    dragging
    stroke
    ../point_src/constrain-distance.js
    ../point_src/relative.js
    ../point_src/keyboard.js

---

*/


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.speed = .2
        this.spread = 8
        this.tick = 0
        this.size = 10
        this.points = new PointList(
                        [450 , 150, 4]
                        , [450 , 270]
                        , [450 , 190]
                        , [250 , 200]
                    ).cast()
        this.points[0].vx = 0
        this.points[0].vy = 0
        this.keyboardSetup(this)
        this.dragging.add(...this.points)
    }

    draw(ctx){
        this.clear(ctx)
        this.tick += 1
        let ps = this.points
        let size = this.size + (ps[1].radius)
        let spread = (this.powerDown? this.spread: 0) * this.speed

        ps[1].lookAt(ps[0], Math.sin(this.tick * this.speed) * spread, .1)
        ps[1].leash(ps[0], size * .8)
        ps[3].leash(ps[2], size * .6)
        let power = this.powerDown? 0.01: 0
        ps[1].rotation += clamp(this.rotationSpeed, -10, 10)
        this.rotationSpeed *= .99
        this.impart(power * this.speed * this.spread)
        this.addMotion(ps[0])
        ps[2].xy = ps[1].project((ps[0].distanceTo(ps[1]) - size) - 20)

        ps[0].rotation = ps[1].rotation
        ps[0].pen.indicator(ctx, {color:'#55ddcc'})
        // ps[1].pen.indicator(ctx, 'green')
        // ps[2].pen.fill(ctx, 'green')
        ps.pen.quadCurve(ctx, 'green', 0)
    }

    addMotion(point, speed=1) {
        /* Because we're in a zero-gravity space, the velocity is simply _added_
        to the current XY, pushing the point in the direction of forced. */
        point.x += point.vx
        point.y += point.vy
        point.vx *= .99
        point.vy *= .99
    }

    keyboardSetup(stage) {
        let kb = stage.keyboard
        kb.onKeydown(KC.UP, this.onUpKeydown.bind(this))
        kb.onKeyup(KC.UP, this.onUpKeyup.bind(this))
        kb.onKeydown(KC.LEFT, this.onLeftKeydown.bind(this))
        kb.onKeydown(KC.RIGHT, this.onRightKeydown.bind(this))
        kb.onKeydown(KC.DOWN, this.onDownKeydown.bind(this))
        kb.onKeyup(KC.DOWN, this.onDownKeyup.bind(this))

        this.rotationSpeed = 0
        this.powerDown = false
        this.reverseDown = false
    }

    onUpKeydown(ev) {
        /* On keydown we add some to the throttle.
        As keydown first repeatedly, this will raise the power until
        keyup */
        this.powerDown = true
    }

    onUpKeyup(ev) {
        /* Reset the throttle */
        this.powerDown = false
    }

    onDownKeydown(ev) {
        // this.speed -= .1
        this.reverseDown = true
        // this.speed -= 1
        // this.a.relative.backward(20)
        // this.a.relative.forward(-20)
    }

    onDownKeyup(ev) {
        this.reverseDown = false
    }


    onLeftKeydown(ev) {
        /* Rotate the point as if spinning on the spot.
        This rotation Speed is applied constantly in `this.updateShip`
        */
        if(ev.shiftKey || ev.ctrlKey) {
            /* Perform a _crab_ left */
            this.impart(.02, new Point(0, -1))
            return
        }

        this.rotationSpeed -= 1
    }

    onRightKeydown(ev) {
        /* Rotate the point as if spinning on the spot.
        This rotation Speed is applied constantly in `this.updateShip`
        */
        if(ev.shiftKey || ev.ctrlKey) {
            /* Perform a _crab_ right */
            this.impart(.02, new Point(0, 1))
            return
        }

        this.rotationSpeed += 1
    }

    impart(speed=1, direction=new Point(1,0)){
        /* Impart _speed_ for momentum relative to the direction the the point.

        For example - pointing _right_ and applying the _{1,0}_ direction (denoting forward)
        will push the point further right, applying _{0, 1}_ pushes the point _left_
        relative to its direction.

        Or to rephase, imagine a engine on the back of the point - pushing _forward_.
        */
        let head = this.points[0]
        let body = this.points[1]
        const r = impartOnRads(body.radians, direction)
        head.vx += r.x * speed;
        head.vy += r.y * speed;
    }
}

stage = MainStage.go(/*{ loop: true }*/)
