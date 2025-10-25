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

Coupled Vector Engines - Rigid Body Physics Simulation

This demonstrates a proper 2D rigid body physics system where multiple engines
are coupled together to form a single ship. Key physics concepts:

1. CENTER OF MASS (COM): The true pivot point calculated from all masses
2. MOMENT OF INERTIA: Resistance to rotation based on mass distribution
3. TORQUE: Rotational force = distance × force (cross product)
4. GRAVITY-GRADIENT TORQUE: Instability from mass distribution in gravity field

Physics Improvements (v2):
- Fixed: Ship now rotates around actual COM, not reference point
- Fixed: Gravity strength consistent between linear and rotational
- Fixed: Multiple COM calculations optimized to single calculation per frame
- Added: getTotalMass() helper to avoid repeated calculations
- Cleaned: Removed unused helper functions and variables

Physics Improvements (v3):
- Refactored: Extracted calculateMomentOfInertia() as standalone function
- Documented: Complete API reference in docs/moment-of-inertia-api.md
- Educational: Added beginner's guide in docs/moment-of-inertia-explained.md
- Simplified: Unified body list API - all bodies treated equally, distinguished by isLocal flag
- Extracted: calculateTotalMass(), calculateCenterOfMass(), applyEngineForces(), and applyGravityGradientTorque() as reusable standalone functions
*/


// ============================================================================
// MOMENT OF INERTIA CALCULATION
// ============================================================================

/**
 * Calculate the moment of inertia for a rigid body system around its center of mass.
 * 
 * WHAT IS MOMENT OF INERTIA?
 * Think of it as "rotational mass" - it describes how hard it is to spin an object.
 * Just like mass resists being pushed (linear motion), moment of inertia resists 
 * being spun (rotational motion).
 * 
 * KEY INSIGHT:
 * - A heavy object far from the spin point is VERY hard to spin (high I)
 * - A light object close to the spin point is EASY to spin (low I)
 * 
 * FORMULA: I = Σ(mass × distance²)
 * For each piece of mass, multiply its mass by the SQUARE of its distance from 
 * the center of rotation. Then add them all up.
 * 
 * WHY DISTANCE SQUARED?
 * Moving mass twice as far away makes it FOUR times harder to spin (2² = 4).
 * This is why figure skaters spin faster when they pull their arms in!
 * 
 * PRACTICAL EXAMPLES:
 * 1. Ice skater with arms out: HIGH moment of inertia → spins SLOWLY
 *    Ice skater with arms in: LOW moment of inertia → spins FAST
 * 
 * 2. Bicycle wheel: mass at the rim → HIGH I → stable, hard to tilt
 *    Solid disc of same mass: mass at center → LOW I → easy to tilt
 * 
 * 3. A hammer: easy to spin around handle (mass is far), hard to spin around 
 *    the middle (mass evenly distributed)
 * 
 * IN THIS SIMULATION:
 * - Ship with cargo far from center → HIGH I → sluggish rotation
 * - Ship with cargo at center → LOW I → responsive rotation
 * - Engines firing off-center create torque based on this I value
 * 
 * SIMPLIFIED API:
 * All bodies (ship, engines, cargo, fuel tanks) are treated uniformly as mass points.
 * The difference between "engines" and "cargo" is only that engines apply force - 
 * both contribute equally to moment of inertia based on their mass and position.
 * 
 * @param {Object} centerOfMass - The pivot point {x, y}
 * @param {Object} mainBody - The main rigid body with {x, y, mass, radians}
 * @param {Array} bodies - Array of ALL mass-bearing objects:
 *                         - World-space bodies: {x, y, mass} (engines, asteroids, etc.)
 *                         - Local-space bodies: {x, y, mass, isLocal: true} (cargo, fuel)
 *                         Local-space bodies will be rotated by mainBody.radians
 * @returns {number} The moment of inertia (I) in mass × distance² units
 * 
 * @example
 * const com = {x: 100, y: 100}
 * const ship = {x: 100, y: 100, mass: 10, radians: 0}
 * const bodies = [
 *     {x: 90, y: 100, mass: 1},              // Engine (world space)
 *     {x: 110, y: 100, mass: 1},             // Engine (world space)
 *     {x: 50, y: 0, mass: 20, isLocal: true} // Heavy cargo (local space)
 * ]
 * 
 * const I = calculateMomentOfInertia(com, ship, bodies)
 * // Result: High I because cargo is far from center
 * // This ship will be slow to rotate
 */
