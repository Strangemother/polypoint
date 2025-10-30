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

        // Create the virtual "ship" body (center of mass)
        this.ship = new Point({
            x: 200,
            y: 225,  // midpoint between a and b
            vx: 0,
            vy: 0,
            radians: -Math.PI/2,  // -90 degrees
            rotationSpeed: 0,
            mass: 10,
            radius: 5
        })

        // Create the engines with offsets from ship center
        this.a = new Point({ x: 200, y: 200, vx: 0, vy: 0, rotation: -90, radius: 10, mass: 1, force: 0})
        this.b = new Point({ x: 200, y: 250, vx: 0, vy: 0, rotation: -90, radius: 10, mass: 1, force: 0})
        this.c = new Point({ x: 225, y: 225, vx: 0, vy: 0, rotation: 0, radius: 10, mass: 1, force: 0})

        // Store initial offsets (in ship's local space)
        // radians is the LOCAL rotation offset (0 = forward, Math.PI/2 = right, etc.)
        this.engineOffsets = [
            { x: 0, y: -25, radians: .0 },           // engine 'a' - top, pointing forward
            { x: 0, y: 25, radians: 0 },            // engine 'b' - bottom, pointing forward
            { x: 25, y: 0, radians: 0 }     // engine 'c' - right side, pointing right
        ]

        this.engines = [this.a, this.b, this.c]

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

        this.rotationSpeed = 0
        this.power = 0
        this.powerDown = false

        this.dragging.add(...this.asteroids)
    }

    updateEnginePositions() {
        /* Update the visual positions of engines based on ship position and rotation */
        const ship = this.ship
        const cos = Math.cos(ship.radians)
        const sin = Math.sin(ship.radians)

        this.engines.forEach((engine, i) => {
            const offset = this.engineOffsets[i]

            // Rotate the offset by the ship's current rotation
            const rotatedX = offset.x * cos - offset.y * sin
            const rotatedY = offset.x * sin + offset.y * cos

            // Position engine relative to ship
            engine.x = ship.x + rotatedX
            engine.y = ship.y + rotatedY

            // Sync engine rotation with ship + local offset
            engine.radians = ship.radians + offset.radians
            engine.rotation = (engine.radians * 180 / Math.PI)
        })
    }

    computeCenterOfMass() {
        /* Calculate the center of mass of the ship + engines system */
        let totalMass = this.ship.mass
        let x = this.ship.x * this.ship.mass
        let y = this.ship.y * this.ship.mass

        for (let engine of this.engines) {
            totalMass += engine.mass
            x += engine.x * engine.mass
            y += engine.y * engine.mass
        }

        return {
            x: x / totalMass,
            y: y / totalMass
        }
    }

    computeMomentOfInertia(com) {
        /* Calculate rotational inertia around center of mass */
        let I = 0

        // Ship body contribution
        const dx = this.ship.x - com.x
        const dy = this.ship.y - com.y
        I += this.ship.mass * (dx * dx + dy * dy)

        // Engine contributions
        for (let engine of this.engines) {
            const dx = engine.x - com.x
            const dy = engine.y - com.y
            I += engine.mass * (dx * dx + dy * dy)
        }

        return I
    }

    applyEngineForces() {
        /* Apply forces from each engine to the ship's linear and angular velocity */
        const com = this.computeCenterOfMass()
        const I = this.computeMomentOfInertia(com)

        let fxTotal = 0
        let fyTotal = 0
        let torqueTotal = 0

        for (let engine of this.engines) {
            const force = engine.force

            // Calculate force vector in the direction the engine is pointing
            const fx = Math.cos(engine.radians) * force
            const fy = Math.sin(engine.radians) * force

            fxTotal += fx
            fyTotal += fy

            // Calculate torque (rotational force) around center of mass
            const dx = engine.x - com.x
            const dy = engine.y - com.y

            // Cross product in 2D: torque = r × F
            torqueTotal += dx * fy - dy * fx
        }

        // Apply forces to ship
        const totalMass = this.ship.mass + this.engines.reduce((sum, e) => sum + e.mass, 0)
        this.ship.vx += fxTotal / totalMass
        this.ship.vy += fyTotal / totalMass

        // Apply torque (with moment of inertia)
        if (I > 0) {
            this.ship.rotationSpeed += torqueTotal / I
        }
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

        // Apply force to each engine individually
        this.engines.forEach(engine => {
            engine.force += speed
        })
    }

    onDownKeydown(ev) {
        this.reverseDown = true
    }

    onDownKeyup(ev) {
        this.reverseDown = false
    }

    onLeftKeydown(ev) {
        /* Rotate the ship as if spinning on the spot.
        This rotation Speed is applied constantly in `this.updateShip`
        */
        if(ev.shiftKey || ev.ctrlKey) {
            /* Perform a _crab_ left - apply differential thrust */
            this.a.force += 0.02
            this.b.force -= 0.02
            return
        }

        // Don't apply rotation - that's cheating. Instead, use the side engine to rotate.
        // this.ship.rotationSpeed -= 0.01
        this.a.force -= 0.02
    }

    onRightKeydown(ev) {
        /* Rotate the ship as if spinning on the spot.
        This rotation Speed is applied constantly in `this.updateShip`
        */
        if(ev.shiftKey || ev.ctrlKey) {
            /* Perform a _crab_ right - apply differential thrust */
            this.a.force -= 0.02
            this.b.force += 0.02
            return
        }

        // this.ship.rotationSpeed += 0.01
        this.b.force -= 0.02
    }

    updateShip(){
        // Update engine positions based on ship orientation
        this.updateEnginePositions()

        // Apply forces from engines to ship
        this.applyEngineForces()

        // Apply gravity to ship
        // this.ship.vy += .001  // Simulated gravity

        // Apply rotation
        this.ship.radians += this.ship.rotationSpeed
        this.ship.rotation = this.ship.radians * 180 / Math.PI

        // Dampen rotation
        this.ship.rotationSpeed *= .99

        // Move the ship based on its velocity
        this.addMotion(this.ship, this.speed)

        // Screen wrap
        this.screenWrap.perform(this.ship)

        // Apply throttle/reverse
        this.performPower()

        // Decay engine forces
        this.engines.forEach(e => e.force *= 0.9)
    }

    draw(ctx) {
        this.clear(ctx)
        this.updateShip()

        this.asteroids.pen.indicators(ctx)

        // Draw the ship center (optional, for debugging)
        this.ship.pen.indicator(ctx, '#00ff00')

        // Draw the engines
        this.a.pen.indicator(ctx)
        this.b.pen.indicator(ctx)
        this.c.pen.indicator(ctx, '#ff00ff')  // Purple for the side engine

        this.a.pen.line(ctx, this.ship, 'purple')
        this.b.pen.line(ctx, this.ship, 'purple')
        this.c.pen.line(ctx, this.ship, 'purple')

        // Draw lines connecting engines to show rigid body
        // ctx.strokeStyle = '#ffffff44'
        // ctx.lineWidth = 2
        // ctx.beginPath()
        // ctx.moveTo(this.a.x, this.a.y)
        // ctx.lineTo(this.b.x, this.b.y)
        // ctx.lineTo(this.c.x, this.c.y)
        // ctx.lineTo(this.a.x, this.a.y)
        // ctx.stroke()
    }
}

stage = MainStage.go()
