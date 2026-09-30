# Moment of Inertia - Developer API Reference

## Quick Reference

### Function Signature

```javascript
function calculateMomentOfInertia(centerOfMass, mainBody, attachedBodies = [], virtualMassPoints = [])
```

---

## Parameters

### `centerOfMass` (Object, required)
The pivot point around which rotation occurs.

```javascript
{
    x: number,  // X coordinate
    y: number   // Y coordinate
}
```

**Example:**
```javascript
const com = { x: 100, y: 100 }
```

---

### `mainBody` (Object, required)
The primary rigid body (e.g., spacecraft hull).

```javascript
{
    x: number,        // X position in world space
    y: number,        // Y position in world space
    mass: number,     // Mass in arbitrary units
    radians: number   // Current rotation angle (for rotating virtual masses)
}
```

**Example:**
```javascript
const ship = { x: 100, y: 100, mass: 10, radians: 0 }
```

---

### `attachedBodies` (Array, optional)
Physical objects attached to the main body (e.g., engines, solar panels).

Each object must have:
```javascript
{
    x: number,      // X position in world space
    y: number,      // Y position in world space
    mass: number    // Mass in same units as mainBody
}
```

**Example:**
```javascript
const engines = [
    { x: 90, y: 100, mass: 1 },   // Left engine
    { x: 110, y: 100, mass: 1 }   // Right engine
]
```

---

### `virtualMassPoints` (Array, optional)
Mass points defined in local space relative to mainBody (e.g., cargo, fuel).

Each point must have:
```javascript
{
    x: number,      // X offset from mainBody (local coordinates)
    y: number,      // Y offset from mainBody (local coordinates)
    mass: number    // Mass in same units as mainBody
}
```

**Example:**
```javascript
const cargo = [
    { x: 50, y: 0, mass: 20 },    // Heavy cargo 50 units to the right
    { x: -30, y: 10, mass: 5 }    // Light cargo upper-left
]
```

> **Note:** Virtual mass points are automatically rotated to world space using `mainBody.radians`.

---

## Return Value

**Type:** `number`

The moment of inertia (I) around the center of mass, measured in mass × distance² units.

**Interpretation:**
- **Higher I** = Harder to rotate = More stable = Sluggish
- **Lower I** = Easier to rotate = Less stable = Responsive

---

## Usage Examples

### Example 1: Simple Spacecraft

```javascript
// Center of mass
const com = { x: 100, y: 100 }

// Main ship body
const ship = {
    x: 100,
    y: 100,
    mass: 10,
    radians: 0
}

// Two engines
const engines = [
    { x: 95, y: 100, mass: 1 },   // 5 units left
    { x: 105, y: 100, mass: 1 }   // 5 units right
]

const I = calculateMomentOfInertia(com, ship, engines)
// Result: ~50 (relatively low, responsive)
```

---

### Example 2: Ship with Extended Cargo

```javascript
const com = { x: 150, y: 100 }  // COM shifted by heavy cargo

const ship = {
    x: 100,
    y: 100,
    mass: 10,
    radians: 0
}

const engines = [
    { x: 95, y: 100, mass: 1 },
    { x: 105, y: 100, mass: 1 }
]

const cargo = [
    { x: 80, y: 0, mass: 50 }  // Heavy cargo far to the right
]

const I = calculateMomentOfInertia(com, ship, engines, cargo)
// Result: ~240,000+ (very high, slow to rotate)
```

**Why so high?** Distance is squared! The cargo at x=80 contributes: `50 × (80-50)² = 45,000`

---

### Example 3: Rotating Ship

```javascript
const com = { x: 100, y: 100 }

const ship = {
    x: 100,
    y: 100,
    mass: 10,
    radians: Math.PI / 4  // 45 degrees
}

const cargo = [
    { x: 50, y: 0, mass: 20 }  // In local space (will be rotated)
]

const I = calculateMomentOfInertia(com, ship, [], cargo)
// Cargo is automatically rotated to world coordinates before calculation
```

---

## Common Patterns

### Pattern 1: Update I Every Frame

```javascript
class Ship {
    updatePhysics() {
        const com = this.calculateCenterOfMass()
        const I = calculateMomentOfInertia(
            com,
            this.body,
            this.engines,
            this.cargo
        )
        
        // Use I to calculate angular acceleration
        const angularAccel = this.torque / I
        this.angularVelocity += angularAccel
    }
}
```

---

### Pattern 2: Caching for Performance

```javascript
class Ship {
    constructor() {
        this.cachedI = null
        this.massConfigChanged = true
    }
    
    getMomentOfInertia(com) {
        if (this.massConfigChanged) {
            this.cachedI = calculateMomentOfInertia(
                com,
                this.body,
                this.engines,
                this.cargo
            )
            this.massConfigChanged = false
        }
        return this.cachedI
    }
    
    addCargo(cargoItem) {
        this.cargo.push(cargoItem)
        this.massConfigChanged = true  // Invalidate cache
    }
}
```

---

### Pattern 3: Compare Configurations

```javascript
// Configuration A: Compact
const compactCargo = [{ x: 10, y: 0, mass: 20 }]
const I_compact = calculateMomentOfInertia(com, ship, engines, compactCargo)

// Configuration B: Extended
const extendedCargo = [{ x: 80, y: 0, mass: 20 }]
const I_extended = calculateMomentOfInertia(com, ship, engines, extendedCargo)

console.log(`Compact I: ${I_compact}`)    // ~440
console.log(`Extended I: ${I_extended}`)  // ~45,000+
console.log(`Ratio: ${I_extended / I_compact}x harder to spin`)
```

---

## Physics Integration

### Calculating Angular Acceleration

```javascript
const torque = calculateTorqueFromEngines(engines)
const com = calculateCenterOfMass(ship, engines, cargo)
const I = calculateMomentOfInertia(com, ship, engines, cargo)

// Newton's second law for rotation: τ = I × α
const angularAcceleration = torque / I

// Update angular velocity
ship.angularVelocity += angularAcceleration * deltaTime
ship.rotation += ship.angularVelocity * deltaTime
```

---

## Troubleshooting

### Problem: I is always zero or very small
**Cause:** All masses are at the center of mass.
**Solution:** Check that your COM calculation is correct and that masses have non-zero distances.

### Problem: I is enormous
**Cause:** Masses are very far from COM, or distances aren't normalized.
**Solution:** This might be correct! Remember distance is squared. A mass 100 units away contributes 10,000× its mass to I.

### Problem: Ship behaves strangely when rotated
**Cause:** Forgot to pass `radians` to mainBody for virtual mass rotation.
**Solution:** Always include `radians` property when using virtual mass points.

---

## Performance Considerations

**Time Complexity:** O(n) where n is total number of mass elements.

**Typical frame time:** < 0.1ms for 100 mass elements.

**Optimization tips:**
1. Cache I when mass configuration doesn't change
2. Update I only when adding/removing cargo or changing configuration
3. Use simpler approximations if you have thousands of particles

---

## Further Reading

- `moment-of-inertia-explained.md` - Intuitive guide for beginners
- `coupled-vectors-c.js` - Full implementation example
- Physics textbook: "Rotational dynamics" chapter

---

## Quick Decision Guide

**When do I need this?**
- ✅ Simulating rotating rigid bodies
- ✅ Calculating how engines affect rotation
- ✅ Balancing ship/vehicle handling
- ❌ Simple arcade-style rotation (just use a constant)
- ❌ Point masses with no extent