function calculateMomentOfInertia(centerOfMass, mainBody, bodies = []) {
    let I = 0
    const com = centerOfMass

    // 1. Add contribution from the main body
    const dx = mainBody.x - com.x
    const dy = mainBody.y - com.y
    const distanceSquared = dx * dx + dy * dy
    I += mainBody.mass * distanceSquared

    // 2. Add contributions from all bodies (engines, cargo, fuel tanks, etc.)
    const cos = Math.cos(mainBody.radians || 0)
    const sin = Math.sin(mainBody.radians || 0)
    
    for (let body of bodies) {
        let worldX, worldY
        
        // Check if this is a local-space body (needs rotation)
        if (body.isLocal) {
            // Rotate from local to world coordinates
            const rotatedX = body.x * cos - body.y * sin
            const rotatedY = body.x * sin + body.y * cos
            worldX = mainBody.x + rotatedX
            worldY = mainBody.y + rotatedY
        } else {
            // Already in world space
            worldX = body.x
            worldY = body.y
        }
        
        // Calculate distance from center of mass
        const dx = worldX - com.x
        const dy = worldY - com.y
        const distanceSquared = dx * dx + dy * dy
        I += body.mass * distanceSquared
    }

    return I
}

/**
 * Calculate the total mass of a rigid body system.
 * 
 * This is a simple summation of all mass in the system, used for:
 * - Linear motion calculations (F = ma)
 * - Center of mass calculations
 * - Understanding the system's overall mass distribution
 * 
 * @param {Object} mainBody - The main rigid body with {mass}
 * @param {Array} bodies - Array of ALL mass-bearing objects with {mass} property
 *                         Both world-space and local-space bodies can be included
 * @returns {number} The total mass of the system
 * 
 * @example
 * const ship = {mass: 10}
 * const bodies = [
 *     {mass: 1},  // Engine
 *     {mass: 1},  // Engine
 *     {mass: 20}  // Cargo
 * ]
 * 
 * const totalMass = calculateTotalMass(ship, bodies)
 * // Result: 32 (10 + 1 + 1 + 20)
 */
function calculateTotalMass(mainBody, bodies = []) {
    let totalMass = mainBody.mass
    
    for (let body of bodies) {
        totalMass += body.mass
    }
    
    return totalMass
}

/**
 * Calculate the center of mass (COM) for a rigid body system.
 * 
 * WHAT IS CENTER OF MASS?
 * The center of mass is the "balance point" of an object - the point where all
 * the mass seems to be concentrated. It's where the object rotates around naturally.
 * 
 * REAL-WORLD EXAMPLE:
 * Hold a hammer by the handle - it wants to rotate around a point near the head,
 * not the middle of the handle. That's the center of mass!
 * 
 * PHYSICS:
 * COM = Σ(mass_i × position_i) / Σ(mass_i)
 * Each piece of mass "votes" for where the COM should be, weighted by its mass.
 * Heavy masses far away pull the COM toward them more than light masses.
 * 
 * WHY IT MATTERS:
 * - Objects rotate around their COM naturally
 * - Forces through the COM produce linear motion only (no rotation)
 * - Forces off-center from COM produce both linear motion AND rotation
 * 
 * IN THIS SIMULATION:
 * - Ship with heavy cargo on top → COM shifts upward → unstable
 * - Balanced cargo → COM stays centered → stable flight
 * 
 * @param {Object} mainBody - The main rigid body with {x, y, mass, radians}
 * @param {Array} bodies - Array of ALL mass-bearing objects:
 *                         - World-space bodies: {x, y, mass} (engines, already positioned)
 *                         - Local-space bodies: {x, y, mass, isLocal: true} (cargo, needs rotation)
 *                         Local-space bodies will be rotated by mainBody.radians
 * @returns {Object} The center of mass position {x, y}
 * 
 * @example
 * const ship = {x: 100, y: 100, mass: 10, radians: 0}
 * const bodies = [
 *     {x: 90, y: 100, mass: 1},              // Engine left (world space)
 *     {x: 110, y: 100, mass: 1},             // Engine right (world space)
 *     {x: 0, y: -50, mass: 20, isLocal: true} // Heavy cargo above ship (local space)
 * ]
 * 
 * const com = calculateCenterOfMass(ship, bodies)
 * // Result: COM shifts upward because of heavy cargo
 * // com.y will be less than 100 (upward in screen coords)
 * 
 * @example
 * // Balanced system - COM at ship center
 * const ship = {x: 100, y: 100, mass: 10, radians: 0}
 * const bodies = [
 *     {x: 90, y: 100, mass: 1},   // Engine left
 *     {x: 110, y: 100, mass: 1}   // Engine right
 * ]
 * const com = calculateCenterOfMass(ship, bodies)
 * // Result: com ≈ {x: 100, y: 100} (near ship center)
 */
