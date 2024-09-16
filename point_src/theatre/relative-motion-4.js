const KC = {
    UP: ['ArrowUp', 'KeyW']
    , LEFT: ['ArrowLeft', 'KeyA']
    , RIGHT: ['ArrowRight', 'KeyD']
    , DOWN: ['ArrowDown', 'KeyS']
}


// Function to convert angle to velocity vector
function angleToVelocity(theta, speed) {
  return {
    x: speed * Math.cos(theta),
    y: speed * Math.sin(theta)
  };
}


class MainStage extends Stage {
    canvas = 'canvas'
    mounted() {
        console.log('mounted')
        this.mouse.position.vy = this.mouse.position.vx = 0
        this.a = new Point({ x: 200, y: 200, vx: 0, vy: 0})
        this.events.click(this.mouseClick.bind(this))
        this.clickPoint = new Point(0,0)

        this.keyboard.onKeydown(KC.UP, this.onUpKeydown.bind(this))
        this.keyboard.onKeyup(KC.UP, this.onUpKeyup.bind(this))
        this.keyboard.onKeydown(KC.LEFT, this.onLeftKeydown.bind(this))
        this.keyboard.onKeydown(KC.RIGHT, this.onRightKeydown.bind(this))
        this.keyboard.onKeydown(KC.DOWN, this.onDownKeydown.bind(this))

        this.a.update({radius: 10})
        this.rotationSpeed = 0
        this.power = 0
    }

    addMotion(point, speed=1) {
        /* Because we're in a zero-gravity space, the velocity is simply _added_
        to the current XY, pushing the point in the direction of forced. */
        point.x += point.vx
        point.y += point.vy
        return
    }

    onUpKeydown(ev) {
        /* On keydown we add some to the throttle.
        As keydown first repeatedly, this will raise the power until
        keyup */
        this.power += .01

        /* Applied here, bcause a spaceship only applied force when the thottle is on.*/
        this.impart(this.power)
    }

    onUpKeyup(ev) {
        /* Reset the throttle */
        this.power = 0
    }

    impart(speed=1, direction=new Point(1,0)){
        /* Impart _speed_ for momentum relative to the direction the the point.

        For example - pointing _right_ and applying the _{1,0}_ direction (denoting forward)
        will push the point further right, applying _{0, 1}_ pushes the point _left_
        relative to its direction.

        Or to rephase, imagine a engine on the back of the point - pushing _forward_.
        */
        let a = this.a
        const r = impartOnRads(a.radians, direction)
        a.vx += r.x * speed;
        a.vy += r.y * speed;
    }

    onDownKeydown(ev) {
        // this.speed -= .1
        this.impart(-.3)
        // this.speed -= 1
        // this.a.relative.backward(20)
        // this.a.relative.forward(-20)
    }

    onLeftKeydown(ev) {
        /* Rotate the point as if spinning on the spot.
        This rotation Speed is applied constantly in `this.updateShip`
        */
        if(ev.shiftKey || ev.ctrlKey) {
            /* Perform a _crab_ left */
            this.impart(.3, new Point(0, -1))
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
            this.impart(.3, new Point(0, 1))
            return
        }

        this.rotationSpeed += 1
    }

    mouseClick(ev) {
        this.clickPoint = new Point(ev.x, ev.y)
        this.a.target = this.clickPoint
    }

    updateShip(){
        let a = this.a;
        a.rotation += this.rotationSpeed
        this.rotationSpeed *= .99
        /* We could constantly push here - however without motion dampening
        it's likely you'll always drift
        (in the direction of radians - like a leaky engine) */
        // this.impart(this.power)

        this.addMotion(a, this.speed)
    }

    draw(ctx) {
        this.clear(ctx)
        this.updateShip()

        this.a.pen.indicator(ctx)
        this.clickPoint.pen.indicator(ctx)
    }
}

const stage = MainStage.go()
