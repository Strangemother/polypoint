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
const { clusterStable, clusterStyleB, gravitateSquareDistance, clusterDucks, limitSpeed, limitSpeedCardinal } = context

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

for (const func of [clusterStable, clusterStyleB, gravitateSquareDistance, clusterDucks]) {
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


function duckStep(points, options={}, target={x: 0, y: 10000}) {
    simpleCluster(points, target, {
        func: clusterDucks, repulsionStrength: 0, damping: 1,
        minVelocity: 0, maxVelocity: 1000, ...options
    })
}

function duckAttraction(dx, dy, strength=0.001) {
    const distance = Math.hypot(dx, dy) * .0004
    return strength * .01 + distance * distance * .03
}

// The default duckStep target is far along +y, so "closer to the target" means larger y.

test('ducks follow the nearest duck that is closer to the target', () => {
    const point = makePoint()
    // (5, -5) is nearest but farther from the target, so it is not followed.
    duckStep([point, makePoint(5, -5), makePoint(0, 100), makePoint(10, 20)])
    const at = duckAttraction(10, 20)
    near(point.vx, at * 10)
    near(point.vy, at * 20)
})

test('ducks average the requested nearest eligible points', () => {
    for (const count of [2, 3, 10]) {
        const point = makePoint()
        const neighbors = [makePoint(0, 30), makePoint(10, 5), makePoint(0, 20), makePoint(1, -2)]
        duckStep([point, ...neighbors], {followNearestCount: count})
        const dx = count === 2 ? 5 : 10 / 3
        const dy = count === 2 ? 12.5 : 55 / 3
        const at = duckAttraction(dx, dy)
        near(point.vx, at * dx)
        near(point.vy, at * dy)
    }
})

test('a duck never follows a duck that follows it', () => {
    const behind = makePoint(0, 0)
    const ahead = makePoint(0, 10)
    duckStep([behind, ahead], {}, {x: 0, y: 100})
    // behind follows ahead; ahead leads toward the target instead of back to behind.
    near(behind.vy, duckAttraction(0, 10) * 10)
    near(ahead.vy, duckAttraction(0, 90) * 90)
    assert.ok(ahead.vy > 0)
})

test('ducks equally distant from the target both follow the target', () => {
    const left = makePoint(-10, 0)
    const right = makePoint(10, 0)
    duckStep([left, right], {}, {x: 0, y: 100})
    const at = duckAttraction(10, 100)
    near(left.vx, at * 10)
    near(right.vx, at * -10)
    near(left.vy, at * 100)
    near(right.vy, at * 100)
})

test('the duck nearest the target leads even with close neighbors', () => {
    const leader = makePoint(0, 9000)
    const follower = makePoint(0, 8990)
    duckStep([follower, leader])
    near(leader.vy, duckAttraction(0, 1000) * 1000)
    near(follower.vy, duckAttraction(0, 10) * 10)
})

test('ducks respect per-point following, attraction, damping and speed limits', () => {
    const point = Object.assign(makePoint(), {
        followNearestCount: 2, attractionStrength: 0, damping: 0.5,
        minVelocity: 0, maxVelocity: 1000
    })
    const neighbors = [makePoint(10, 5), makePoint(0, 20), makePoint(500, 500)]
    duckStep([point, ...neighbors], {
        followNearestCount: 1, attractionStrength: 100,
        damping: 0, minVelocity: 100, maxVelocity: 0
    })
    const at = duckAttraction(5, 12.5, 0)
    near(point.vx, at * 5 * 0.5)
    near(point.vy, at * 12.5 * 0.5)

    const fast = Object.assign(makePoint(0, 0, 20, 30), {maxVelocity: 2})
    duckStep([fast, makePoint(10, 20)])
    near(Math.hypot(fast.vx, fast.vy), 2)

    const slow = Object.assign(makePoint(), {minVelocity: 1})
    duckStep([slow, makePoint(10, 20)])
    assert.equal(slow.vx, 0)
    assert.equal(slow.vy, 0)
})

test('ducks retain repulsion from all close points, including ones they do not follow', () => {
    for (const minDistance of [5, 15, 25]) {
        const point = Object.assign(makePoint(), {minDistance, repulsionStrength: 100})
        duckStep([point, makePoint(10, 0), makePoint(0, 20)], {
            minDistance: 0, repulsionStrength: 0
        })
        near(point.vx, minDistance >= 10 ? -1 : 0)
        near(point.vy, duckAttraction(0, 20) * 20 - (minDistance >= 20 ? 0.25 : 0))
    }
})

test('a lone duck uses the target with the same forces as square-distance clustering', () => {
    const duck = Object.assign(makePoint(20, 30, -1, 2), {
        attractionStrength: 0.08, damping: 0.95, maxVelocity: 3
    })
    const original = {...duck}
    const target = {x: 400, y: -500}
    simpleCluster([duck], target, {func: clusterDucks})
    simpleCluster([original], target, {func: gravitateSquareDistance})
    near(duck.x, original.x)
    near(duck.y, original.y)
    near(duck.vx, original.vx)
    near(duck.vy, original.vy)
})

test('ducks without a target lead toward the canvas center', () => {
    context.canvas = {width: 200, height: 100}
    try {
        const duck = makePoint(0, 0)
        const original = makePoint(0, 0)
        simpleCluster([duck], undefined, {func: clusterDucks})
        simpleCluster([original], undefined, {func: gravitateSquareDistance})
        near(duck.vx, original.vx)
        near(duck.vy, original.vy)
    } finally {
        delete context.canvas
    }
})

test('a scattered flock gathers near the target', () => {
    const target = {x: 1000, y: 800}
    const points = []
    for (let i = 0; i < 25; i++) {
        points.push(makePoint((i % 5) * 60, Math.floor(i / 5) * 60))
    }
    const centroidDistance = () => {
        const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length
        const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length
        return Math.hypot(target.x - cx, target.y - cy)
    }
    let previous = centroidDistance()
    const start = previous
    for (let block = 0; block < 6; block++) {
        for (let frame = 0; frame < 500; frame++) {
            simpleCluster(points, target, {func: clusterDucks, followNearestCount: 2, maxVelocity: 2})
        }
        const current = centroidDistance()
        assert.ok(current < previous, `flock stalled at ${current}`)
        previous = current
    }
    assert.ok(previous < start * 0.5)
    const leaderDistance = Math.min(...points.map(p => Math.hypot(target.x - p.x, target.y - p.y)))
    assert.ok(leaderDistance < 100)
})

test('duck movement uses positions from the start of the step', () => {
    const points = [makePoint(0, 0, 20, 10), makePoint(10, 20), makePoint(-30, 40)]
    const reversed = points.map(point => ({...point})).reverse()
    duckStep(points, {repulsionStrength: 20, followNearestCount: 2})
    duckStep(reversed, {repulsionStrength: 20, followNearestCount: 2})
    reversed.reverse()
    for (let i = 0; i < points.length; i++) {
        near(points[i].x, reversed[i].x)
        near(points[i].y, reversed[i].y)
    }
})

test('empty and coincident duck groups remain finite', () => {
    simpleCluster([], undefined, {func: clusterDucks})
    const points = [makePoint(), makePoint(), makePoint(10, 0)]
    for (let frame = 0; frame < 100; frame++) {
        duckStep(points, {repulsionStrength: 80, followNearestCount: 2, maxVelocity: 2})
        for (const point of points) {
            assert.ok([point.x, point.y, point.vx, point.vy].every(Number.isFinite))
            assert.ok(Math.hypot(point.vx, point.vy) <= 2 + 1e-10)
        }
    }
})

test('ducks reject invalid follow counts before mutating points', () => {
    for (const count of [0, -1, 1.5, NaN, Infinity]) {
        const first = makePoint(0, 0, 1, 2)
        const second = Object.assign(makePoint(10, 20), {followNearestCount: count})
        assert.throws(() => duckStep([first, second]), /followNearestCount must be a positive integer/)
        assert.equal(first.x, 0)
        assert.equal(first.vx, 1)
    }
})
