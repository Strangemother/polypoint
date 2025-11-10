/*
title: Spaceship Vector Object
*/

// ============================================================================
// SHIP CLASS
// ============================================================================

/**
 * Ship class representing a rigid body with coupled engines.
 *
 * This extends Point to create a physics-enabled ship that:
 * - Has mass and rotational inertia
 * - Rotates around its center of mass
 * - Responds to engine forces and gravity
 * - Manages attached engines
 */
class Ship extends Point {
    constructor(config = {}) {
        super(config)

        // Physics properties
        this.vx = config.vx || 0
        this.vy = config.vy || 0
        this.radians = config.radians || -Math.PI/2  // Default: pointing up
        this.rotationSpeed = config.rotationSpeed || 0
        this.mass = config.mass || 10
        this.radius = config.radius || 5

        // Set rotation in degrees for Point compatibility
        this.rotation = this.radians * 180 / Math.PI

        // Engine management
        this.engines = []
        this.engineOffsets = []
    }

    /**
     * Add an engine to the ship using relative (local-space) position.
     *
     * The engine Point's x, y, and rotation are treated as RELATIVE to the ship:
     * - x, y: Offset from ship's center in local coordinates
     * - rotation: Rotation relative to ship's forward direction (in degrees)
     *
     * The engine will be positioned in world space and moved with the ship.
     *
     * @param {Point} enginePoint - The Point object with relative position (x, y, rotation)
     * @param {number} [mass=1] - Engine mass (default: 1)
     * @returns {Ship} Returns this for method chaining
     *
     * @example
     * const ship = new Ship({ x: 200, y: 225, radians: -Math.PI/2 })
     * const engineA = new Point({ x: 0, y: -25, rotation: 0, radius: 10 })
     *
     * ship.addEngine(engineA, 1)  // Engine at top, pointing same direction as ship
     */
    addEngine(enginePoint, mass = 1) {
        // Ensure engine has required physics properties
        enginePoint.mass = mass
        enginePoint.force = enginePoint.force || 0

        // Convert rotation from degrees to radians if needed
        const engineRadians = enginePoint.radians || (enginePoint.rotation * Math.PI / 180)

        // Store the RELATIVE position (already in local space)
        const engineOffset = {
            x: enginePoint.x,
            y: enginePoint.y,
            radians: engineRadians,
            initialRadians: engineRadians,  // Store initial rotation for reset
            rotationSpeed: 0
        }

        // Transform engine to world space initially
        const cos = Math.cos(this.radians)
        const sin = Math.sin(this.radians)
        const rotatedX = enginePoint.x * cos - enginePoint.y * sin
        const rotatedY = enginePoint.x * sin + enginePoint.y * cos

        enginePoint.x = this.x + rotatedX
        enginePoint.y = this.y + rotatedY
        enginePoint.radians = this.radians + engineRadians
        enginePoint.rotation = enginePoint.radians * 180 / Math.PI

        this.engines.push(enginePoint)
        this.engineOffsets.push(engineOffset)

        return this  // Allow chaining
    }

    /**
     * Update engine positions based on ship's current position and rotation.
     *
     * This transforms each engine from local space (relative to ship) to world space
     * by applying rotation and translation. Should be called whenever the ship moves
     * or rotates.
     */
    updateEnginePositions() {
        const cos = Math.cos(this.radians)
        const sin = Math.sin(this.radians)

        this.engines.forEach((engine, i) => {
            const offset = this.engineOffsets[i]

            // Rotate the offset by the ship's current rotation
            const rotatedX = offset.x * cos - offset.y * sin
            const rotatedY = offset.x * sin + offset.y * cos

            // Position engine relative to ship
            engine.x = this.x + rotatedX
            engine.y = this.y + rotatedY

            // Sync engine rotation with ship + local offset
            engine.radians = this.radians + offset.radians
            engine.rotation = (engine.radians * 180 / Math.PI)
        })
    }

