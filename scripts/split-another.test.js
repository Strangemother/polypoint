import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

const context = vm.createContext({
    Stage: class { static go() {} },
    console: { log() {} }
})
vm.runInContext(
    readFileSync(new URL('../theatre/split-another.js', import.meta.url), 'utf8'),
    context
)
const MainStage = vm.runInContext('MainStage', context)

function setup(ball) {
    const stage = new MainStage()
    stage.ball = { radius: 2, vx: 0, vy: 0, ...ball }
    stage.damping = 0.86
    stage.rollingFriction = 0.8
    return stage
}

function near(actual, expected) {
    assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`)
}

test('horizontal segments bounce vertically, independent of sample angles and radii', () => {
    for (const y of [-1, 1]) {
        for (const reverse of [false, true]) {
            const stage = setup({ x: 5, y, vx: 3, vy: -y * 4 })
            const points = [
                { x: 0, y: 0, radians: 0, radius: 100 },
                { x: 10, y: 0, radians: Math.PI, radius: 100 }
            ]
            if (reverse) { points.reverse() }
            const contact = stage.findCollisionSegment(points)
            near(contact.x, 5)
            near(contact.y, 0)
            near(contact.normalX, 0)
            near(contact.normalY, y)
            stage.resolveCollision(contact)
            near(stage.ball.x, 5)
            near(stage.ball.y, y * 2)
            near(stage.ball.vx, 2.4)
            near(stage.ball.vy, y * 3.44)
        }
    }
})

test('vertical segments bounce horizontally', () => {
    const stage = setup({ x: -1, y: 5, vx: 4, vy: 3 })
    stage.resolveCollision(stage.findCollisionSegment([{ x: 0, y: 0 }, { x: 0, y: 10 }]))
    near(stage.ball.x, -2)
    near(stage.ball.y, 5)
    near(stage.ball.vx, -3.44)
    near(stage.ball.vy, 2.4)
})

test('sloping segments reflect normal velocity and damp tangent velocity', () => {
    const stage = setup({ x: 5, y: 4, vx: 0, vy: 4 })
    const contact = stage.findCollisionSegment([{ x: 0, y: 0 }, { x: 10, y: 10 }])
    near(contact.x, 4.5)
    near(contact.y, 4.5)
    near(contact.normalX, Math.SQRT1_2)
    near(contact.normalY, -Math.SQRT1_2)
    stage.resolveCollision(contact)
    near(stage.ball.vx, 3.32)
    near(stage.ball.vy, -0.12)
    near(Math.hypot(stage.ball.x - contact.x, stage.ball.y - contact.y), 2)
})

test('folded curves keep sample order and choose the nearest actual segment', () => {
    const stage = setup({ x: 5, y: 9, vy: 4 })
    const points = [{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }]
    const contact = stage.findCollisionSegment(points)
    assert.equal(contact.start, points[1])
    assert.equal(contact.end, points[2])
    near(contact.x, 5)
    near(contact.y, 10)
    stage.resolveCollision(contact)
    near(stage.ball.y, 8)
    near(stage.ball.vy, -3.44)
})

test('moving away or tangentially does not cause another bounce or friction', () => {
    for (const vy of [-4, 0]) {
        const stage = setup({ x: 5, y: -1, vx: 3, vy })
        stage.resolveCollision(stage.findCollisionSegment([{ x: 0, y: 0 }, { x: 10, y: 0 }]))
        near(stage.ball.y, -2)
        near(stage.ball.vx, 3)
        near(stage.ball.vy, vy)
    }
})

test('exactly on the segment chooses the incoming side without an angle fallback', () => {
    const stage = setup({ x: 5, y: 0, vy: 4 })
    stage.resolveCollision(stage.findCollisionSegment([{ x: 0, y: 0 }, { x: 10, y: 0 }]))
    near(stage.ball.y, -2)
    near(stage.ball.vy, -3.44)
})

test('collisions at sample vertices use the segment normal, not a point normal', () => {
    const stage = setup({ x: 5, y: -1, vx: 3, vy: 4 })
    const contact = stage.findCollisionSegment([{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 10, y: 0 }])
    stage.resolveCollision(contact)
    near(stage.ball.x, 5)
    near(stage.ball.y, -2)
    near(stage.ball.vx, 2.4)
    near(stage.ball.vy, -3.44)
})

test('projection clamps to finite endpoints without snapping tangential position', () => {
    const stage = setup({ x: -1, y: -1, vy: 4 })
    const contact = stage.findCollisionSegment([{ x: 0, y: 0 }, { x: 10, y: 0 }])
    near(contact.x, 0)
    stage.resolveCollision(contact)
    near(stage.ball.x, -1)
    near(stage.ball.y, -2)

    stage.ball = { x: -3, y: -1, radius: 2, vx: 0, vy: 4 }
    const before = { ...stage.ball }
    stage.resolveCollision(stage.findCollisionSegment([{ x: 0, y: 0 }, { x: 10, y: 0 }]))
    assert.deepEqual(stage.ball, before)
})

test('empty, single-point and repeated-point samples cannot hang or produce NaN', () => {
    const stage = setup({ x: 5, y: -1, vy: 4 })
    for (const points of [[], [{ x: 0, y: 0 }], [{ x: 0, y: 0 }, { x: 0, y: 0 }]]) {
        const before = { ...stage.ball }
        const contact = stage.findCollisionSegment(points)
        assert.equal(contact, null)
        stage.resolveCollision(contact)
        assert.deepEqual(stage.ball, before)
    }
    const contact = stage.findCollisionSegment([{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 0 }])
    near(contact.x, 5)
    near(contact.normalY, -1)
})

test('draw integrates gravity, samples the curve and resolves collision once', () => {
    class Point {
        constructor(values) { Object.assign(this, values) }
        pen = { circle() {}, indicator() {} }
    }
    context.Point = Point
    const stage = setup({ x: 5, y: -2, vy: 0.5 })
    stage.ball = new Point(stage.ball)
    stage.gravity = 0.1
    stage.count = 3
    stage.clear = () => {}
    stage.screenWrap = { perform() {} }
    const points = [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 10, y: 0 }]
    points.each = {}
    points.pen = { lines() {} }
    stage.curve2 = {
        render() {},
        split(count, angle) {
            assert.equal(count, 3)
            assert.equal(angle, 0)
            return points
        }
    }
    stage.showNormals = true
    stage.showHitPoint = true
    stage.drawCollisonPoints = true
    stage.draw({ beginPath() {}, arc() {}, fill() {} })
    near(stage.ball.x, 5)
    near(stage.ball.y, -2)
    near(stage.ball.vy, -0.516)
})
