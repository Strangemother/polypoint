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
    ../theatre/objects/vectors/physics.js
    ../theatre/objects/vectors/controller.js
    ../theatre/objects/vectors/ship.js
---

Coupled Vector Engines - Rigid Body Physics Simulation
*/

class MainStage extends Stage {
    canvas = 'playspace'

    mounted() {
        console.log('mounted')
        // this.screenwrap = new ScreenWrap
        this.mouse.position.vy = this.mouse.position.vx = 0

        // Create the ship as a Ship instance
        this.ship = new Ship({
            x: 200,
            y: 225,  // midpoint between a and b
            vx: 0,
            vy: 0,
            radians: -Math.PI/2,  // -90 degrees (pointing up)
            rotationSpeed: 0,
            mass: 10,
            radius: 5
        })

        // Create engine points with RELATIVE positions (local space)
        // These will be transformed to world space by Ship.addEngine()
        this.a = new Point({ x: 50, y: 0, vx: 0, vy: 0, rotation: 0, radius: 10 })     // Top engine (25 units above ship center)
        this.b = new Point({ x: 0, y: -20, vx: 0, vy: 0, rotation: 0, radius: 10 })     // Left engine (25 units left of ship center)
        this.c = new Point({ x: 0, y: 20, vx: 0, vy: 0, rotation: 0, radius: 10 })     // Right engine (25 units right of ship center)

        // Add engines to ship - addEngine transforms from relative to world space
        this.ship
            .addEngine(this.a, 1)   // Top engine
            .addEngine(this.b, 1)   // Left engine
            .addEngine(this.c, 1)   // Right engine
            ;

        // Convenience references (for backward compatibility with existing code)
        this.engines = this.ship.engines
        this.engineOffsets = this.ship.engineOffsets

        // Add additional mass points to shift center of mass
        // These are "virtual" mass points that don't render but affect physics
        // For a top-heavy VTOL: put heavy mass at the top
        this.massPoints = [
            { x: 60, y: 0, mass: 20 },  // Heavy payload at the top (15 mass units)
            { x: 30, y: 0, mass: 8 },   // Additional mass slightly lower
            // , { x: 0, y: 40, mass: 20 }   // Light fuel tank at bottom (uncomment to test)
        ]

        this.asteroids = new PointList(
                [250, 200]
                , [200, 250]
                , [200, 350]
            ).cast()
        this.asteroids.update({vx: 0, vy: 0, mass: 1})

        this.power = 0
        this.powerDown = false
        this.triggerForce = 0.26
        this.powerSensitivity = 0.1  // Rotation sensitivity (0.0 to 1.0, lower = slower rotation)
        this.axisDeadzone = 0.01  // Controller axis deadzone (0.0 to 1.0, lower = more sensitive)
        this.engineRotationMode = 'spring-back'  // 'accumulate' or 'spring-back' - engine rotation behavior
        this.invertRotation = true  // Invert rightStickX rotation direction

        this.setupKeyboard()
        this.dragging.add(...this.asteroids)

        // Initialize gamepad controller
        // Change profile here: 'XBOX' or 'RADIOMASTER_TS16S'
        this.gamepad = new GamepadController('RADIOMASTER_TS16S')
        this.gamepad.deadzone = this.axisDeadzone  // Apply custom deadzone

    }