function calculateCenterOfMass(mainBody, bodies = []) {
    let totalMass = mainBody.mass
    let x = mainBody.x * mainBody.mass
    let y = mainBody.y * mainBody.mass

    // Pre-calculate rotation for local-space bodies
    const cos = Math.cos(mainBody.radians || 0)
    const sin = Math.sin(mainBody.radians || 0)

    // Add contributions from all bodies
    for (let body of bodies) {
        let worldX, worldY
        
        // Check if this is a local-space body (needs rotation)
        if (body.isLocal) {
            // Rotate from local to world coordinates
            const rotatedX = body.x * cos - body.y * sin
            const rotatedY = body.x * sin + body.y * cos
            worldX = mainBody.x + rotatedX
            worldY = mainBody.y + rotatedY
        } else {
            // Already in world space
            worldX = body.x
            worldY = body.y
        }
        
        totalMass += body.mass
        x += worldX * body.mass
        y += worldY * body.mass
    }

    return {
        x: x / totalMass,
        y: y / totalMass
    }
}

/**
 * Apply forces from engines to a rigid body's linear and angular velocity.
 * 
 * This function calculates both:
 * 1. LINEAR FORCES: Push the body in the direction engines are pointing
 * 2. TORQUE: Rotate the body when engines fire off-center from COM
 * 
 * PHYSICS BREAKDOWN:
 * - Each engine produces a force vector in its pointing direction
 * - Linear forces sum up: F_total = Σ(F_x, F_y)
 * - Acceleration: a = F / m (Newton's 2nd law)
 * - Torque from each engine: τ = r × F (cross product)
 * - Angular acceleration: α = τ / I (rotational analog of F = ma)
 * 
 * WHY TORQUE MATTERS:
 * An engine firing directly through COM produces no rotation (distance = 0).
 * An engine firing perpendicular to COM produces maximum rotation.
 * An engine aligned with COM produces no rotation (force parallel to lever arm).
 * 
 * @param {Object} mainBody - The main rigid body with {vx, vy, rotationSpeed}
 * @param {Array} engines - Array of engines with {x, y, radians, force} properties
 * @param {Object} centerOfMass - The pivot point {x, y}
 * @param {number} totalMass - Total mass of the system
 * @param {number} momentOfInertia - Rotational inertia (I)
 * @returns {Object} The force and torque applied: {fx, fy, torque}
 * 
 * @example
 * const ship = {vx: 0, vy: 0, rotationSpeed: 0}
 * const engines = [
 *     {x: 100, y: 90, radians: -Math.PI/2, force: 1},   // Top engine pointing up
 *     {x: 100, y: 110, radians: -Math.PI/2, force: 1}   // Bottom engine pointing up
 * ]
 * const com = {x: 100, y: 100}
 * 
 * const result = applyEngineForces(ship, engines, com, 12, 250)
 * // Both engines push up → linear force
 * // Engines on opposite sides → no net torque (balanced)
 * 
 * @example
 * // Unbalanced case - creates rotation
 * const engines = [
 *     {x: 100, y: 90, radians: -Math.PI/2, force: 2},   // Top engine (strong)
 *     {x: 100, y: 110, radians: -Math.PI/2, force: 1}   // Bottom engine (weak)
 * ]
 * // Top engine creates clockwise torque, bottom creates counter-clockwise
 * // Net result: ship rotates while moving up
 */