    /**
     * Reset ship to a position with zero velocity and rotation.
     *
     * This resets all physics state including:
     * - Position (x, y)
     * - Velocity (vx, vy)
     * - Rotation (radians, rotationSpeed)
     * - Engine forces
     * - Engine rotation offsets to initial values
     *
     * @param {number} x - X position to reset to
     * @param {number} y - Y position to reset to
     * @param {number} [radians=-Math.PI/2] - Rotation in radians (default: pointing up)
     * @returns {Ship} Returns this for method chaining
     */
    reset(x, y, radians = -Math.PI / 2) {
        // Reset position and velocity
        this.x = x
        this.y = y
        this.vx = 0
        this.vy = 0

        // Reset rotation
        this.radians = radians
        this.rotation = radians * 180 / Math.PI
        this.rotationSpeed = 0

        // Reset engine forces
        this.engines.forEach(e => e.force = 0)

        // Reset engine offsets to their stored initial values
        this.engineOffsets.forEach(offset => {
            offset.rotationSpeed = 0
            offset.radians = offset.initialRadians  // Reset to initial rotation direction
        })

        // Update engine positions to match new ship state
        this.updateEnginePositions()

        return this
    }

    /**
     * Draw the ship and its engines to the canvas.
     *
     * This renders:
     * - Ship center point (green indicator)
     * - All engine points with indicators
     * - Lines connecting engines to ship center
     * - Optional: Center of mass indicator
     * - Optional: Mass points (cargo, fuel tanks, etc.)
     * - Optional: Lines connecting engines to form rigid body outline
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas 2D context
     * @param {Object} [options] - Drawing options
     * @param {string} [options.shipColor='#00ff00'] - Color for ship center
     * @param {string} [options.engineColor] - Default color for engines (uses engine defaults if not set)
     * @param {string} [options.lineColor='purple'] - Color for lines connecting engines to ship
     * @param {boolean} [options.drawOutline=false] - Whether to draw rigid body outline
     * @param {string} [options.outlineColor='#ffffff44'] - Color for rigid body outline
     * @param {Object} [options.com] - Center of mass position {x, y} (if provided, will be drawn)
     * @param {string} [options.comColor='#ff0000'] - Color for center of mass indicator
     * @param {number} [options.comRadius=8] - Radius of center of mass circle
     * @param {Array} [options.massPoints] - Array of mass points to visualize [{x, y, mass}, ...]
     * @param {string} [options.massPointColor='#ffff00'] - Color for mass point indicators
     */
    drawShip(ctx, options = {}) {
        const {
            shipColor = '#00ff00',
            engineColor,
            lineColor = 'purple',
            drawOutline = false,
            outlineColor = '#ffffff44',
            com,
            comColor = '#ff0000',
            comRadius = 8,
            massPoints,
            massPointColor = '#ffff00'
        } = options

        // Draw center of mass if provided
        if (com) {
            ctx.fillStyle = comColor
            ctx.beginPath()
            ctx.arc(com.x, com.y, comRadius, 0, Math.PI * 2)
            ctx.fill()
        }

        // Draw mass points if provided (visualize payload/fuel tanks)
        if (massPoints && massPoints.length > 0) {
            const cos = Math.cos(this.radians)
            const sin = Math.sin(this.radians)

            ctx.fillStyle = massPointColor
            for (let massPoint of massPoints) {
                const rotatedX = massPoint.x * cos - massPoint.y * sin
                const rotatedY = massPoint.x * sin + massPoint.y * cos
                const worldX = this.x + rotatedX
                const worldY = this.y + rotatedY

                // Size based on mass
                const radius = Math.sqrt(massPoint.mass) * 2
                ctx.beginPath()
                ctx.arc(worldX, worldY, radius, 0, Math.PI * 2)
                ctx.fill()
            }
        }

        // Draw the ship center (green - this is the reference point, not COM)
        this.pen.indicator(ctx, shipColor)

        // Draw the engines
        this.engines.forEach((engine, i) => {
            // Use custom color or let engine use its default
            if (engineColor) {
                engine.pen.indicator(ctx, engineColor)
            } else {
                // Use different colors for different engines (for visual distinction)
                const colors = [undefined, undefined, '#ff00ff']  // Purple for third engine
                engine.pen.indicator(ctx, colors[i])
            }

            // Draw line from engine to ship center
            engine.pen.line(ctx, this, lineColor)
        })

        // Optional: Draw lines connecting engines to show rigid body
        if (drawOutline && this.engines.length > 2) {
            ctx.strokeStyle = outlineColor
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(this.engines[0].x, this.engines[0].y)
            for (let i = 1; i < this.engines.length; i++) {
                ctx.lineTo(this.engines[i].x, this.engines[i].y)
            }
            ctx.lineTo(this.engines[0].x, this.engines[0].y)
            ctx.stroke()
        }
    }
}
