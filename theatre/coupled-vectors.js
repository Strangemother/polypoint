/*
categories: relative
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/stage.js
    point
    dragging
    stroke
    ../point_src/distances.js
    pointlist
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/relative.js
    ../point_src/keyboard.js
    ../point_src/constrain-distance.js
    ../point_src/screenwrap.js

The arrow keys pushes the ship in a frictionless 2D space.

Keydown performs an `impartOnRads` to _push_ the ship in the pointing direction
*/

// Function to convert angle to velocity vector
function angleToVelocity(theta, speed) {
  return {
    x: speed * Math.cos(theta),
    y: speed * Math.sin(theta)
  };
}


class MainStage extends Stage {
    canvas = 'playspace'

    mounted() {
        console.log('mounted')
        // this.screenwrap = new ScreenWrap
        this.mouse.position.vy = this.mouse.position.vx = 0
        this.a = new Point({ x: 200, y: 200, vx: 0, vy: 0, rotation: -90})
        this.b = new Point({ x: 200, y: 250, vx: 0, vy: 0, rotation: -90})

        this.asteroids = new PointList(
                [250, 200]
                , [200, 250]
                , [200, 350]
            ).cast()
        this.asteroids.update({vx: 0, vy: 0, mass: 1})

        this.keyboard.onKeydown(KC.UP, this.onUpKeydown.bind(this))
        this.keyboard.onKeyup(KC.UP, this.onUpKeyup.bind(this))
        this.keyboard.onKeydown(KC.LEFT, this.onLeftKeydown.bind(this))
        this.keyboard.onKeydown(KC.RIGHT, this.onRightKeydown.bind(this))
        this.keyboard.onKeydown(KC.DOWN, this.onDownKeydown.bind(this))
        this.keyboard.onKeyup(KC.DOWN, this.onDownKeyup.bind(this))

        this.a.update({radius: 10})
        this.b.update({radius: 10})

        this.rotationSpeed = 0
        this.power = 0
        this.powerDown = false

        this.dragging.add(...this.asteroids)
    }

    addMotion(point, speed=1) {
        /* Because we're in a zero-gravity space, the velocity is simply _added_
        to the current XY, pushing the point in the direction of forced. */
        point.x += point.vx
        point.y += point.vy
        return
    }

    performPower(){
        if(this.powerDown === true) {
            /* Applied here, bcause a spaceship only applied force when the thottle is on.*/
            this.impart(.06)
            return
        }

        this.power = 0

        if(this.reverseDown === true) {
            this.impart(-.01)
        }
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

    impart(speed=1, direction=new Point(1,0)){
        /* Impart _speed_ for momentum relative to the direction the the point.

        For example - pointing _right_ and applying the _{1,0}_ direction (denoting forward)
        will push the point further right, applying _{0, 1}_ pushes the point _left_
        relative to its direction.

        Or to rephase, imagine a engine on the back of the point - pushing _forward_.
        */
        let a = this.a
        const ra = impartOnRads(a.radians, direction)
        a.vx += ra.x * speed;
        a.vy += ra.y * speed;

        const rb = impartOnRads(this.b.radians, direction)
        this.b.vx += rb.x * speed;
        this.b.vy += rb.y * speed;

    }

    onDownKeydown(ev) {
        this.reverseDown = true
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

    updateShip(){
        let p1 = this.a //this.asteroids[2]
        let a = this.a;
        let b = this.b;

        // gravity.
        // p1.vx += r.x * speed;
        a.vy += .05
        b.vy += .05

        // damping
        a.rotation += this.rotationSpeed
        this.rotationSpeed *= .99

        b.rotation += this.rotationSpeed
        this.rotationSpeed *= .99

        /* We could constantly push here - however without motion dampening
        it's likely you'll always drift (in the direction of radians - like a leaky engine) */
        this.addMotion(a, this.speed)
        this.addMotion(b, this.speed)

        this.screenWrap.perform(a)
        this.screenWrap.perform(b)

        this.performPower()
    }

    draw(ctx) {
        this.clear(ctx)
        this.updateShip()

        this.asteroids.pen.indicators(ctx)

        this.a.pen.indicator(ctx)
        this.b.pen.indicator(ctx)
    }
}

stage = MainStage.go()
