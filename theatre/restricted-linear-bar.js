/*
---
title: Restricted Linear Bar (Pure Linkage Network)
categories:
    linkage
    constraints
    wheels
files:
    head
    point
    ../point_src/point-content.js
    pointlist
    mouse
    stage
    stroke
    dragging
    ../point_src/constrain-distance.js
---
*/

class WheelNode {
    constructor(opts = {}) {
        this.center = opts.center || new Point({ x: 200, y: 180, radius: 36, color: '#8855dd' })
        this.rimRadius = opts.rimRadius || this.center.radius
        this.motor = opts.motor || 0
        this.drivePoint = opts.drivePoint
        this.rim = new Point({ x: 0, y: 0, radius: 6, color: '#55ccaa' })

        this.syncRim()
    }

    syncRim() {
        this.rim.update(projectFrom(this.center, this.rimRadius, this.center.rotation))
    }

    step() {
        if (this.motor !== 0) {
            this.center.rotation += this.motor
        } else if (this.drivePoint) {
            this.center.lookAt(this.drivePoint)
        }

        this.syncRim()
    }

    draw(ctx) {
        this.center.pen.circle(ctx, { color: '#666666', width: 2, radius: this.rimRadius })
        this.center.pen.line(ctx, this.rim, '#666666', 2)
        this.center.pen.indicator(ctx)
        this.rim.pen.indicator(ctx)
    }
}


class LinkageUnit {
    constructor(opts = {}) {
        this.pointA = opts.pointA || new Point({ x: 200, y: 320, radius: 8, color: '#22aa66' })
        this.pointB = opts.pointB || new Point({ x: 320, y: 320, radius: 8, color: '#2277cc' })
        this.length = opts.length || this.pointA.distanceTo(this.pointB)

        this.pivot = opts.pivot
        this.pivotDistanceA = opts.pivotDistanceA
        this.trackA = opts.trackA
        this.trackB = opts.trackB

        this.activeHandle = undefined

        if (this.pivot && this.pivotDistanceA == undefined) {
            this.pivotDistanceA = this.pivot.distanceTo(this.pointA)
        }
    }

    hasPoint(point) {
        return point === this.pointA || point === this.pointB || point === this.pivot
    }

    setActiveHandle(point) {
        this.activeHandle = point
    }

    clearActiveHandle() {
        this.activeHandle = undefined
    }

    setTrackA(point) {
        this.trackA = point
    }

    setTrackB(point) {
        this.trackB = point
    }

    applyTracking() {
        if (this.trackA) {
            this.pointA.update(this.trackA)
        }
        if (this.trackB) {
            this.pointB.update(this.trackB)
        }
    }

    solve() {
        this.applyTracking()

        if (this.pivot && this.activeHandle !== this.pointA) {
            constraints.distance(this.pivot, this.pointA, this.pivotDistanceA)
        }

        if (this.activeHandle === this.pointA) {
            constraints.distance(this.pointA, this.pointB, this.length)
        } else if (this.activeHandle === this.pointB) {
            constraints.distance(this.pointB, this.pointA, this.length)
            if (this.pivot) {
                constraints.distance(this.pivot, this.pointA, this.pivotDistanceA)
            }
        } else {
            constraints.distance(this.pointA, this.pointB, this.length)
        }
    }

    draw(ctx, color = '#f2a21b') {
        this.pointA.pen.line(ctx, this.pointB, color, 4)
        this.pointA.pen.indicator(ctx)
        this.pointB.pen.indicator(ctx)

        if (this.pivot) {
            this.pivot.pen.indicator(ctx, '#ee7722')
        }
    }
}


class MainStage extends Stage {
    canvas = 'playspace'