function applyEngineForces(mainBody, engines, centerOfMass, totalMass, momentOfInertia) {
    let fxTotal = 0
    let fyTotal = 0
    let torqueTotal = 0

    for (let engine of engines) {
        const force = engine.force
        
        // Calculate force vector in the direction the engine is pointing
        const fx = Math.cos(engine.radians) * force
        const fy = Math.sin(engine.radians) * force

        fxTotal += fx
        fyTotal += fy

        // Calculate torque (rotational force) around center of mass
        const dx = engine.x - centerOfMass.x
        const dy = engine.y - centerOfMass.y
        
        // Cross product in 2D: torque = r × F
        // dx * fy gives the torque from horizontal distance and vertical force
        // dy * fx gives the torque from vertical distance and horizontal force
        torqueTotal += dx * fy - dy * fx
    }

    // Apply forces to ship's linear velocity
    if (totalMass > 0) {
        mainBody.vx += fxTotal / totalMass
        mainBody.vy += fyTotal / totalMass
    }
    
    // Apply torque to ship's angular velocity
    if (momentOfInertia > 0) {
        mainBody.rotationSpeed += torqueTotal / momentOfInertia
    }
    
    return {
        fx: fxTotal,
        fy: fyTotal,
        torque: torqueTotal
    }
}

/**
 * Apply gravity-gradient torque to a rigid body system.
 * 
 * WHAT IS GRAVITY-GRADIENT TORQUE?
 * When different parts of an object experience slightly different gravitational forces
 * (due to being at different positions), this creates a torque that tries to align
 * the object with the gravity field.
 * 
 * REAL-WORLD EXAMPLE:
 * A top-heavy rocket (like a water tower on a thin base) will tip over because the
 * heavy mass at the top experiences gravity at a different horizontal position than
 * the center of mass, creating a rotational force.
 * 
 * WHY IT MATTERS:
 * - Top-heavy objects are UNSTABLE - they naturally want to flip over
 * - Bottom-heavy objects are STABLE - gravity pulls them back to upright
 * - This is why real rockets have heavy engines at the bottom!
 * 
 * PHYSICS:
 * For each mass point, we calculate:
 * - Its horizontal distance from COM (dx)
 * - The gravitational force on it (mass × gravity)
 * - The torque: τ = dx × (mass × gravity)
 * 
 * All these torques sum up to create rotational instability or stability.
 * 
 * IN THIS SIMULATION:
 * - Heavy cargo at top → large positive dx → destabilizing torque
 * - Heavy cargo at bottom → large negative dx → stabilizing torque
 * - Balanced cargo → near-zero torques → neutral stability
 * 
 * @param {Object} mainBody - The main rigid body with {rotationSpeed, x, y, mass, radians}
 * @param {Array} bodies - Array of ALL mass-bearing objects:
 *                         - World-space bodies: {x, y, mass} (engines, already positioned)
 *                         - Local-space bodies: {x, y, mass, isLocal: true} (cargo, needs rotation)
 *                         Local-space bodies will be rotated by mainBody.radians
 * @param {Object} centerOfMass - The center of mass position {x, y}
 * @param {number} momentOfInertia - Rotational inertia (I)
 * @param {number} gravityStrength - Strength of gravity (default: 0.01)
 * @returns {number} The gravity-induced torque applied
 * 
 * @example
 * // Top-heavy ship - UNSTABLE
 * const ship = {x: 100, y: 100, mass: 10, radians: 0.1, rotationSpeed: 0}  // Tilted slightly
 * const bodies = [
 *     {x: 90, y: 100, mass: 1},              // Engine left
 *     {x: 110, y: 100, mass: 1},             // Engine right
 *     {x: 0, y: -50, mass: 30, isLocal: true} // Heavy cargo HIGH above center
 * ]
 * const com = {x: 100, y: 85}  // COM shifted upward
 * 
 * const torque = applyGravityGradientTorque(ship, bodies, com, 500, 0.01)
 * // Result: Ship will continue tilting and flip over (destabilizing torque)
 * 
 * @example
 * // Bottom-heavy ship - STABLE
 * const ship = {x: 100, y: 100, mass: 10, radians: 0.1, rotationSpeed: 0}  // Tilted slightly
 * const bodies = [
 *     {x: 90, y: 100, mass: 1},              // Engine left
 *     {x: 110, y: 100, mass: 1},             // Engine right
 *     {x: 0, y: 50, mass: 30, isLocal: true}  // Heavy cargo LOW below center
 * ]
 * const com = {x: 100, y: 115}  // COM shifted downward
 * 
 * const torque = applyGravityGradientTorque(ship, bodies, com, 500, 0.01)
 * // Result: Ship will rotate back to upright (stabilizing torque)
 */