    setupKeyboard(){

        this.keyboard.onKeydown(KC.UP, this.onUpKeydown.bind(this))
        this.keyboard.onKeyup(KC.UP, this.onUpKeyup.bind(this))
        this.keyboard.onKeydown(KC.LEFT, this.onLeftKeydown.bind(this))
        this.keyboard.onKeydown(KC.RIGHT, this.onRightKeydown.bind(this))
        this.keyboard.onKeydown(KC.DOWN, this.onDownKeydown.bind(this))
        this.keyboard.onKeyup(KC.DOWN, this.onDownKeyup.bind(this))

        // Optional: Add keyboard shortcut to switch profiles
        this.keyboard.onKeydown(KEYS.P, () => {
            const currentProfile = this.gamepad.profile.name
            if (currentProfile.includes('Xbox')) {
                this.gamepad.setProfile('RADIOMASTER_TS16S')
            } else {
                this.gamepad.setProfile('XBOX')
            }
        })

        // Add keyboard controls for power sensitivity adjustment
        this.keyboard.onKeydown(KEYS.EQUALS, () => {  // '+' key (increase)
            this.powerSensitivity = Math.min(1.0, this.powerSensitivity + 0.05)
            console.log(`Rotation sensitivity: ${(this.powerSensitivity * 100).toFixed(0)}%`)
        })
        this.keyboard.onKeydown(KEYS.MINUS, () => {  // '-' key (decrease)
            this.powerSensitivity = Math.max(0.05, this.powerSensitivity - 0.05)
            console.log(`Rotation sensitivity: ${(this.powerSensitivity * 100).toFixed(0)}%`)
        })

        // Add keyboard controls for deadzone adjustment
        this.keyboard.onKeydown(KEYS.BRACKET_RIGHT, () => {  // ']' key (increase deadzone)
            this.axisDeadzone = Math.min(0.5, this.axisDeadzone + 0.01)
            this.gamepad.deadzone = this.axisDeadzone
            console.log(`Axis deadzone: ${(this.axisDeadzone * 100).toFixed(0)}%`)
        })
        this.keyboard.onKeydown(KC.BRACKET_LEFT, () => {  // '[' key (decrease deadzone)
            this.axisDeadzone = Math.max(0.0, this.axisDeadzone - 0.01)
            this.gamepad.deadzone = this.axisDeadzone
            console.log(`Axis deadzone: ${(this.axisDeadzone * 100).toFixed(0)}%`)
        })

        // Add keyboard control to toggle engine rotation mode
        this.keyboard.onKeydown(KC.R, () => {  // 'R' key (toggle rotation mode)
            if (this.engineRotationMode === 'accumulate') {
                this.engineRotationMode = 'spring-back'
                console.log('Engine rotation mode: SPRING-BACK (engines return to zero)')
            } else {
                this.engineRotationMode = 'accumulate'
                console.log('Engine rotation mode: ACCUMULATE (engines hold rotation)')
            }
        })

        // Add keyboard control to toggle rotation inversion
        this.keyboard.onKeydown(KC.I, () => {  // 'I' key (toggle invert rotation)
            this.invertRotation = !this.invertRotation
            console.log(`Rotation inversion: ${this.invertRotation ? 'INVERTED' : 'NORMAL'}`)
        })

    }

    applyGamepadControls() {
        /* Apply gamepad inputs to engine controls - now a thin wrapper */
        if (!this.gamepad.connected) return

        return applyGamepadControls(
            this.gamepad.state,
            this.engines,
            this.ship.engineOffsets,
            this.triggerForce,
            () => this.resetShip(),
            this.powerSensitivity,  // Pass sensitivity for rotation control
            this.engineRotationMode,  // Pass rotation mode
            this.invertRotation  // Pass rotation inversion flag
        )
    }

    resetShip() {
        /* Reset ship to center position - delegates to Ship.reset() */
        this.ship.reset(this.center.x, this.center.y, -Math.PI / 2)
        console.log('Ship reset to center')
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

        // Apply force to engine 'a' to create rotation
        // Positive force pushes in the direction the engine is pointing
        this.a.force += this.triggerForce
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

        // Apply force to engine 'b' to create rotation
        // Positive force pushes in the direction the engine is pointing
        this.b.force += this.triggerForce
    }

    updateShip(){
        // Update gamepad state and apply controls
        this.gamepad.update()
        this.applyGamepadControls()

        // Run the main physics simulation
        const result = updateRigidBodyPhysics(
              this.ship
            , this.ship.engines
            , this.massPoints
            , {
                // updateEnginePositions: () => this.ship.updateEnginePositions(),
                // addMotion: (ship, speed) => this.addMotion(ship, speed),
                gravityStrength: 0.04,
                forceDecay: 0.9,
                speed: this.speed
            }
        )

        // Screen wrap
        this.screenWrap.perform(this.ship)

        // Apply throttle/reverse
        this.performPower()

        return result
    }

