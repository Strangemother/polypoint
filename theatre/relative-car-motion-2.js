/*
categories: relative
    keyboard
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/stage.js
    ../point_src/point.js
    ../point_src/distances.js
    ../point_src/pointlist.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/keyboard.js
    ../point_src/relative.js
    ../point_src/functions/clamp.js
    ../point_src/screenwrap.js

*/

class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        console.log('mounted')
        this.mouse.position.vy = this.mouse.position.vx = 0
        this.a = new Point({ x: 200, y: 200, vx: 0, vy: 0})
        this.events.click(this.mouseClick.bind(this))
        this.clickPoint = new Point(0,0)

        this.keyboard.onKeydown(KC.UP, this.onUpKeydown.bind(this))
        this.keyboard.onKeyup(KC.UP, this.onUpKeyup.bind(this))

        this.keyboard.onKeydown(KC.DOWN, this.onDownKeydown.bind(this))        
        this.keyboard.onKeyup(KC.DOWN, this.onDownKeyup.bind(this))
        
        this.keyboard.onKeydown(KEYS.SPACE, this.onSpaceKeydown.bind(this))
        this.keyboard.onKeyup(KEYS.SPACE, this.onSpaceKeyup.bind(this))

        this.keyboard.onKeydown(KC.LEFT, this.onLeftKeydown.bind(this))
        this.keyboard.onKeydown(KC.RIGHT, this.onRightKeydown.bind(this))

        this.keyboard.onKeyup(KC.LEFT, this.onLeftKeyup.bind(this))
        this.keyboard.onKeyup(KC.RIGHT, this.onRightKeyup.bind(this))

        this.a.update({radius: 10})
        this.rotationSpeed = 0
        this.speed = 0
        
        // Drifting physics parameters
        this.lateralFriction = 0.017  // How much sideways grip (lower = more drift)
        this.grip = 0.96              // Base grip factor (lower = more sliding)
        this.braking = false
        this.driftAngle = 0          // Visual drift angle for effect
        
        // Speed control parameters
        this.maxSpeed = 20            // Maximum velocity magnitude
        this.acceleration = 0.01     // How fast to accelerate (lower = slower acceleration)
        this.speedDecay = 0.92       // Natural speed decay (higher = less friction)
        this.keyUpPressed = false
    }

    onUpKeydown(ev) {
        // Accelerate forward
        this.keyUpPressed = true 
        // this.braking = false
    }

    onDownKeydown(ev) {
        // Brake/reverse - causes more drift
        this.speed = -this.acceleration * 0.8  // Braking is slightly weaker
    }

    onUpKeyup(ev) {
        this.keyUpPressed = false
    }

    onDownKeyup(ev) {
    }


    onSpaceKeydown(ev) {
        console.log('Braking')
        this.braking = true
    }    
    onSpaceKeyup(ev) {
        console.log('Stop Braking')
        this.braking = false
    }

    onLeftKeydown(ev) {
        // console.log('Left key down')
        if(ev.shiftKey || ev.ctrlKey) {
            this.a.relative.left(10)
            return
        }

        this.keyLeftPressed = true
    }
    onLeftKeyup(ev) {
        // console.log('Left key up')
        this.keyLeftPressed = false
    }

    onRightKeydown(ev) {
        // console.log('Right key down')
        if(ev.shiftKey || ev.ctrlKey) {
            this.a.relative.right(10)
            return
        }
        // this.rotationSpeed += .2
        this.keyRightPressed = true
    }
    onRightKeyup(ev) {
        // console.log('Right key up')
        this.keyRightPressed = false
    }


    mouseClick(ev) {
        this.clickPoint = new Point(ev.x, ev.y)
        this.a.target = this.clickPoint
    }

    draw(ctx) {
        this.clear(ctx)
        
        if(this.keyLeftPressed) {
            this.rotationSpeed -= .1
        }

        if(this.keyRightPressed) {
            this.rotationSpeed += .1
        }

        if(this.keyUpPressed) {
            this.speed = clamp(this.speed + this.acceleration, -this.maxSpeed, this.maxSpeed)

        }

        // Update rotation with decay
        this.a.rotation += this.rotationSpeed
        this.rotationSpeed *= .98
        
        // Calculate current velocity magnitude
        const currentSpeed = Math.sqrt(this.a.vx * this.a.vx + this.a.vy * this.a.vy)
        
        // Get car's forward direction (in radians)
        const carAngle = this.a.rotation * Math.PI / 180
        const forwardX = Math.cos(carAngle)
        const forwardY = Math.sin(carAngle)
        
        // Get car's right direction (perpendicular)
        const rightX = -Math.sin(carAngle)
        const rightY = Math.cos(carAngle)
        
        // Apply acceleration in forward direction FIRST
        this.a.vx += forwardX * this.speed
        this.a.vy += forwardY * this.speed
        
        // NOW decompose velocity into forward and lateral components (after acceleration)
        const forwardVel = this.a.vx * forwardX + this.a.vy * forwardY
        const lateralVel = this.a.vx * rightX + this.a.vy * rightY
        
        // Calculate drift amount based on:
        // 1. Lateral velocity (sliding sideways)
        // 2. Rotation speed (turning sharp)
        // 3. Current speed (faster = more drift)
        const driftFactor = Math.abs(lateralVel) * 0.1 + Math.abs(this.rotationSpeed) * currentSpeed * 0.05
        
        // Dynamic grip based on braking and speed
        let currentGrip = this.grip
        if (this.braking && currentSpeed > 2) {
            currentGrip *= 0.7  // Less grip when braking at speed = more drift
        }
        
        // Apply lateral friction to reduce sideways sliding
        // Less friction = more drift
        const lateralFrictionAmount = this.braking ? this.lateralFriction * 0.5 : this.lateralFriction
        const dampedLateralVel = lateralVel * (1 - lateralFrictionAmount)
        
        // Reconstruct velocity with reduced lateral component (this creates the drift effect)
        this.a.vx = forwardX * forwardVel * currentGrip + rightX * dampedLateralVel
        this.a.vy = forwardY * forwardVel * currentGrip + rightY * dampedLateralVel
        
        // Cap maximum speed to prevent runaway velocity
        const speed = Math.sqrt(this.a.vx * this.a.vx + this.a.vy * this.a.vy)
        if (speed > this.maxSpeed) {
            const scale = this.maxSpeed / speed
            this.a.vx *= scale
            this.a.vy *= scale
        }
        
        // Update visual drift angle for effect
        this.driftAngle = lateralVel * 2
        
        // Apply velocity to position
        this.a.x += this.a.vx
        this.a.y += this.a.vy
        
        // Decay speed naturally
        this.speed *= this.speedDecay
        
        // Draw the car
        this.a.pen.indicator(ctx)
        
        // Draw drift trail effect when drifting
        if (Math.abs(driftFactor) > 0.5) {
            ctx.save()
            ctx.globalAlpha = 0.3
            ctx.strokeStyle = '#ff6600'
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.arc(this.a.x, this.a.y, this.a.radius + 5, 0, Math.PI * 2)
            ctx.stroke()
            ctx.restore()
        }
        
        // Draw velocity vector for debugging
        ctx.strokeStyle = '#00ff00'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(this.a.x, this.a.y)
        ctx.lineTo(this.a.x + this.a.vx * 10, this.a.y + this.a.vy * 10)
        ctx.stroke()
        this.screenWrap.perform(this.a)
        
        this.clickPoint.pen.indicator(ctx)
    }
}

const stage = MainStage.go()