function applyGravityGradientTorque(mainBody, bodies, centerOfMass, momentOfInertia, gravityStrength = 0.01) {
    const cos = Math.cos(mainBody.radians || 0)
    const sin = Math.sin(mainBody.radians || 0)
    
    let gravityTorque = 0
    
    // Apply gravity torque from all bodies
    for (let body of bodies) {
        let worldX
        
        // Check if this is a local-space body (needs rotation)
        if (body.isLocal) {
            // Rotate from local to world coordinates
            const rotatedX = body.x * cos - body.y * sin
            worldX = mainBody.x + rotatedX
        } else {
            // Already in world space
            worldX = body.x
        }
        
        // Distance from COM (horizontal distance creates torque)
        const dx = worldX - centerOfMass.x
        
        // Torque = r × F (cross product: horizontal distance × vertical force)
        // Gravity pulls down, so force is in +y direction
        gravityTorque += dx * body.mass * gravityStrength
    }
    
    // Add contribution from main body
    const dx = mainBody.x - centerOfMass.x
    gravityTorque += dx * mainBody.mass * gravityStrength
    
    // Apply the gravity-induced torque
    if (momentOfInertia > 0) {
        mainBody.rotationSpeed += gravityTorque / momentOfInertia
    }
    
    return gravityTorque
}


// ============================================================================
// GAMEPAD INTEGRATION
// ============================================================================

// Gamepad integration
/**
 * 1. Capture first gamepad
 * 2. Engine `a` and `b` rotation to the thumb sticks 
 * 3. Engine `a` and `b` power to the triggers
 */

class GamepadController {
    constructor() {
        this.connected = false
        this.gamepad = null
        this.deadzone = 0.15  // Ignore small stick movements
        
        // Gamepad state dictionary
        this.state = {
            leftStickX: 0,      // Left stick horizontal (-1 to 1)
            leftStickY: 0,      // Left stick vertical (-1 to 1)
            rightStickX: 0,     // Right stick horizontal (-1 to 1)
            rightStickY: 0,     // Right stick vertical (-1 to 1)
            leftTrigger: 0,     // Left trigger (0 to 1)
            rightTrigger: 0,    // Right trigger (0 to 1)
            buttonA: false,
            buttonB: false,
            buttonBack: false,   // Back/Select button (button 8)
            buttonBackPressed: false  // Track button press for edge detection
        }
        
        this.setupGamepadListeners()
    }
    
    setupGamepadListeners() {
        window.addEventListener('gamepadconnected', (e) => {
            console.log('Gamepad connected:', e.gamepad.id)
            this.gamepad = e.gamepad
            this.connected = true
        })
        
        window.addEventListener('gamepaddisconnected', (e) => {
            console.log('Gamepad disconnected')
            this.connected = false
            this.gamepad = null
            this.resetState()
        })
    }
    
    applyDeadzone(value) {
        /* Apply deadzone to analog inputs to prevent drift */
        return Math.abs(value) < this.deadzone ? 0 : value
    }
    
    update() {
        /* Poll gamepad state and update the state dictionary */
        if (!this.connected) return
        
        // Get fresh gamepad state (required for polling API)
        const gamepads = navigator.getGamepads()
        this.gamepad = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3]
        
        if (!this.gamepad) {
            this.connected = false
            return
        }
        
