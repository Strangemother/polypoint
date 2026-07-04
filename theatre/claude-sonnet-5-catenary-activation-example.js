/*
---
title: Catenary Activation Curve
categories:
    curve
    catenary
    activation
    neural-network
files:
    head
    stroke
    pointlist
    point
    mouse
    dragging
    stage
---

A visual companion to the "catenary as a neural-network activation function"
idea: two draggable points `A` and `B` define the endpoints of a hanging-chain
(catenary) curve. The curve is clamped flat outside `[x1, x2]` and blended
into those plateaus with a cubic Hermite ease, so the whole thing behaves
like a smooth, sag-tunable activation function rather than an open-ended arc.

Controls:
    drag       move point A or B (the curve's endpoints)
    scroll     (away from a point) adjust the chain length / sag amount
    scroll     (over a point) resizes that point's handle, ignore it

The catenary math (solveCatenary / catenaryOutput / catenaryDerivative) and
the Hermite tip-smoothing formulas are ported near-verbatim from the
`catenary.ts` activation-function experiment - see the session notes for the
closed-form derivation. Canvas y grows downward, so points are solved in a
y-flipped "math space" and flipped back for drawing - this makes the chain
sag *down* on screen like a real rope, rather than arching upward.
*/

/**
 * Solve the catenary y = a*cosh((x-p)/a) + q that passes exactly through
 * (x1,y1) and (x2,y2) with the given (slack) chain length, in "math space"
 * (y increases upward). Assumes x1 <= x2.
 */
function solveCatenary({ x1, y1, x2, y2, length }) {
    const MIN_DX = 1e-3
    let dx = x2 - x1
    if (dx < MIN_DX) {
        dx = MIN_DX
        x2 = x1 + dx
    }

    const dy = y2 - y1
    const straightLineDist = Math.hypot(dx, dy)
    const chainLength = Math.max(length, straightLineDist * 1.00001)
    const mSquared = Math.max(chainLength * chainLength - dy * dy, 1e-9)
    const ratio = Math.sqrt(mSquared) / dx

    // Solve sinh(u)/u = ratio for u > 0 via bisection.
    // sinh(u)/u is monotonically increasing from 1 (u->0) so for ratio > 1
    // there is exactly one root.
    let lo = 1e-6, hi = 40
    for (let i = 0; i < 80; i++) {
        const mid = (lo + hi) / 2
        const f = Math.sinh(mid) / mid
        if (f > ratio) { hi = mid } else { lo = mid }
    }
    const u = (lo + hi) / 2

    const a = dx / (2 * u)
    const p = (x1 + x2) / 2 - a * Math.asinh(dy / Math.sqrt(mSquared))
    const q = y1 - a * Math.cosh((x1 - p) / a)

    return { a, p, q, x1, y1, x2, y2, length: chainLength, straightLineDist }
}

function catenaryOutput(x, sol) {
    return sol.a * Math.cosh((x - sol.p) / sol.a) + sol.q
}

function catenaryDerivative(x, sol) {
    return Math.sinh((x - sol.p) / sol.a)
}

/** Cubic Hermite blend of value/slope over [a, b]. */
function hermite(x, a, b, va, ma, vb, mb) {
    const t = (x - a) / (b - a)
    const t2 = t * t, t3 = t2 * t
    const h00 = 2 * t3 - 3 * t2 + 1
    const h10 = t3 - 2 * t2 + t
    const h01 = -2 * t3 + 3 * t2
    const h11 = t3 - t2
    return h00 * va + h10 * (b - a) * ma + h01 * vb + h11 * (b - a) * mb
}

/**
 * Full activation curve in math space: flat plateau, Hermite ease, catenary
 * arc, Hermite ease, flat plateau.
 */
function evaluateActivation(x, sol, margin) {
    const { x1, y1, x2, y2 } = sol

    if (x < x1 - margin) return y1
    if (x < x1) {
        const der1 = catenaryDerivative(x1, sol)
        return hermite(x, x1 - margin, x1, y1, 0, y1, der1)
    }
    if (x <= x2) {
        return catenaryOutput(x, sol)
    }
    if (x <= x2 + margin) {
        const der2 = catenaryDerivative(x2, sol)
        return hermite(x, x2, x2 + margin, y2, der2, y2, 0)
    }
    return y2
}


