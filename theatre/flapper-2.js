/*
title: Swimming Tadpole
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
    ../point_src/relative.js
    ../point_src/keyboard.js
    ../point_src/rope.js

---

*/


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.tailLength = 40
        this.tailSegments = 7
        this.tailSweep = .81
        this.tailSpeed = 3
        this.tailWaveLag = 1.4
        this.tailWaves = 2.02
        this.tailRipple = .8
        this.turnLag = .12
        this.tailConstraintIterations = 12
        this.thrust = .018
        this.powerFillRate = 4
        this.powerDecayRate = 2.4
        this.idleTailWave = .04
        this.idleTailRate = .08
        this.powerTailRate = .5
        this.physicsStep = 1 / 60
        this.physicsAccumulator = 0
        this.physicsTick = 0
        this.waveModulo = 1
        this.tailResolution = Math.max(this.tailSegments, Math.ceil(this.tailWaves * 12))
        this.tailColor = '#26a889'
        this.headColor = '#ffb84d'
        this.swimPhase = 1
        this.lastFrameTime = performance.now()
        this.points = new PointList(...Array.from(
            { length: this.tailResolution + 1 },
            (_, i) => [450 - this.tailLength * i / this.tailResolution, 200, i === 0 ? 5 : 1]
        )).cast()
        this.points.forEach(point => {
            point.oldX = point.x
            point.oldY = point.y
        })
        this.head = this.points[0]
        this.head.vx = 0
        this.head.vy = 0
        this.powerLevel = 0
        this.waveOffsets = this.points.map(() => ({ x: 0, y: 0 }))
        this.tailRope = new RopeReactor()
        this.tailRope.pin(0)
        this.keyboardSetup(this)
        this.dragging.add(this.head)
    }

    draw(ctx){
        this.clear(ctx)
        const now = performance.now()
        const deltaTime = Math.min(Math.max((now - this.lastFrameTime) / 1000, 0), .05)
        this.lastFrameTime = now
        this.physicsAccumulator += deltaTime
        while (this.physicsAccumulator >= this.physicsStep) {
            this.stepPhysics(this.physicsStep)
            this.physicsAccumulator -= this.physicsStep
        }

        ctx.strokeStyle = this.tailColor
        this.points.pen.quadCurve(ctx, { color: this.tailColor, lineWidth: 3 }, false)
        this.head.pen.circle(ctx, undefined, this.headColor, 2)
        this.drawControls(ctx)
    }

    stepPhysics(deltaTime) {
        const frameScale = deltaTime * 60
        const turn = clamp(this.rotationSpeed, -10, 10)
        this.head.rotation += turn * frameScale
        this.rotationSpeed *= Math.pow(.99, frameScale)

        const hasInput = this.powerDown || this.reverseDown
        const powerRate = hasInput ? this.powerFillRate : -this.powerDecayRate
        this.powerLevel = clamp(this.powerLevel + powerRate * deltaTime, 0, 1)
        const drive = this.powerDown ? 1 : this.reverseDown ? -.65 : 0

        this.physicsTick++
        const applyWave = this.physicsTick % this.waveModulo === 0
        if (applyWave && drive !== 0) {
            this.impart(drive * this.thrust * this.powerLevel * frameScale * this.waveModulo)
        }
        this.addMotion(this.head, frameScale)

        const swimRate = this.tailSpeed * (this.idleTailRate + this.powerLevel * this.powerTailRate)
        this.swimPhase += deltaTime * 2 * Math.PI * swimRate

        this.tailRope.applyPhysics(this.points, 0)
        this.tailRope.solveConstraints3(
            this.points,
            this.tailLength / (this.points.length - 1),
            this.tailConstraintIterations
        )

        if (applyWave) {
            // Let the Verlet constraints settle each wave impulse before the next one.
            this.applyTailWave(turn * 60 * Math.PI / 180)
        }
    }

    applyTailWave(turnRate) {
        const segmentCount = this.points.length - 1
        const amplitude = this.idleTailWave + (1 - this.idleTailWave) * this.powerLevel
        for (let i = 1; i <= segmentCount; i++) {
            const along = i / segmentCount
            const heading = this.head.radians - turnRate * this.turnLag * along
            const wavePhase = this.swimPhase
                - (this.tailWaveLag + Math.PI * 2 * this.tailWaves) * along
            const wave = (
                Math.sin(wavePhase)
                + Math.sin(wavePhase * 2 - .6) * this.tailRipple * .25
            )
            const distance = this.tailLength * along
            const envelope = Math.sin(Math.PI * along) ** 2
            const displacement = wave * this.tailSweep * distance * envelope * amplitude
            const offsetX = -Math.sin(heading) * displacement
            const offsetY = Math.cos(heading) * displacement
            const previousOffset = this.waveOffsets[i]
            // Add the offset change so the wave layers onto the rope's existing motion.
            this.points[i].x += offsetX - previousOffset.x
            this.points[i].y += offsetY - previousOffset.y
            previousOffset.x = offsetX
            previousOffset.y = offsetY
        }
    }

    drawControls(ctx) {
        ctx.fillStyle = '#667'
        ctx.font = '12px sans-serif'
        ctx.fillText('↑ swim  ↓ reverse  ← → steer  - = tail speed', 12, 20)
    }

    addMotion(point, speed=1) {
        /* Because we're in a zero-gravity space, the velocity is simply _added_
        to the current XY, pushing the point in the direction of forced. */
        point.x += point.vx * speed
        point.y += point.vy * speed
        point.vx *= Math.pow(.99, speed)
        point.vy *= Math.pow(.99, speed)
    }

    keyboardSetup(stage) {
        let kb = stage.keyboard
        kb.onKeydown(KC.UP, this.onUpKeydown.bind(this))
        kb.onKeyup(KC.UP, this.onUpKeyup.bind(this))
        kb.onKeydown(KC.LEFT, this.onLeftKeydown.bind(this))
        kb.onKeydown(KC.RIGHT, this.onRightKeydown.bind(this))
        kb.onKeydown(KC.DOWN, this.onDownKeydown.bind(this))
        kb.onKeyup(KC.DOWN, this.onDownKeyup.bind(this))
        // kb.onKeydown(KC.BRACKET_LEFT, () => {
        //     this.tailSweep = Math.max(.15, this.tailSweep - .05)
        // })
        // kb.onKeydown(KC.BRACKET_RIGHT, () => {
        //     this.tailSweep = Math.min(1.3, this.tailSweep + .05)
        // })
        kb.onKeydown(KEYS.MINUS, () => {
            this.tailSpeed = Math.max(.3, this.tailSpeed - .2)
        })
        kb.onKeydown(KEYS.EQUALS, () => {
            this.tailSpeed = Math.min(10, this.tailSpeed + .2)
        })

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
        const r = impartOnRads(this.head.radians, direction)
        const head = this.head
        head.vx += r.x * speed;
        head.vy += r.y * speed;
    }
}

stage = MainStage.go(/*{ loop: true }*/)