        // Update analog sticks (standard mapping)
        this.state.leftStickX = this.applyDeadzone(this.gamepad.axes[0])
        this.state.leftStickY = this.applyDeadzone(this.gamepad.axes[1])
        this.state.rightStickX = this.applyDeadzone(this.gamepad.axes[2])
        this.state.rightStickY = this.applyDeadzone(this.gamepad.axes[3])
        
        // Update triggers (buttons 6 and 7 on most controllers)
        // Some controllers report triggers as axes, others as buttons
        if (this.gamepad.buttons[6]) {
            this.state.leftTrigger = this.gamepad.buttons[6].value
        }
        if (this.gamepad.buttons[7]) {
            this.state.rightTrigger = this.gamepad.buttons[7].value
        }
        
        // Update face buttons
        this.state.buttonA = this.gamepad.buttons[0]?.pressed || false
        this.state.buttonB = this.gamepad.buttons[1]?.pressed || false
        
        // Update back button (button 8 on most controllers - "Select" or "Back")
        const backPressed = this.gamepad.buttons[8]?.pressed || false
        
        // Edge detection: only trigger once per button press
        if (backPressed && !this.state.buttonBackPressed) {
            this.state.buttonBack = true
        } else {
            this.state.buttonBack = false
        }
        this.state.buttonBackPressed = backPressed
    }
    
    resetState() {
        /* Reset all state values to neutral */
        this.state.leftStickX = 0
        this.state.leftStickY = 0
        this.state.rightStickX = 0
        this.state.rightStickY = 0
        this.state.leftTrigger = 0
        this.state.rightTrigger = 0
        this.state.buttonA = false
        this.state.buttonB = false
        this.state.buttonBack = false
        this.state.buttonBackPressed = false
    }
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
            { x: 0, y: -25, radians: .10, rotationSpeed: 0 },           // engine 'a' - top, pointing forward
            { x: 0, y: 25, radians: -.10, rotationSpeed: 0 },            // engine 'b' - bottom, pointing forward
            { x: 25, y: 0, radians: 0, rotationSpeed: 0 }     // engine 'c' - right side, pointing right
        ]
        
        this.engines = [this.a, this.b, this.c]

        // Add additional mass points to shift center of mass
        // These are "virtual" mass points that don't render but affect physics
        // For a top-heavy VTOL: put heavy mass at the top
        this.massPoints = [
            { x: 80, y: 0, mass: 50 }  // Heavy payload at the top (15 mass units)
            // { x: 30, y: 0, mass: 8 },   // Additional mass slightly lower
            // , { x: 0, y: 40, mass: 20 }   // Light fuel tank at bottom (uncomment to test)
        ]

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

        this.power = 0
        this.powerDown = false

        this.dragging.add(...this.asteroids)
        
        // Initialize gamepad controller
        this.gamepad = new GamepadController()
    }

    applyGamepadControls() {
        /* Apply gamepad inputs to engine controls */
        if (!this.gamepad.connected) return
        
        const gp = this.gamepad.state
        
        // Back button resets the ship to center with zero velocity
        if (gp.buttonBack) {
            this.resetShip()
            return
        }
        
        // Left stick Y-axis controls engine 'a' rotation speed (top engine)
        // Negative Y is up on stick, so we negate for intuitive control
        // When stick is held, rotation accumulates; when released, rotation stops
        const leftStickInput = -gp.leftStickY
        if (Math.abs(leftStickInput) > 0) {
            // Apply rotation speed based on stick deflection
            this.engineOffsets[0].rotationSpeed = leftStickInput * 0.05  // Rotation speed multiplier
        } else {
            // Stop rotation when stick is released
            this.engineOffsets[0].rotationSpeed = 0
        }
        // Accumulate rotation
        this.engineOffsets[0].radians += this.engineOffsets[0].rotationSpeed
        
        // Right stick Y-axis controls engine 'b' rotation speed (bottom engine)
        const rightStickInput = -gp.rightStickY
        if (Math.abs(rightStickInput) > 0) {
            this.engineOffsets[1].rotationSpeed = rightStickInput * 0.05
        } else {
            this.engineOffsets[1].rotationSpeed = 0
        }
        // Accumulate rotation
        this.engineOffsets[1].radians += this.engineOffsets[1].rotationSpeed
        
        // Left trigger controls engine 'a' power (top engine)
        if (gp.leftTrigger > 0) {
            this.a.force += gp.leftTrigger * 0.15  // Scale trigger to force
        }
        
        // Right trigger controls engine 'b' power (bottom engine)
        if (gp.rightTrigger > 0) {
            this.b.force += gp.rightTrigger * 0.15
        }
        
        // Optional: Button A for engine 'c' (side thruster)
        if (gp.buttonA) {
            this.c.force += 0.1
        }
    }

    resetShip() {
        /* Reset ship to center position with zero velocity and rotation */
        this.ship.x = this.center.x
        this.ship.y = this.center.y
        this.ship.vx = 0
        this.ship.vy = 0
        this.ship.radians = -Math.PI / 2  // Point up
        this.ship.rotation = -90
        this.ship.rotationSpeed = 0
        
        // Reset engine forces
        this.engines.forEach(e => e.force = 0)
        
        // Reset engine angles and rotation speeds to default
        this.engineOffsets[0].radians = 0.10
        this.engineOffsets[0].rotationSpeed = 0
        this.engineOffsets[1].radians = -0.10
        this.engineOffsets[1].rotationSpeed = 0
        this.engineOffsets[2].radians = 0
        this.engineOffsets[2].rotationSpeed = 0
        
        console.log('Ship reset to center')
    }

    getTotalMass() {
        /* Helper: Calculate total mass of the system */
        const allBodies = [
            ...this.engines,
            ...this.massPoints
        ]
        
        return calculateTotalMass(this.ship, allBodies)
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
        /* Calculate the center of mass of the ship + engines + mass points system */
        const allBodies = [
            ...this.engines,  // World-space (already positioned)
            ...this.massPoints.map(mp => ({...mp, isLocal: true}))  // Local-space (need rotation)
        ]
        
        return calculateCenterOfMass(this.ship, allBodies)
    }

    /**
     * Computes the moment of inertia of the coupled system around its center of mass.
     * 
     * This method calculates the rotational inertia by summing contributions from:
     * - The main ship body
     * - All attached engines (world-space bodies)
     * - All mass points (local-space bodies marked with isLocal)
     * 
     * The moment of inertia is calculated using the parallel axis theorem:
     * I = Σ(m * r²) where r is the distance from each mass element to the center of mass.
     * 
     * @param {Object} com - The center of mass coordinates
     * @param {number} com.x - X coordinate of the center of mass
     * @param {number} com.y - Y coordinate of the center of mass
     * @returns {number} The total moment of inertia around the center of mass
     */
    computeMomentOfInertia(com) {
        // Combine all bodies into a single array
        // Engines are in world space, mass points are in local space
        const allBodies = [
            ...this.engines,  // World-space (already positioned)
            ...this.massPoints.map(mp => ({...mp, isLocal: true}))  // Local-space (need rotation)
        ]
        
        return calculateMomentOfInertia(com, this.ship, allBodies)
    }

    applyGravityGradientTorque(com, I, gravityStrength = 0.01) {
        /* Simulate gravity-gradient torque - heavier masses farther from COM 
           create instability when not aligned with gravity.
           
           This torque happens because different parts of the system experience
           gravity at different horizontal positions, creating a rotational force.
        */
        const allBodies = [
            ...this.engines,  // World-space (already positioned)
            ...this.massPoints.map(mp => ({...mp, isLocal: true}))  // Local-space (need rotation)
        ]
        
        return applyGravityGradientTorque(this.ship, allBodies, com, I, gravityStrength)
    }

    applyEngineForces(com, I) {
        /* Apply forces from each engine to the ship's linear and angular velocity 
           
           Takes pre-calculated COM and moment of inertia to avoid redundant calculations.
        */
        const totalMass = this.getTotalMass()
        
        return applyEngineForces(this.ship, this.engines, com, totalMass, I)
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
        this.a.force += 0.15
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
        this.b.force += 0.15
    }

    updateShip(){
        // Update gamepad state and apply controls
        this.gamepad.update()
        this.applyGamepadControls()
        
        // OPTIMIZATION: Calculate COM and inertia once at the start
        const comBefore = this.computeCenterOfMass()
        const offsetBeforeX = comBefore.x - this.ship.x
        const offsetBeforeY = comBefore.y - this.ship.y
        
        // Apply rotation FIRST (before updating engine positions)
        this.ship.radians += this.ship.rotationSpeed
        this.ship.rotation = this.ship.radians * 180 / Math.PI
        
        // Dampen rotation
        // this.ship.rotationSpeed *= .99

        // Update engine positions based on NEW ship orientation
        this.updateEnginePositions()
        
        // Now calculate COM with new engine positions
        const comAfter = this.computeCenterOfMass()
        const offsetAfterX = comAfter.x - this.ship.x
        const offsetAfterY = comAfter.y - this.ship.y
        
        // The ship reference point needs to move so that COM stays consistent
        // This keeps the ship rotating around its true center of mass
        this.ship.x += (offsetBeforeX - offsetAfterX)
        this.ship.y += (offsetBeforeY - offsetAfterY)
        
        // Re-update engine positions with corrected ship position
        this.updateEnginePositions()
        
        // Calculate COM and moment of inertia for physics calculations
        const com = this.computeCenterOfMass()
        const I = this.computeMomentOfInertia(com)
        
        // Apply forces from engines to ship (pass COM and I to avoid recalculation)
        this.applyEngineForces(com, I)
        
        // Apply gravity-gradient torque (makes top-heavy configurations unstable)
        // NOTE: This should use the SAME gravity value as the linear gravity below
        const gravityStrength = 0.00
        this.applyGravityGradientTorque(com, I, gravityStrength)
        
        // Apply gravity to ship (linear motion)
        // BUG FIX: This should account for total system mass
        this.ship.vy += gravityStrength

        // Move the ship based on its velocity (this moves the whole system)
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

        // Calculate and draw the center of mass
        const com = this.computeCenterOfMass()
        ctx.fillStyle = '#ff0000'
        ctx.beginPath()
        ctx.arc(com.x, com.y, 8, 0, Math.PI * 2)
        ctx.fill()
        
        // Draw mass points (visualize the payload/fuel tanks)
        const cos = Math.cos(this.ship.radians)
        const sin = Math.sin(this.ship.radians)
        
        ctx.fillStyle = '#ffff00'
        for (let massPoint of this.massPoints) {
            const rotatedX = massPoint.x * cos - massPoint.y * sin
            const rotatedY = massPoint.x * sin + massPoint.y * cos
            const worldX = this.ship.x + rotatedX
            const worldY = this.ship.y + rotatedY
            
            // Size based on mass
            const radius = Math.sqrt(massPoint.mass) * 2
            ctx.beginPath()
            ctx.arc(worldX, worldY, radius, 0, Math.PI * 2)
            ctx.fill()
        }

        // Draw the ship center (green - this is the reference point, not COM)
        this.ship.pen.indicator(ctx, '#00ff00')
        
        // Draw the engines
        this.a.pen.indicator(ctx)
        this.b.pen.indicator(ctx)
        this.c.pen.indicator(ctx, '#ff00ff')  // Purple for the side engine
        
        this.a.pen.line(ctx, this.ship, 'purple')
        this.b.pen.line(ctx, this.ship, 'purple')
        this.c.pen.line(ctx, this.ship, 'purple')
        
        // Draw gamepad status indicator
        if (this.gamepad.connected) {
            ctx.fillStyle = '#00ff00'
            ctx.font = '14px monospace'
            ctx.fillText('🎮 Gamepad Connected', 10, 20)
            
            // Show trigger values
            const gp = this.gamepad.state
            ctx.fillStyle = '#ffffff'
            ctx.fillText(`L: ${gp.leftTrigger.toFixed(2)} R: ${gp.rightTrigger.toFixed(2)}`, 10, 40)
            ctx.fillText(`LS: ${gp.leftStickY.toFixed(2)} RS: ${gp.rightStickY.toFixed(2)}`, 10, 60)
        }

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