    drawGamepad(ctx){

        ctx.fillStyle = '#00ff00'
        ctx.font = '14px monospace'
        ctx.fillText(`🎮 ${this.gamepad.profile.name}`, 10, 20)

        // RAW GAMEPAD DATA DEBUG - Shows actual hardware values
        ctx.fillStyle = '#ffff00'
        ctx.font = '12px monospace'
        ctx.fillText('=== RAW HARDWARE VALUES ===', 10, 50)

        // Show all axes with their raw values
        const rawGamepad = this.gamepad.gamepad
        if (rawGamepad && rawGamepad.axes) {
            ctx.fillStyle = '#ffffff'
            for (let i = 0; i < rawGamepad.axes.length; i++) {
                const value = rawGamepad.axes[i]
                const displayValue = value.toFixed(2)  // Always show raw value
                const color = Math.abs(value) > this.axisDeadzone ? '#00ff00' : '#666666'
                ctx.fillStyle = color
                ctx.fillText(`Axis ${i}: ${displayValue}`, 10, 70 + i * 18)
            }
        }

        // Show all buttons
        if (rawGamepad && rawGamepad.buttons) {
            ctx.fillStyle = '#ffff00'
            ctx.fillText('BUTTONS:', 200, 50)
            for (let i = 0; i < Math.min(rawGamepad.buttons.length, 12); i++) {
                const pressed = rawGamepad.buttons[i].pressed
                const value = rawGamepad.buttons[i].value
                ctx.fillStyle = pressed ? '#ff0000' : '#666666'
                ctx.fillText(`${i}: ${value.toFixed(2)}`, 200, 70 + i * 18)
            }
        }

        // Show current mapping (right side)
        ctx.fillStyle = '#00ffff'
        ctx.fillText('=== MAPPED STATE ===', 400, 50)
        const gp = this.gamepad.state
        ctx.fillStyle = '#ffffff'
        ctx.fillText(`leftStickX: ${gp.leftStickX.toFixed(2)}`, 400, 70)
        ctx.fillText(`leftStickY: ${gp.leftStickY.toFixed(2)}`, 400, 88)
        ctx.fillText(`rightStickX: ${gp.rightStickX.toFixed(2)}`, 400, 106)
        ctx.fillText(`rightStickY: ${gp.rightStickY.toFixed(2)}`, 400, 124)
        ctx.fillText(`leftTrigger: ${gp.leftTrigger.toFixed(2)}`, 400, 142)
        ctx.fillText(`rightTrigger: ${gp.rightTrigger.toFixed(2)}`, 400, 160)

        // Show profile switch hint
        ctx.fillStyle = '#888888'
        ctx.fillText(`Press 'P' to switch profile`, 10, 300)
        ctx.fillText(`Press '+/-' to adjust rotation sensitivity: ${(this.powerSensitivity * 100).toFixed(0)}%`, 10, 320)
        ctx.fillText(`Press '[/]' to adjust axis deadzone: ${(this.axisDeadzone * 100).toFixed(0)}%`, 10, 340)
        ctx.fillText(`Press 'R' to toggle rotation mode: ${this.engineRotationMode.toUpperCase()}`, 10, 360)
        ctx.fillText(`Press 'I' to toggle rotation inversion: ${this.invertRotation ? 'INVERTED' : 'NORMAL'}`, 10, 380)
    }

    draw(ctx) {
        this.clear(ctx)

        this.asteroids.pen.indicators(ctx)

        let shipData = this.updateShip()
        // Draw the ship with COM and mass points
        this.ship.drawShip(ctx, {
            shipColor: '#00ff00',
            lineColor: 'purple',
            drawOutline: false,  // Set to true to see rigid body outline
            com: shipData.com,   // Pass center of mass for visualization
            massPoints: this.massPoints  // Pass mass points for visualization
        })

        if (this.gamepad.connected) {
            this.drawGamepad(ctx)
        }
    }
}

stage = MainStage.go()
