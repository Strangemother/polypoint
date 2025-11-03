/*
# Planetary Gears Extension

An optional extension for the GearBox that adds support for planetary gear systems.

## Features

- **Sun Gear**: Central motor gear that drives the system
- **Planet Gears**: Orbit around the sun while rotating on their own axes
- **Ring Gear**: Outer internal gear that planets mesh with
- **Carrier**: Virtual mechanism that controls orbital motion

## Usage

### Loading

Include `gearbox-planets.js` after loading `gearbox.js`:

```javascript
// In HTML
<script src="point_src/gearbox.js"></script>
<script src="point_src/gearbox-planets.js"></script>

// Or in theatre file:
files:
    ...
    ../point_src/gearbox.js
    ../point_src/gearbox-planets.js
```

### Creating a Planetary System

```javascript
let gearbox = new GearBox();

let planetary = gearbox.createPlanetarySystem({
    sunXY: { x: 400, y: 300 },      // Center position
    sunRadius: 60,                   // Sun gear size
    planetRadius: 25,                // Planet gear size
    ringRadius: 150,                 // Ring gear size (optional, auto-calculated)
    planetCount: 3,                  // Number of planet gears (3-5 recommended)
    sunMotor: 1                      // Motor speed in degrees per frame
});
```

### Accessing Components

```javascript
planetary.sun        // The sun gear (Point)
planetary.planets    // Array of planet gears [Point, Point, ...]
planetary.ring       // The ring gear (Point)
```

### Control Methods

```javascript
// Change sun motor speed
planetary.setSunMotor(2.0)

// Lock/unlock the carrier (prevents orbital motion)
planetary.setCarrierLocked(true)

// Lock/unlock the ring gear
planetary.setRingLocked(true)

// Make the ring gear rotate
planetary.ring.motor = 1
```

### Properties

```javascript
planetary.carrierAngle      // Current orbital angle (degrees)
planetary.carrierVelocity   // Current orbital velocity (degrees/frame)
planetary.orbitRadius       // Distance from sun to planet centers
```

## How It Works

1. The sun gear rotates (motor-driven)
2. Sun meshes with planet gears → planets rotate
3. Planets mesh with ring gear → more rotation force
4. Planet rotation creates tangential velocity
5. Tangential velocity drives the carrier to orbit
6. Carrier updates planet XY positions each frame

The system automatically integrates with the GearBox touch detection and gear meshing logic.

## Examples

See `theatre/gearbox-planetary.js` for a complete working example.

## Notes

- All angles are in **degrees** (polypoint convention), not radians
- Motor speeds are in degrees per frame
- Ring radius is auto-calculated if not provided to ensure proper meshing
- Planets can be dragged but will fight with their orbital motion
- Sun and ring gears can be freely dragged
*/

class PlanetaryGearSystem {
    /* 
     * Manages a planetary gear system with:
     * - Sun gear (center, typically the input/motor)
     * - Planet gears (orbit around sun while rotating)
     * - Ring gear (outer, internal gear that planets mesh with)
     * - Carrier (virtual mechanism that controls orbital motion)
     */

    constructor(gearbox, options={}) {
        this.gearbox = gearbox
        this.planets = []
        this.carrierAngle = options.carrierAngle || 0
        this.carrierVelocity = 0
        
        // Configuration
        let planetCount = options.planetCount || 3
        let sunRadius = options.sunRadius || 50
        let planetRadius = options.planetRadius || 30
        let sunXY = options.sunXY || {x: 400, y: 300}
        
        // Calculate orbit radius (distance from sun center to planet center)
        // Planets touch the sun, so orbit radius = sun radius + planet radius
        this.orbitRadius = sunRadius + planetRadius
        
        // Ring radius must touch the planets from outside
        // Ring inner edge = orbit radius + planet radius
        let ringRadius = options.ringRadius || (this.orbitRadius + planetRadius + 2)
        
        // Create sun gear (motor)
        this.sun = gearbox.createMotor({
            x: sunXY.x,
            y: sunXY.y,
            radius: sunRadius,
            motor: options.sunMotor !== undefined ? options.sunMotor : 0.02
        })
        
        // Create ring gear (internal, stationary by default)
        this.ring = gearbox.createGear({
            x: sunXY.x,
            y: sunXY.y,
            radius: ringRadius,
            internal: true
        })
        
        // Create planet gears evenly distributed around sun
        for(let i = 0; i < planetCount; i++) {
            let angle = (360 / planetCount) * i  // degrees
            let planet = this.createPlanet(angle, planetRadius)
            this.planets.push(planet)
        }
        
        // Register with gearbox for automatic updates
        gearbox.registerPlanetarySystem(this)
    }

