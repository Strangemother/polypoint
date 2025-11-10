/*
title: Vector Physics Engine
*/

// ============================================================================
// MOMENT OF INERTIA CALCULATION
// ============================================================================

/**
 * Calculate the moment of inertia for a rigid body system around its center of mass.
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

/**
 * Apply gamepad controller inputs to engine controls.
 *
 * WHAT THIS DOES:
 * Maps gamepad analog sticks and triggers to engine rotation and thrust:
 * - Left stick Y-axis: Controls top engine (a) rotation speed
 * - Right stick X-axis: Controls bottom engines (b, c) rotation speed
 * - Left trigger: Controls top engine (a) thrust
 * - Right trigger: Controls bottom engine (b) thrust
 * - Button A: Side thruster (c) burst
 * - Back button: Reset ship to center
 *
 * ROTATION BEHAVIOR:
 * - 'accumulate' mode: Engine rotation accumulates and holds position when released
 * - 'spring-back' mode: Engines spring back to initial position when released
 *
 * DEADZONE:
 * Small stick movements are ignored (handled by GamepadController) to prevent
 * controller drift from causing unwanted inputs.
 *
 * @param {Object} gamepadState - The gamepad state dictionary with analog values
 * @param {Array} engines - Array of engine objects [{force, ...}, ...]
 * @param {Array} engineOffsets - Array of engine offset configs [{radians, rotationSpeed, ...}, ...]
 * @param {number} triggerForce - Force multiplier for trigger inputs (default: 0.06)
 * @param {Function} resetCallback - Optional callback function to reset the ship
 * @param {number} rotationSensitivity - Rotation speed sensitivity multiplier (default: 1.0)
 * @param {string} rotationMode - 'accumulate' or 'spring-back' (default: 'accumulate')
 * @param {boolean} invertRotation - Invert the rightStickX rotation direction (default: false)
 * @returns {Object} Updated input state for debugging: {rotation: [a, b], thrust: [a, b, c]}
 *
 * @example
 * const gp = gamepadController.state
 * const engines = [engineA, engineB, engineC]
 * const offsets = [
 *     {radians: 0.1, rotationSpeed: 0},
 *     {radians: -0.1, rotationSpeed: 0},
 *     {radians: 0, rotationSpeed: 0}
 * ]
 *
 * const inputs = applyGamepadControls(gp, engines, offsets, 0.06, () => resetShip(), 0.5, 'spring-back', false)
 * // Stick up → engine rotates, trigger → thrust applied
 * // inputs = {rotation: [0.05, -0.03], thrust: [0.12, 0.08, 0]}
 */
function applyGamepadControls(gamepadState, engines, engineOffsets, triggerForce = 0.06, resetCallback = null, rotationSensitivity = 1.0, rotationMode = 'accumulate', invertRotation = false) {
    const gp = gamepadState

    // Back button resets the ship to center with zero velocity
    if (gp.buttonBack && resetCallback) {
        resetCallback()
        return {rotation: [0, 0], thrust: [0, 0, 0]}
    }

    // Left stick Y-axis controls engine 'a' rotation speed (top engine)
    // Negative Y is up on stick, so we negate for intuitive control
    // When stick is held, rotation accumulates; when released, rotation stops
    const leftStickInput = -gp.leftStickY
    if (Math.abs(leftStickInput) > 0) {
        // Apply rotation speed based on stick deflection
        engineOffsets[0].rotationSpeed = leftStickInput * 0.05  // Rotation speed multiplier
    } else {
        // Stop rotation when stick is released
        engineOffsets[0].rotationSpeed = 0
    }
    // Accumulate rotation
    engineOffsets[0].radians += engineOffsets[0].rotationSpeed

    // Right stick X-axis controls engine 'b' and 'c' rotation speed (bottom engines)
    const rightStickInput = gp.rightStickX * (invertRotation ? -1 : 1)  // Apply inversion if enabled

    if (rotationMode === 'spring-back') {
        // SPRING-BACK MODE: Engines rotate toward input angle, spring back to zero when released
        const targetAngle = rightStickInput * Math.PI / 2  // Max ±90 degrees
        const springStrength = 0.2  // How fast engines return to target

        // Smoothly interpolate toward target angle
        engineOffsets[1].radians += (targetAngle - engineOffsets[1].radians) * springStrength
        engineOffsets[2].radians += (targetAngle - engineOffsets[2].radians) * springStrength

        // Store rotation speed for debug display
        engineOffsets[1].rotationSpeed = (targetAngle - engineOffsets[1].radians) * springStrength
        engineOffsets[2].rotationSpeed = engineOffsets[1].rotationSpeed
    } else {
        // ACCUMULATE MODE: Traditional accumulating rotation
        if (Math.abs(rightStickInput) > 0) {
            engineOffsets[1].rotationSpeed = rightStickInput * -0.05 * rotationSensitivity
            engineOffsets[2].rotationSpeed = rightStickInput * -0.05 * rotationSensitivity  // Engine 'c' rotates same as 'b'
        } else {
            engineOffsets[1].rotationSpeed = 0
            engineOffsets[2].rotationSpeed = 0
        }
        // Accumulate rotation for both engines
        engineOffsets[1].radians += engineOffsets[1].rotationSpeed
        engineOffsets[2].radians += engineOffsets[2].rotationSpeed
    }

    // Left trigger controls engine 'a' power (left engine)
    let thrustA = 0, thrustB = 0, thrustC = 0
    if (gp.leftTrigger > 0) {
        thrustA = gp.leftTrigger * triggerForce
        engines[1].force += thrustA
    }

    // Right trigger controls engine 'b' power (bottom engine)
    if (gp.rightTrigger > 0) {
        thrustB = gp.rightTrigger * triggerForce
        engines[2].force += thrustB
    }

    // Optional: Button A for engine 'c' (top thruster)
    if (gp.buttonA) {
        thrustC = triggerForce
        engines[0].force += thrustC
    }

    return {
        rotation: [engineOffsets[0].rotationSpeed, engineOffsets[1].rotationSpeed],
        thrust: [thrustA, thrustB, thrustC]
    }
}

