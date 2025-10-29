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
        
        // Steering wheel simulation
        this.steeringAngle = 0        // Current steering wheel angle (-1 to 1)
        this.steeringRate = 0.03      // How fast steering wheel turns when holding key
        this.steeringReturn = 0.92    // How fast steering returns to center (lower = faster return)
        this.maxSteeringInput = 1.0   // Maximum steering wheel angle
        
        // Car body dimensions (visual)
        this.carLength = 40
        this.carWidth = 20
        
        // Center of mass offset (positive = toward rear, negative = toward front)
        // Rear-biased COM makes the rear swing out easier (better for drifting)
        this.comOffset = 5  // Slightly rear-biased
        
        // Wheel positions (relative to car center)
        this.frontWheelOffset = 15
        this.rearWheelOffset = -15
        
        // Drifting physics parameters (using 0-100 scale for easier tuning)
        this.frontGripLevel = .10     // Front wheel lateral grip level (0-100 scale)
        this.rearGripLevel = 0.0010     // Rear wheel lateral grip level (0-100 scale, can go very low)
        this.frontGrip = this.frontGripLevel / 10000  // Converted to physics scale
        this.rearGrip = this.rearGripLevel / 100000   // Converted to physics scale (more sensitive)
        this.grip = 0.99           // Overall forward grip factor (maintains speed)
        this.lateralGripMultiplier = 0.1  // How much extra grip at high sideways speeds (higher now, throttle modulates it)
        this.lateralGripCurve = 5       // Exponential curve for lateral grip (INCREASED: only kicks in at high speeds)
        this.braking = false
        this.driftAngle = 0        // Visual drift angle for effect
        
        // Drift enhancement
        this.driftMultiplier = 2.5  // Amplifies lateral slip when turning at speed (INCREASED: way more sideways action)
        this.driftMomentum = 0      // Tracks drift state (0 = not drifting, 1 = full drift)
        this.driftMomentumDecay = 0.985  // How slowly drift momentum fades (INCREASED: longer sustained drifts)
        this.driftMomentumGain = 0.15   // How fast drift builds up (INCREASED: easier to initiate drifts)
        
        // Weight transfer (for Scandinavian flick)
        this.weightTransfer = .8    // Current weight bias (-1 = front heavy, +1 = rear heavy)
        this.weightTransferRate = 5.0   // MASSIVELY INCREASED: Instant, violent weight shifts
        this.weightTransferDecay = 0.82  // Much faster return = more violent snap-back effect
        this.weightTransferMomentum = 0  // Tracks the momentum of weight shifts for visual feedback
        
        // Steering limits (realistic car physics)
        this.maxSteeringAngle = 5.0     // Maximum rotation speed per frame in DEGREES (tighter turning)
        this.steeringSpeed = 3.0        // How fast steering responds to input
        this.minSpeedForTurning = 0.1   // Minimum speed needed for full steering effectiveness
        
        // Speed control parameters
        this.maxSpeed = 7            // Maximum velocity magnitude
        this.acceleration = 0.07     // How fast to accelerate (INCREASED for better drifting)
        this.speedDecay = 0.5       // Natural speed decay (higher = less friction)
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
        
        // Calculate current velocity magnitude
        const currentSpeed = Math.sqrt(this.a.vx * this.a.vx + this.a.vy * this.a.vy)
        
        // Dynamic max steering based on speed (realistic physics)
        // At low speeds, wheels can't overcome ground friction for sharp turns
        // At high speeds, you can turn sharper (momentum overcomes friction)
        const speedRatio = Math.min(currentSpeed / this.maxSpeed, 1.0)
        const minSteeringAtStop = 0.15  // Can barely turn when stationary (15% of max)
        const dynamicMaxSteering = minSteeringAtStop + (1.0 - minSteeringAtStop) * speedRatio
        
        // Steering wheel input - accumulates like turning a real steering wheel
        if(this.keyLeftPressed) {
            // Turn steering wheel left (accumulate)
            this.steeringAngle -= this.steeringRate
        } else if(this.keyRightPressed) {
            // Turn steering wheel right (accumulate)
            this.steeringAngle += this.steeringRate
        } else {
            // No input: steering wheel returns to center (spring back)
            this.steeringAngle *= this.steeringReturn
        }
        
        // Clamp steering wheel angle based on current speed
        const maxSteeringNow = this.maxSteeringInput * dynamicMaxSteering
        this.steeringAngle = clamp(this.steeringAngle, -maxSteeringNow, maxSteeringNow)
        
        // Weight transfer based on steering wheel angle change (for Scandinavian flick)
        const steeringDelta = this.steeringAngle - (this.lastSteeringAngle || 0)
        
        // Apply MASSIVE weight transfer from steering changes
        const weightShift = steeringDelta * this.weightTransferRate
        this.weightTransfer += weightShift
        
        // Track weight transfer momentum for visual feedback (how violently we're flicking)
        this.weightTransferMomentum = Math.abs(weightShift)
        
        this.lastSteeringAngle = this.steeringAngle
        
        // Clamp weight transfer
        this.weightTransfer = clamp(this.weightTransfer, -1, 1)
        
        // Weight naturally returns to center
        this.weightTransfer *= this.weightTransferDecay
        
        // Apply steering with realistic limitations
        // Smooth, gradual speed-dependent steering (no hard cutoffs)
        let speedFactor
        
        if (currentSpeed < 0.5) {
            // Very slow: steering has minimal to no effect (realistic - can't turn when barely moving)
            // Linear from 0 at stopped to 20% at 0.5 speed
            speedFactor = currentSpeed * 0.4
        } else if (currentSpeed < this.minSpeedForTurning) {
            // Low speed: gradually increasing steering effectiveness
            const t = (currentSpeed - 0.5) / (this.minSpeedForTurning - 0.5)
            speedFactor = 0.2 + (t * t) * 0.3  // 20% to 50%
        } else {
            // Normal to high speed: full steering effectiveness
            const normalizedSpeed = (currentSpeed - this.minSpeedForTurning) / (this.maxSpeed - this.minSpeedForTurning)
            speedFactor = Math.min(1.2, 0.5 + normalizedSpeed * 0.7)  // 50% at minSpeed, up to 120% at speed
        }
        
        // 2. Calculate desired rotation speed based on accumulated steering wheel angle AND SPEED
        // Key change: steering wheel angle means nothing if you're not moving!
        const desiredRotationSpeed = this.steeringAngle * this.steeringSpeed * speedFactor
        
        // 3. Smoothly interpolate toward desired rotation (responsive but not instant)
        this.rotationSpeed += (desiredRotationSpeed - this.rotationSpeed) * 0.5
        
        // 4. Clamp rotation speed to maximum steering angle
        this.rotationSpeed = clamp(this.rotationSpeed, -this.maxSteeringAngle, this.maxSteeringAngle)
        
        // Update rotation directly (no artificial velocity dependency)
        this.a.rotation += this.rotationSpeed

        if(this.keyUpPressed) {
            this.speed = clamp(this.speed + this.acceleration, -this.maxSpeed, this.maxSpeed)
        }

        // Get car's forward direction (in radians) - AFTER rotation update
        const carAngle = this.a.rotation * Math.PI / 180
        const forwardX = Math.cos(carAngle)
        const forwardY = Math.sin(carAngle)
        
        // Get car's right direction (perpendicular)
        const rightX = -Math.sin(carAngle)
        const rightY = Math.cos(carAngle)
        
        // Calculate wheel positions (for front/rear grip difference)
        const frontX = this.a.x + forwardX * this.frontWheelOffset
        const frontY = this.a.y + forwardY * this.frontWheelOffset
        const rearX = this.a.x + forwardX * this.rearWheelOffset
        const rearY = this.a.y + forwardY * this.rearWheelOffset
        
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
        
        // Update drift momentum (persists drift state even after releasing steering)
        if (driftFactor > 0.3 || Math.abs(lateralVel) > 0.8) {
            // Building drift momentum
            this.driftMomentum = Math.min(1, this.driftMomentum + this.driftMomentumGain)
        } else {
            // Drift momentum decays slowly
            this.driftMomentum *= this.driftMomentumDecay
        }
        
        // Dynamic grip based on braking, speed, weight transfer, AND drift momentum
        let currentGrip = this.grip
        
        // HANDBRAKE / POWER DRIFT BRAKE (Space bar)
        // Front-wheel drive: rear locks up, front can still power and steer
        let handbrakeActive = false
        if (this.braking && currentSpeed > 0.8) {
            handbrakeActive = true
            // Front-wheel drive: front wheels can STILL ACCELERATE through the handbrake
            // This allows you to power through the drift (throttle + handbrake = wheel spin drift)
            currentGrip *= 0.98  // Almost no forward speed loss (FWD keeps pulling)
        }
        
        // Reduce grip when drift momentum is high (keeps drift going)
        currentGrip *= (1 - this.driftMomentum * 0.15)
        
        // Apply differential grip (front vs rear wheels)
        // Weight transfer affects grip: weight on rear = more rear grip, less front grip
        // MASSIVELY increased weight effect for dramatic flicking sensation
        let frontGripFactor = this.frontGrip * (1 - this.weightTransfer * 0.95)  // Can nearly eliminate front grip!
        let rearGripFactor = this.rearGrip * (1 + this.weightTransfer * 3.0)     // Triple rear grip when weight shifts back
        
        // HANDBRAKE EFFECT: Rear wheels LOCK UP (lose almost all grip), front stays active
        if (handbrakeActive) {
            // Rear wheels lose 98% of lateral grip (fully locked, pure slide)
            rearGripFactor *= 0.02
            
            // Front wheels: KEEP steering control + can apply power
            // If throttle is on: front wheels spin and pull car forward (wheel spin drift)
            // If throttle is off: front wheels just steer (traditional handbrake turn)
            if (this.keyUpPressed) {
                // Throttle + handbrake = front wheel spin (aggressive power drift)
                frontGripFactor *= 1.1  // Slight grip boost (pulling through the drift)
            } else {
                // Just handbrake = full steering control, rear slides
                frontGripFactor *= 1.4  // Strong front grip for steering
            }
            
            // Weight transfer: GRADUAL shift forward (not instant)
            // Rear gets lighter over time, not instantly
            this.weightTransfer -= 0.08  // Gentler weight shift (was 0.15)
        }
        
        // Add instant grip loss when violently flicking (momentum-based)
        const flickGripReduction = this.weightTransferMomentum * 0.8  // Lose grip during violent flicks
        const effectiveFrontGrip = Math.max(0.00001, frontGripFactor * (1 - flickGripReduction))
        const effectiveRearGrip = Math.max(0.00001, rearGripFactor * (1 - flickGripReduction * 0.5))
        
        // Drift amplification: When turning at speed, reduce rear grip even more
        const turnAmplification = Math.abs(this.steeringAngle) * currentSpeed / this.maxSpeed
        
        // Combine steering input AND drift momentum for sustained drifts
        const driftIntensity = Math.max(turnAmplification * this.driftMultiplier, this.driftMomentum * 0.8)
        const driftAmplfiedRearGrip = effectiveRearGrip * (1 - driftIntensity)
        
        // Average the grip factors (weighted by wheel positions)
        // Rear grip is weighted more heavily to emphasize the drift
        const avgGripFactor = (effectiveFrontGrip * 0.4 + Math.max(0.00001, driftAmplfiedRearGrip) * 0.6)
        
        // CRITICAL: Speed-dependent lateral grip (realistic sideways resistance)
        // The faster you slide sideways, the more tire resistance you encounter
        // This creates natural J-turn behavior and prevents infinite sliding
        const lateralSpeed = Math.abs(lateralVel)
        const lateralSpeedRatio = Math.min(lateralSpeed / this.maxSpeed, 1.0)
        
        // Throttle-dependent grip: When accelerating (wheels spinning), less lateral grip
        // When coasting (no throttle), tires bite and stop sideways motion
        const throttleInput = this.keyUpPressed ? 1.0 : 0.0  // 1 = accelerating, 0 = coasting
        const throttleGripReduction = throttleInput * 0.7  // Lose up to 70% lateral grip when on gas
        
        // Exponential increase in lateral grip as sideways speed increases
        // Low sideways speed = low grip (free to drift)
        // High sideways speed = high grip (tires fight back, causes J-turn)
        // MULTIPLIED by throttle state: less grip when accelerating, MORE grip when coasting
        const baseSpeedGrip = Math.pow(lateralSpeedRatio, this.lateralGripCurve) * this.lateralGripMultiplier
        const speedDependentLateralGrip = baseSpeedGrip * (1 - throttleGripReduction)
        
        // Apply lateral friction to reduce sideways sliding
        // Less friction = more drift, MORE friction at high lateral speeds = realistic resistance
        const baseLateralFriction = this.braking ? avgGripFactor * 0.3 : avgGripFactor
        const lateralFrictionAmount = baseLateralFriction + speedDependentLateralGrip
        const dampedLateralVel = lateralVel * (1 - lateralFrictionAmount)
        
        // Reconstruct velocity with reduced lateral component (this creates the drift effect)
        // Only apply grip to forward velocity when braking, otherwise maintain momentum
        const forwardGripFactor = this.braking ? currentGrip : 1.0
        this.a.vx = forwardX * forwardVel * forwardGripFactor + rightX * dampedLateralVel
        this.a.vy = forwardY * forwardVel * forwardGripFactor + rightY * dampedLateralVel
        
        // CRITICAL: Align car rotation toward velocity direction when not drifting
        // This makes the car "feel" connected to its motion
        // Only align when drift momentum is low (allows sustained drifts)
        if (currentSpeed > 1.5 && Math.abs(lateralVel) < 0.3 && Math.abs(this.steeringAngle) < 0.2 && this.driftMomentum < 0.3) {
            // Calculate velocity angle
            const velocityAngle = Math.atan2(this.a.vy, this.a.vx) * 180 / Math.PI
            
            // Calculate shortest angle difference (handling wrap-around correctly)
            let angleDiff = velocityAngle - this.a.rotation
            // Normalize to -180 to +180 range
            while (angleDiff > 180) angleDiff -= 360
            while (angleDiff < -180) angleDiff += 360
            
            // Only align if the difference is reasonable (prevent sudden snaps)
            if (Math.abs(angleDiff) < 45) {
                // Gently align car to velocity direction (stronger at higher speeds)
                const alignmentStrength = Math.min(currentSpeed / this.maxSpeed, 1) * 0.08
                this.a.rotation += angleDiff * alignmentStrength
            }
        }
        
        // Cap maximum speed to prevent runaway velocity
        const speed = Math.sqrt(this.a.vx * this.a.vx + this.a.vy * this.a.vy)
        if (speed > this.maxSpeed) {
            const scale = this.maxSpeed / speed
            this.a.vx *= scale
            this.a.vy *= scale
        }
        
        // Update visual drift angle for effect
        this.driftAngle = lateralVel * 2
        
        // Apply velocity friction to bring car to a halt naturally
        const velocityFriction = 0.99  // Higher = less friction, lower = stops faster
        this.a.vx *= velocityFriction
        this.a.vy *= velocityFriction
        
        // Stop completely when velocity is very low (prevents endless drifting)
        const minVelocity = 0.01
        if (Math.abs(this.a.vx) < minVelocity) this.a.vx = 0
        if (Math.abs(this.a.vy) < minVelocity) this.a.vy = 0
        
        // Apply velocity to position
        this.a.x += this.a.vx
        this.a.y += this.a.vy
        
        // Decay acceleration speed naturally
        this.speed *= this.speedDecay
        
        // ======== DRAWING ========
        
        // Draw the car body (rectangle)
        ctx.save()
        ctx.translate(this.a.x, this.a.y)
        ctx.rotate(carAngle)
        
        // Car body (rotated 90° so length is along X-axis = forward direction)
        ctx.fillStyle = '#3498db'  // Blue car
        ctx.fillRect(-this.carLength/2, -this.carWidth/2, this.carLength, this.carWidth)
        
        // Car outline
        ctx.strokeStyle = '#2c3e50'
        ctx.lineWidth = 2
        ctx.strokeRect(-this.carLength/2, -this.carWidth/2, this.carLength, this.carWidth)
        
        // Front window (to show direction) - now at the front (right side)
        ctx.fillStyle = '#34495e'
        ctx.fillRect(this.carLength/2 - 15, -this.carWidth/2 + 3, 10, this.carWidth - 6)
        
        // Center of mass indicator (red dot) - now along X-axis
        ctx.fillStyle = '#e74c3c'
        ctx.beginPath()
        ctx.arc(this.comOffset, 0, 4, 0, Math.PI * 2)
        ctx.fill()
        
        // Front wheels (show grip level with color) - now at front (right side)
        const frontWheelColor = this.keyLeftPressed || this.keyRightPressed ? '#f39c12' : '#34495e'
        ctx.fillStyle = frontWheelColor
        ctx.fillRect(this.frontWheelOffset - 3, -this.carWidth/2 - 2, 6, 3)  // Front left
        ctx.fillRect(this.frontWheelOffset - 3, this.carWidth/2 - 1, 6, 3)   // Front right
        
        // Rear wheels (show drift with color) - now at rear (left side)
        const rearWheelColor = Math.abs(driftFactor) > 0.5 ? '#e67e22' : '#34495e'
        ctx.fillStyle = rearWheelColor
        ctx.fillRect(this.rearWheelOffset - 3, -this.carWidth/2 - 2, 6, 3)   // Rear left
        ctx.fillRect(this.rearWheelOffset - 3, this.carWidth/2 - 1, 6, 3)    // Rear right
        
        ctx.restore()
        
        // Draw center point indicator (for reference)
        this.a.pen.indicator(ctx, '#00ff0044')
        
        // Draw drift trail effect when drifting (tire smoke)
        if (Math.abs(driftFactor) > 0.5) {
            // ctx.save()
            // ctx.globalAlpha = 0.4
            
            // // Draw smoke from rear wheels
            // const smokeOffsetX = rightX * (this.carWidth/2)
            // const smokeOffsetY = rightY * (this.carWidth/2)
            // const rearSmokeX = rearX - forwardX * 5
            // const rearSmokeY = rearY - forwardY * 5
            
            // ctx.strokeStyle = '#95a5a6'  // Gray smoke
            // ctx.lineWidth = 4
            // ctx.beginPath()
            // ctx.arc(rearSmokeX + smokeOffsetX, rearSmokeY + smokeOffsetY, 8, 0, Math.PI * 2)
            // ctx.stroke()
            // ctx.beginPath()
            // ctx.arc(rearSmokeX - smokeOffsetX, rearSmokeY - smokeOffsetY, 8, 0, Math.PI * 2)
            // ctx.stroke()
            // ctx.restore()
        }
        
        // Draw velocity vector for debugging
        ctx.strokeStyle = '#2ecc71'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(this.a.x, this.a.y)
        ctx.lineTo(this.a.x + this.a.vx * 5, this.a.y + this.a.vy * 5)
        ctx.stroke()
        
        // Draw ENHANCED weight transfer indicator with momentum visualization
        // Main weight transfer indicator
        ctx.fillStyle = this.weightTransfer > 0 ? '#e74c3c' : '#3498db'
        ctx.globalAlpha = Math.abs(this.weightTransfer) * 0.7  // More visible
        ctx.beginPath()
        ctx.arc(this.a.x, this.a.y - 30, 8, 0, Math.PI * 2)  // Larger circle
        ctx.fill()
        
        // Flick intensity ring (shows how violently you're flicking)
        if (this.weightTransferMomentum > 0.01) {
            ctx.strokeStyle = '#ff0000'
            ctx.lineWidth = 3
            ctx.globalAlpha = Math.min(this.weightTransferMomentum * 2, 1)  // Bright red when flicking hard
            ctx.beginPath()
            ctx.arc(this.a.x, this.a.y - 30, 12 + this.weightTransferMomentum * 20, 0, Math.PI * 2)
            ctx.stroke()
        }
        
        ctx.globalAlpha = 1
        
        this.screenWrap.perform(this.a)
        
        this.clickPoint.pen.indicator(ctx)
    }
}

const stage = MainStage.go()
