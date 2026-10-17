import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

const context = vm.createContext({})
vm.runInContext(
    readFileSync(new URL('../point_src/cluster.js', import.meta.url), 'utf8'),
    context
)
const simpleCluster = vm.runInContext('simpleCluster', context)
const { clusterStable, clusterStyleB, gravitateSquareDistance, limitSpeed, limitSpeedCardinal } = context

function near(actual, expected) {
    assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`)
}

function makePoint(x=0, y=0, vx=0, vy=0) {
    return {
        x, y, vx, vy,
        distanceTo(other) {
            return Math.hypot(other.x - this.x, other.y - this.y)
        }
    }
}

for (const func of [clusterStable, clusterStyleB, gravitateSquareDistance]) {
    test(`${func.name} caps speed without reversing either axis`, () => {
        for (const direction of [-1, 1]) {
            const point = makePoint(0, 0, direction * 20, direction * 30)
            simpleCluster([point], { x: 0, y: 0 }, {
                func, attractionStrength: 0, damping: 1
            })
            const scale = 9 / Math.hypot(20, 30)
            near(point.vx, direction * 20 * scale)
            near(point.vy, direction * 30 * scale)
            assert.equal(point.x, point.vx)
            assert.equal(point.y, point.vy)
        }
    })

    test(`${func.name} stops small velocities on both axes`, () => {
        const point = makePoint(0, 0, 0.005, -0.005)
        simpleCluster([point], { x: 0, y: 0 }, { func })
        assert.equal(point.vx, 0)
        assert.equal(point.vy, 0)
        assert.equal(point.x, 0)
        assert.equal(point.y, 0)
    })

    test(`${func.name} preserves damping below the speed limit`, () => {
        const point = makePoint(0, 0, -4, 6)
        simpleCluster([point], { x: 0, y: 0 }, {
            func, damping: 0.5, attractionStrength: 0
        })
        assert.equal(point.vx, -2)
        assert.equal(point.vy, 3)
        assert.equal(point.x, -2)
        assert.equal(point.y, 3)
    })
}

test('speed limiting preserves headings in every quadrant and near either axis', () => {
    for (const [vx, vy] of [[20, 30], [3, 4], [30, 0.005], [0.005, 30]]) {
        for (const sx of [-1, 1]) {
            for (const sy of [-1, 1]) {
                const point = makePoint(0, 0, sx * vx, sy * vy)
                const angle = Math.atan2(point.vy, point.vx)
                assert.equal(limitSpeed(0.1, 2, point), point)
                near(Math.hypot(point.vx, point.vy), 2)
                near(Math.atan2(point.vy, point.vx), angle)
            }
        }
    }
})

test('minimum velocity applies to total speed, not individual components', () => {
    const diagonal = makePoint(0, 0, 0.08, -0.08)
    limitSpeed(0.1, 2, diagonal)
    assert.equal(diagonal.vx, 0.08)
    assert.equal(diagonal.vy, -0.08)

    const stopped = makePoint()
    limitSpeed(0, 2, stopped)
    assert.equal(stopped.vx, 0)
    assert.equal(stopped.vy, 0)
})

test('cardinal speed limiting caps and stops each axis independently', () => {
    for (const sx of [-1, 1]) {
        for (const sy of [-1, 1]) {
            const fast = makePoint(0, 0, sx * 20, sy * 30)
            assert.equal(limitSpeedCardinal(0.1, 2, fast), fast)
            assert.equal(fast.vx, sx * 2)
            assert.equal(fast.vy, sy * 2)

            const mixed = makePoint(0, 0, sx * 30, sy * 0.05)
            limitSpeedCardinal(0.1, 2, mixed)
            assert.equal(mixed.vx, sx * 2)
            assert.equal(mixed.vy, 0)
        }
    }

    const within = makePoint(0, 0, -1.5, 0.5)
    limitSpeedCardinal(0.1, 2, within)
    assert.equal(within.vx, -1.5)
    assert.equal(within.vy, 0.5)
})

test('square-distance attraction preserves target heading with per-point limits', () => {
    for (const maxVelocity of [1, 1.5, 2]) {
        const point = Object.assign(makePoint(), {
            minVelocity: 0.2, maxVelocity, damping: 0.98, attractionStrength: 0.05
        })
        const target = { x: -2000, y: 1000 }
        simpleCluster([point], target, { func: gravitateSquareDistance, maxVelocity: 9 })
        near(Math.hypot(point.vx, point.vy), maxVelocity)
        near(Math.atan2(point.vy, point.vx), Math.atan2(target.y, target.x))
    }
})

test('square-distance attraction follows a moved target symmetrically', () => {
    const left = makePoint()
    const right = makePoint()
    for (const targetX of [2000, -2000, 2000]) {
        for (let frame = 0; frame < 120; frame++) {
            simpleCluster([left], { x: -targetX, y: 0 }, { func: gravitateSquareDistance })
            simpleCluster([right], { x: targetX, y: 0 }, { func: gravitateSquareDistance })
            assert.equal(left.x + right.x, 0)
            assert.equal(left.vx + right.vx, 0)
            assert.ok(Math.abs(left.vx) <= 9)
            assert.equal(left.y, 0)
            assert.equal(right.y, 0)
        }
    }
})