/**
 * Update rigid body physics for a ship with coupled engines.
 *
 * WHAT THIS DOES:
 * This is the main physics simulation loop that:
 * 1. Updates ship rotation around its center of mass
 * 2. Applies engine forces (linear thrust and torque)
 * 3. Applies gravity-gradient torque (top-heavy instability)
 * 4. Moves the ship through space
 * 5. Decays engine forces over time
 *
 * THE CENTER OF MASS CHALLENGE:
 * As the ship rotates, the center of mass (COM) position changes relative to
 * the ship's reference point. To keep rotation smooth and physically correct,
 * we must:
 * - Calculate COM before rotation
 * - Apply rotation to ship
 * - Calculate COM after rotation
 * - Adjust ship position so COM stays in the same world position
 *
 * This prevents the ship from "wobbling" as it rotates.
 *
 * OPTIMIZATION:
 * COM and moment of inertia are calculated only 3 times per frame:
 * - Once before rotation (to track COM offset)
 * - Once after rotation (to correct ship position)
 * - Once for physics calculations (forces and torques)
 *
 * STANDALONE DESIGN:
 * This function uses the standalone physics functions directly (calculateCenterOfMass,
 * calculateMomentOfInertia, applyEngineForces, applyGravityGradientTorque) making it
 * completely independent and reusable without requiring class method wrappers.
 *
 * @param {Object} ship - Main rigid body {x, y, vx, vy, radians, rotationSpeed, mass}
 * @param {Array} engines - Array of engines with {x, y, radians, force, mass}
 * @param {Array} massPoints - Additional mass points [{x, y, mass}] in local space
 * @param {Object} options - Configuration options
 * @param {Function} options.updateEnginePositions - Callback to update engine visual positions
 * @param {Function} options.addMotion - Callback to apply velocity (default: simple addition)
 * @param {number} options.gravityStrength - Gravity acceleration (default: 0.01)
 * @param {number} options.forceDecay - Engine force decay factor (default: 0.9)
 * @param {number} options.speed - Movement speed multiplier (default: 1)
 * @returns {Object} Physics state for debugging: {com: {x, y}, I, forces, torques}
 *
 * @example
 * // Minimal usage - only updateEnginePositions callback required
 * const result = updateRigidBodyPhysics(ship, engines, massPoints, {
 *     updateEnginePositions: updateEngineCallback
 * })
 */
function updateRigidBodyPhysics(ship, engines, massPoints, options = {}) {
    const {
        updateEnginePositions,
        addMotion = (ship, speed = 1) => {
            ship.x += ship.vx * speed
            ship.y += ship.vy * speed
        },
        gravityStrength = 0.00,
        forceDecay = 0.9,
        speed = 1
    } = options

    // Helper: Combine all bodies for physics calculations
    const getAllBodies = () => [
        ...engines,  // World-space (already positioned)
        ...massPoints.map(mp => ({...mp, isLocal: true}))  // Local-space (need rotation)
    ]
    const allBodies = getAllBodies()
    // STEP 1: Calculate COM before rotation (to track world position)
    const comBefore = calculateCenterOfMass(ship, allBodies)
    // const comBefore = calculateCenterOfMass(ship, getAllBodies())

    // STEP 2: Apply rotation to ship
    ship.radians += ship.rotationSpeed
    ship.rotation = ship.radians * 180 / Math.PI

    // STEP 3: Update engine positions based on new ship orientation
    // updateEnginePositions()
    ship.updateEnginePositions()
    // STEP 4: Calculate COM after rotation (with new engine positions)
    const comAfter = calculateCenterOfMass(ship, allBodies)
    // const comAfter = calculateCenterOfMass(ship, getAllBodies())

    // STEP 5: Adjust ship position so COM stays in same world position
    // This keeps the ship rotating around its true center of mass
    // We need to move the ship by the amount the COM moved
    const comDeltaX = comAfter.x - comBefore.x
    const comDeltaY = comAfter.y - comBefore.y
    ship.x -= comDeltaX
    ship.y -= comDeltaY

    // STEP 6: Re-update engine positions with corrected ship position
    // updateEnginePositions()
    ship.updateEnginePositions()

    // STEP 7: Calculate final COM and moment of inertia for physics
    // const allBodies = getAllBodies()
    const com = calculateCenterOfMass(ship, allBodies)
    const I = calculateMomentOfInertia(com, ship, allBodies)

    // STEP 8: Apply engine forces (linear thrust + torque)
    const totalMass = calculateTotalMass(ship, allBodies)
    const forceResult = applyEngineForces(ship, engines, com, totalMass, I)

    // STEP 9: Apply gravity-gradient torque (top-heavy = unstable)
    const gravityTorque = applyGravityGradientTorque(ship, allBodies, com, I, gravityStrength)

    // STEP 10: Apply linear gravity to ship
    ship.vy += gravityStrength

    // STEP 11: Move ship based on velocity
    addMotion(ship, speed)

    // STEP 12: Decay engine forces over time
    engines.forEach(e => e.force *= forceDecay)

    return {
        com: com,
        momentOfInertia: I,
        forces: forceResult,
        gravityTorque: gravityTorque
    }
}