    mounted() {
        this.setupNetwork()

        this.dragging.add(
            this.motorWheel.center,
            this.passiveWheel.center,
            this.pivotA,
            this.j1,
            this.j2,
            this.j3,
            this.linkWheelToChain.pointA,
            this.linkWheelToChain.pointB,
            this.linkChainAB.pointA,
            this.linkChainAB.pointB,
            this.linkChainBC.pointA,
            this.linkChainBC.pointB,
            this.linkChainToPassive.pointA,
            this.linkChainToPassive.pointB,
            this.linkPassiveToTail.pointA,
            this.linkPassiveToTail.pointB
        )

        this.dragging.onDragStart = this.onDragStart.bind(this)
        this.dragging.onDragEnd = this.onDragEnd.bind(this)
    }

    setupNetwork() {
        this.motorWheel = new WheelNode({
            center: new Point({ x: 170, y: 170, radius: 34, color: '#aa66dd' }),
            rimRadius: 34,
            motor: 1.8
        })

        this.passiveWheel = new WheelNode({
            center: new Point({ x: 610, y: 220, radius: 46, color: '#66aadd', rotation: 180 }),
            rimRadius: 46
        })

        this.pivotA = new Point({ x: 260, y: 360, radius: 10, color: '#ee7722' })
        this.j1 = new Point({ x: 300, y: 300, radius: 7, color: '#22aa66' })
        this.j2 = new Point({ x: 420, y: 320, radius: 7, color: '#22aa66' })
        this.j3 = new Point({ x: 520, y: 370, radius: 7, color: '#22aa66' })

        // A motor wheel drives the first linkage endpoint directly.
        this.linkWheelToChain = new LinkageUnit({
            pointA: this.motorWheel.rim,
            pointB: this.j1,
            length: 170,
            pivot: this.pivotA
        })

        // Direct linkage-to-linkage bars: A->B->C chain.
        this.linkChainAB = new LinkageUnit({ pointA: this.j1, pointB: this.j2, length: 150 })
        this.linkChainBC = new LinkageUnit({ pointA: this.j2, pointB: this.j3, length: 130 })

        // Chain output drives a passive wheel via its rim.
        this.linkChainToPassive = new LinkageUnit({
            pointA: this.j3,
            pointB: this.passiveWheel.rim,
            length: 150
        })

        // Passive wheel output feeds another linkage.
        this.linkPassiveToTail = new LinkageUnit({
            pointA: this.passiveWheel.rim,
            pointB: new Point({ x: 760, y: 390, radius: 7, color: '#22aa66' }),
            length: 150
        })

        this.linkages = [
            this.linkWheelToChain,
            this.linkChainAB,
            this.linkChainBC,
            this.linkChainToPassive,
            this.linkPassiveToTail
        ]

        this.passiveWheel.drivePoint = this.j3
    }

    onDragStart(ev, point) {
        this.linkages.forEach(link => {
            if (link.hasPoint(point)) {
                link.setActiveHandle(point)
            }
        })
    }

    onDragEnd() {
        this.linkages.forEach(link => link.clearActiveHandle())
    }

    solveNetwork(iterations = 7) {
        for (let i = 0; i < iterations; i += 1) {
            this.motorWheel.step()
            this.passiveWheel.step()

            this.linkages.forEach(link => link.solve())

            // Keep wheel centers tied to their own radius/rim relation.
            constraints.distance(this.motorWheel.center, this.motorWheel.rim, this.motorWheel.rimRadius)
            constraints.distance(this.passiveWheel.center, this.passiveWheel.rim, this.passiveWheel.rimRadius)
        }
    }

    draw(ctx) {
        this.clear(ctx)

        this.solveNetwork()

        this.motorWheel.draw(ctx)
        this.passiveWheel.draw(ctx)

        this.linkWheelToChain.draw(ctx, '#e08a1a')
        this.linkChainAB.draw(ctx, '#e08a1a')
        this.linkChainBC.draw(ctx, '#e08a1a')
        this.linkChainToPassive.draw(ctx, '#e08a1a')
        this.linkPassiveToTail.draw(ctx, '#e08a1a')
    }
}


stage = MainStage.go();
