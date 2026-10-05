import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

let clockNow = 0
let tickerCallback
let clearedTicker

const context = vm.createContext({
    Stage: class { static go() {} },
    Point: class { constructor(options) { Object.assign(this, options) } },
    PointList: class extends Array {
        constructor(...points) {
            super(...points)
            this.pen = { indicators() {} }
        }
    },
    radiansToDegrees: radians => radians * 180 / Math.PI,
    performance: { now: () => clockNow },
    setInterval(callback, intervalMs) {
        tickerCallback = callback
        return { callback, intervalMs }
    },
    clearInterval(timer) {
        clearedTicker = timer
    }
})

vm.runInContext(
    `${readFileSync(new URL('../theatre/gravity-points-2-5.js', import.meta.url), 'utf8')}
    globalThis.physics = {
        BodyHitReactor,
        applyGravityAndAirDrag,
        box,
        createSphere,
        materials,
        physicsWorld,
        resolveBoxCollision,
        MainStage
    };`,
    context
)

const { BodyHitReactor, applyGravityAndAirDrag, createSphere, materials, physicsWorld } =
    context.physics

function makeBall(x, vx, options={}) {
    return {
        x, y: 200, vx, vy: options.vy ?? 0, radius: 10, radiusMeters: 0.1,
        mass: options.mass ?? 1, bounciness: options.bounciness ?? 1,
        friction: options.friction ?? 0, dragCoefficient: 0, omega: 0, rotation: 0
    }
}

function near(actual, expected, tolerance=1e-9) {
    assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`)
}

test('solid-sphere size comes from mass and material density', () => {
    const aluminum = createSphere({ x: 1, y: 1, mass: 10, material: materials.aluminum })
    const lead = createSphere({ x: 1, y: 1, mass: 10, material: materials.lead })
    near(aluminum.radiusMeters, Math.cbrt(30 / (4 * Math.PI * materials.aluminum.density)))
    assert.ok(aluminum.radiusMeters > lead.radiusMeters)
    near(aluminum.radius, aluminum.radiusMeters * physicsWorld.pixelsPerMeter)
    near(aluminum.x, physicsWorld.pixelsPerMeter)
})

test('gravity uses seconds and air drag decelerates the lighter equal-sized sphere more', () => {
    const gravityOnly = {
        x: 0, y: 0, vx: 0, vy: 0, mass: 10, radiusMeters: 0.1,
        dragCoefficient: 0, omega: 0, rotation: 0
    }
    applyGravityAndAirDrag(gravityOnly, 0.1)
    near(gravityOnly.vy, physicsWorld.gravity.y * 0.1)
    near(gravityOnly.y, gravityOnly.vy * 0.1 * physicsWorld.pixelsPerMeter)

    const heavy = {
        x: 0, y: 0, vx: 10, vy: 0, mass: 10, radiusMeters: 0.1,
        dragCoefficient: 0.47, omega: 0, rotation: 0
    }
    const light = { ...heavy, mass: 0.3 }
    applyGravityAndAirDrag(heavy, 0.1)
    applyGravityAndAirDrag(light, 0.1)
    assert.ok(heavy.vx > light.vx)
})

test('equal-mass elastic collision conserves momentum and removes overlap', () => {
    const a = makeBall(100, 2)
    const b = makeBall(118, -1)
    const reactor = new BodyHitReactor([a, b])
    reactor.step()
    near(a.mass * a.vx + b.mass * b.vx, 1)
    near(a.vx, -1)
    near(b.vx, 2)
    assert.ok((b.x - a.x) / physicsWorld.pixelsPerMeter >= 0.1989)
})

test('collision impulse is weighted by mass', () => {
    const a = makeBall(100, 2, { mass: 1 })
    const b = makeBall(118, 0, { mass: 3 })
    new BodyHitReactor([a, b]).step()
    near(a.vx, -1)
    near(b.vx, 1)
    near(a.mass * a.vx + b.mass * b.vx, 2)
})

test('contact friction transfers tangential motion into spin', () => {
    const a = makeBall(100, 1, { vy: 1, friction: 0.8, bounciness: 0 })
    const b = makeBall(118, -1, { vy: -1, friction: 0.8, bounciness: 0 })
    new BodyHitReactor([a, b]).step()
    assert.notEqual(a.omega, 0)
    assert.notEqual(b.omega, 0)
})

test('box contact uses radius-aware bounds and rebounds inward', () => {
    const point = {
        x: 105, y: 300, vx: -2, vy: 1, radius: 10, radiusMeters: 0.1,
        mass: 1, bounciness: 0.8, friction: 0.5, omega: 0
    }
    context.physics.resolveBoxCollision(point)
    near(point.x, context.physics.box.left + point.radius)
    assert.ok(point.vx > 0)
})

test('fixed-step advance runs gravity before body collisions', () => {
    const order = []
    const reactor = new BodyHitReactor([], {
        beforeStep(dt) {
            order.push(dt)
        }
    })
    const steps = reactor.advance(physicsWorld.fixedStepSeconds * 4)
    assert.equal(steps, 4)
    assert.equal(order.length, 4)
    for (const dt of order) near(dt, physicsWorld.fixedStepSeconds)
})

test('stage runs physics on its ticker, not while drawing', () => {
    const stage = new context.physics.MainStage()
    stage.mounted()
    stage.stopPhysics()
    assert.equal(stage.points.length, 3)
    const before = Array.from(stage.points, point => point.y)
    const ctx = {
        save() {},
        strokeRect() {},
        restore() {}
    }
    stage.clear = () => {}
    stage.draw(ctx)
    assert.deepEqual(Array.from(stage.points, point => point.y), before)

    for (let i = 0; i < 600; i++) {
        stage.bouncy.advance(physicsWorld.fixedStepSeconds)
    }
    for (const point of stage.points) {
        assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y))
        assert.ok(point.x >= context.physics.box.left + point.radius - 1e-6)
        assert.ok(point.x <= context.physics.box.right - point.radius + 1e-6)
        assert.ok(point.y >= context.physics.box.top + point.radius - 1e-6)
        assert.ok(point.y <= context.physics.box.bottom - point.radius + 1e-6)
    }
})

test('ticker can be stopped without leaving its timer active', () => {
    clockNow = 100
    let steps = 0
    const reactor = new BodyHitReactor([], { beforeStep: () => steps++ })
    reactor.startTicker(10)
    assert.equal(tickerCallback !== undefined, true)
    clockNow += 10
    tickerCallback()
    assert.equal(steps, 1)
    const startedTicker = reactor.timer
    reactor.stopTicker()
    assert.equal(reactor.timer, undefined)
    assert.equal(clearedTicker, startedTicker)
})