class MainStage extends Stage {
    canvas = 'playspace'

    // Chain length = straightLineDistance * slackFactor. 1 == taut.
    slackFactor = 1.4
    minSlack = 1.02
    maxSlack = 4

    smoothing = 40   // px margin either side used to blend into the plateau
    flatRun = 90     // px of visible flat plateau beyond the smoothing margin

    mounted() {
        this.a = new Point({ x: 260, y: 180, radius: 9 })
        this.b = new Point({ x: 560, y: 300, radius: 9 })
        this.dragging.addPoints(this.a, this.b)

        // Only fires when the wheel happens away from a draggable point,
        // so it never fights with the built-in point-radius scroll resize.
        this.dragging.onWheelEmpty = this.onWheelEmpty.bind(this)
    }

    firstDraw(ctx) {
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
    }

    onWheelEmpty(ev) {
        const dir = ev.deltaY > 0 ? -1 : 1
        this.slackFactor = clamp(this.slackFactor + dir * 0.05, this.minSlack, this.maxSlack)
    }

    draw(ctx) {
        this.clear(ctx)

        const a = this.a, b = this.b
        const left = a.x <= b.x ? a : b
        const right = a.x <= b.x ? b : a

        const dx = right.x - left.x
        const straightLineDist = Math.hypot(dx, right.y - left.y)
        const chainLength = straightLineDist * this.slackFactor

        // Flip into math space (y-up) so the solved chain sags visually
        // *downward* on screen once it's flipped back for drawing.
        const sol = solveCatenary({
            x1: left.x, y1: -left.y,
            x2: right.x, y2: -right.y,
            length: chainLength
        })

        const m = this.smoothing
        const xMin = sol.x1 - m - this.flatRun
        const xMax = sol.x2 + m + this.flatRun

        this.strokeActivation(ctx, sol, xMin, sol.x1 - m, '#555', true)
        this.strokeActivation(ctx, sol, sol.x1 - m, sol.x1, '#e0a03c', true)
        this.strokeActivation(ctx, sol, sol.x1, sol.x2, '#4fd1c5', false)
        this.strokeActivation(ctx, sol, sol.x2, sol.x2 + m, '#e0a03c', true)
        this.strokeActivation(ctx, sol, sol.x2 + m, xMax, '#555', true)

        this.drawGuides(ctx, sol, m)

        left.pen.indicator(ctx, { color: '#ff5f7e' })
        right.pen.indicator(ctx, { color: '#5fa8ff' })

        this.drawHud(ctx, sol)
    }

    strokeActivation(ctx, sol, xa, xb, color, dashed, steps = 40) {
        if (xb <= xa) return
        ctx.save()
        ctx.setLineDash(dashed ? [6, 5] : [])
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.beginPath()
        for (let i = 0; i <= steps; i++) {
            const t = i / steps
            const x = xa + t * (xb - xa)
            const yCanvas = -evaluateActivation(x, sol, this.smoothing)
            if (i === 0) { ctx.moveTo(x, yCanvas) } else { ctx.lineTo(x, yCanvas) }
        }
        ctx.stroke()
        ctx.restore()
    }

    drawGuides(ctx, sol, margin) {
        ctx.save()
        ctx.setLineDash([2, 4])
        ctx.strokeStyle = '#444'
        ctx.lineWidth = 1
        const xs = [sol.x1 - margin, sol.x1, sol.x2, sol.x2 + margin]
        xs.forEach(x => {
            const y = -evaluateActivation(x, sol, margin)
            ctx.beginPath()
            ctx.moveTo(x, y - 14)
            ctx.lineTo(x, y + 14)
            ctx.stroke()
        })
        ctx.restore()
    }

    drawHud(ctx, sol) {
        ctx.fillStyle = '#EEE'
        ctx.font = '400 14px inter, sans-serif'
        const lines = [
            `chain length: ${sol.length.toFixed(1)}px  (straight-line: ${sol.straightLineDist.toFixed(1)}px)`,
            `slack factor: ${this.slackFactor.toFixed(2)}x  (scroll canvas to adjust)`,
            `smoothing margin: ${this.smoothing}px`,
            `drag the pink / blue points to reshape the curve`
        ]
        lines.forEach((line, i) => ctx.fillText(line, 16, 16 + i * 18))
    }
}

;stage = MainStage.go();