    createPlanet(angle, radius) {
        /* Create a single planet gear at the specified angle (in degrees) */
        let pos = this.calculatePlanetPosition(angle)
        
        let planet = this.gearbox.createGear({
            x: pos.x,
            y: pos.y,
            radius: radius,
            angularVelocity: 0
        })
        
        // Mark as orbital so we can identify it
        planet.isOrbital = true
        planet.orbitAngle = angle
        planet.orbitCenter = this.sun
        planet.orbitRadius = this.orbitRadius
        
        return planet
    }

    calculatePlanetPosition(angle) {
        /* Calculate XY position for a planet at the given orbital angle 
         * Angle is in degrees (polypoint convention)
         */
        let radians = angle * Math.PI / 180
        let x = this.sun.x + Math.cos(radians) * this.orbitRadius
        let y = this.sun.y + Math.sin(radians) * this.orbitRadius
        return {x, y}
    }

    updateOrbitalPositions() {
        /* Update planet positions based on carrier rotation 
         * This is called each frame by the gearbox
         * Working in DEGREES (polypoint convention)
         */
        
        // Calculate carrier velocity from planet motion
        // The carrier rotates when planets are pushed by the sun or ring
        this.updateCarrierVelocity()
        
        // Update carrier angle (in degrees)
        this.carrierAngle += this.carrierVelocity
        
        // Keep angle in 0-360 range
        if(this.carrierAngle > 360) this.carrierAngle -= 360
        if(this.carrierAngle < 0) this.carrierAngle += 360
        
        // Position each planet along its orbit
        this.planets.forEach((planet, i) => {
            // Evenly space planets around the orbit (in degrees)
            let baseAngle = (360 / this.planets.length) * i
            let angle = baseAngle + this.carrierAngle
            
            let pos = this.calculatePlanetPosition(angle)
            planet.x = pos.x
            planet.y = pos.y
            planet.orbitAngle = angle
            
            // Update XY binding if exists (for pinion wheels)
            if(this.gearbox.bindMap.bindMap.has(planet)) {
                let boundGears = this.gearbox.bindMap.bindMap.get(planet)
                boundGears.forEach(bound => {
                    bound.x = pos.x
                    bound.y = pos.y
                })
            }
        })
        
        // Dampen carrier velocity (less damping than before)
        this.carrierVelocity *= 0.95
    }

    updateCarrierVelocity() {
        /* Calculate carrier rotation based on planet velocities 
         * When planets rotate, they "walk" around the sun/ring, driving the carrier
         * 
         * Working in DEGREES (not radians) since polypoint uses degrees
         */
        
        if(this.planets.length === 0) return
        
        // Average the tangential velocity of all planets
        let avgTangentialVelocity = 0
        
        this.planets.forEach(planet => {
            // Tangential velocity = angular velocity (degrees) * radius
            // Convert degrees to "arc length" movement
            let tangentialContribution = planet.angularVelocity * (Math.PI / 180) * planet.radius
            avgTangentialVelocity += tangentialContribution
        })
        
        avgTangentialVelocity /= this.planets.length
        
        // Convert tangential velocity to carrier angular velocity (in degrees)
        // This is how much the carrier rotates based on planet "walking"
        let carrierContribution = (avgTangentialVelocity / this.orbitRadius) * (180 / Math.PI)
        
        // Blend with existing velocity for smooth motion
        // Reduce influence significantly to prevent runaway speed
        this.carrierVelocity = this.carrierVelocity * 0.85 + carrierContribution * 0.15
    }

    setCarrierLocked(locked) {
        /* Lock or unlock the carrier (prevents orbital motion) */
        this.carrierLocked = locked
        if(locked) {
            this.carrierVelocity = 0
        }
    }

    setRingLocked(locked) {
        /* Lock or unlock the ring gear */
        if(locked) {
            this.ring.motor = 0
            this.ring.angularVelocity = 0
        }
        this.ringLocked = locked
    }

    setSunMotor(velocity) {
        /* Change the sun gear motor speed */
        this.sun.motor = velocity
    }
}
