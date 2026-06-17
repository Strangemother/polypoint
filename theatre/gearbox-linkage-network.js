/*
---
title: Linkage Bar Hierarchy
categories:
    linkage
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

class LinkageBar {
    constructor(opts = {}) {
        this.pointA = opts.pointA || new Point({ x: 260, y: 260, radius: 10, color: '#22aa66' })
        this.pointB = opts.pointB || new Point({ x: 480, y: 320, radius: 10, color: '#2277cc' })
        this.length = opts.length || this.pointA.distanceTo(this.pointB)
        this.driveSide = opts.driveSide || 'pointA'
        this.activeHandle = undefined
    }

    getHandles() {
        return [this.pointA, this.pointB]
    }

    hasPoint(point) {
        return this.getHandles().includes(point)
    }

    setActiveHandle(point) {
        this.activeHandle = point
    }

    clearActiveHandle() {
        this.activeHandle = undefined
    }

    setDriveSide(side) {
        this.driveSide = side
    }

    getSolveSide() {
        if (this.activeHandle === this.pointA) {
            return 'pointA'
        }

        if (this.activeHandle === this.pointB) {
            return 'pointB'
        }

        return this.driveSide
    }

    step() {
        const side = this.getSolveSide()

        if (side === 'pointA') {
            constraints.distance(this.pointA, this.pointB, this.length)
        } else if (side === 'pointB') {
            constraints.distance(this.pointB, this.pointA, this.length)
        } else {
            constraints.distance(this.pointA, this.pointB, this.length)
        }
    }

    draw(ctx) {
        this.pointA.pen.line(ctx, this.pointB, '#f2a21b', 4)
        this.pointA.pen.indicator(ctx)
        this.pointB.pen.indicator(ctx)
    }
}

class PivotLinkageBar extends LinkageBar {
    constructor(opts = {}) {
        const pivot = opts.pivot || new Point({
            x: 300,
            y: 420,
            radius: 12,
            color: '#ee7722',
            rotation: opts.rotation || 0
        })

        const length = opts.length || 220
        const slideOffset = opts.slideOffset || 0
        const axis = {
            x: Math.cos(pivot.radians),
            y: Math.sin(pivot.radians)
        }
        const center = {
            x: pivot.x + (axis.x * slideOffset),
            y: pivot.y + (axis.y * slideOffset)
        }

        const pointA = opts.pointA || new Point({
            x: center.x - (axis.x * length * 0.5),
            y: center.y - (axis.y * length * 0.5),
            radius: 10,
            color: '#22aa66'
        })

        const pointB = opts.pointB || new Point({
            x: center.x + (axis.x * length * 0.5),
            y: center.y + (axis.y * length * 0.5),
            radius: 10,
            color: '#2277cc'
        })

        super({ pointA, pointB, length })

        this.pivot = pivot
        this.axisAngle = opts.axisAngle == undefined ? pivot.radians : opts.axisAngle
        this.slideOffset = slideOffset
        this.syncLimits()
        this.slideOffset = this.clampSlide(this.slideOffset)
        this.sync()
    }

    hasPoint(point) {
        return super.hasPoint(point) || point === this.pivot
    }

    getHandles() {
        return [this.pointA, this.pointB, this.pivot]
    }

    axis() {
        return {
            x: Math.cos(this.axisAngle),
            y: Math.sin(this.axisAngle)
        }
    }

    setAxisFromPointA() {
        this.axisAngle = Math.atan2(
            this.pivot.y - this.pointA.y,
            this.pivot.x - this.pointA.x
        )
    }

    setAxisFromPointB() {
        this.axisAngle = Math.atan2(
            this.pointB.y - this.pivot.y,
            this.pointB.x - this.pivot.x
        )
    }

    scalarFrom(point) {
        const axis = this.axis()
        const dx = point.x - this.pivot.x
        const dy = point.y - this.pivot.y
        return (dx * axis.x) + (dy * axis.y)
    }

    syncLimits() {
        const guard = this.pivot.radius
        this.minSlide = -this.length * 0.5 + guard
        this.maxSlide = this.length * 0.5 - guard

        if (this.minSlide > this.maxSlide) {
            this.minSlide = 0
            this.maxSlide = 0
        }
    }

    clampSlide(value) {
        return Math.max(this.minSlide, Math.min(this.maxSlide, value))
    }

    setSlideFromPointA() {
        this.slideOffset = this.clampSlide(this.scalarFrom(this.pointA) + (this.length * 0.5))
    }

    setSlideFromPointB() {
        this.slideOffset = this.clampSlide(this.scalarFrom(this.pointB) - (this.length * 0.5))
    }

    sync() {
        this.pivot.radians = this.axisAngle
        const axis = this.axis()
        const center = {
            x: this.pivot.x + (axis.x * this.slideOffset),
            y: this.pivot.y + (axis.y * this.slideOffset)
        }

        this.pointA.update({
            x: center.x - (axis.x * this.length * 0.5),
            y: center.y - (axis.y * this.length * 0.5)
        })

        this.pointB.update({
            x: center.x + (axis.x * this.length * 0.5),
            y: center.y + (axis.y * this.length * 0.5)
        })
    }

    step() {
        this.syncLimits()
        const side = this.getSolveSide()

        if (side === 'pointA') {
            this.setAxisFromPointA()
            this.setSlideFromPointA()
        } else if (side === 'pointB') {
            this.setAxisFromPointB()
            this.setSlideFromPointB()
        }

        this.sync()
    }

    draw(ctx) {
        super.draw(ctx)
        this.pivot.pen.indicator(ctx, '#ee7722')
    }
}

class LockedLinkageBar extends PivotLinkageBar {
    axis() {
        return {
            x: Math.cos(this.pivot.radians),
            y: Math.sin(this.pivot.radians)
        }
    }

    step() {
        this.axisAngle = this.pivot.radians
        this.syncLimits()
        const side = this.getSolveSide()

        if (side === 'pointA') {
            this.setSlideFromPointA()
        } else if (side === 'pointB') {
            this.setSlideFromPointB()
        }

        this.sync()
    }
}

class PassiveWheelPoint {
    constructor(opts = {}) {
        this.center = opts.center || new Point({
            x: 600,
            y: 320,
            radius: 44,
            color: '#6688dd',
            rotation: opts.rotation || 0
        })

        this.offsetRadius = opts.offsetRadius == undefined ? this.center.radius * 0.7 : opts.offsetRadius
        this.offsetAngle = opts.offsetAngle || 0
        this.offsetRadians = degToRad(this.offsetAngle)
        this.motorSpeed = opts.motorSpeed || 0
        this.point = opts.point || new Point({ x: 0, y: 0, radius: 9, color: '#6688dd' })
        this.activeHandle = undefined
        this.syncPointFromWheel()
    }

    getHandles() {
        return [this.center, this.point]
    }

    hasPoint(point) {
        return this.getHandles().includes(point)
    }

    setActiveHandle(point) {
        this.activeHandle = point
    }

    clearActiveHandle() {
        this.activeHandle = undefined
    }

    setMotorSpeed(speed = 0) {
        this.motorSpeed = speed
    }

    disableMotor() {
        this.motorSpeed = 0
    }

    syncPointFromWheel() {
        this.point.update(projectFrom(this.center, this.offsetRadius, this.center.rotation + this.offsetAngle))
    }

    syncWheelFromPoint() {
        this.center.radians = this.center.directionTo(this.point) - this.offsetRadians
        this.syncPointFromWheel()
    }

    step(mode = 'auto') {
        // Center drag moves position, but should not pause motor rotation.
        if (this.activeHandle === this.center) {
            if (mode !== 'react' && this.motorSpeed !== 0) {
                this.center.rotation += this.motorSpeed
            }
            this.syncPointFromWheel()
            return
        }

        if (this.activeHandle === this.point) {
            this.syncWheelFromPoint()
            return
        }

        if (mode === 'react') {
            // React phase: always accept linkage-constrained point and back-drive wheel.
            this.syncWheelFromPoint()
            return
        }

        // Active mode: wheel drives linkage by advancing rotation.
        if (this.motorSpeed !== 0) {
            this.center.rotation += this.motorSpeed
            this.syncPointFromWheel()
            return
        }

        // Passive mode: linkage drives wheel through shared point.
        this.syncWheelFromPoint()
    }

    draw(ctx) {
        this.center.pen.circle(ctx, { color: '#666666', width: 2, radius: this.center.radius })
        this.center.pen.line(ctx, this.point, '#666666', 2)
        this.center.pen.indicator(ctx)
        this.point.pen.indicator(ctx)
    }
}

class MainStage extends Stage {
    canvas = 'playspace'

    mounted() {
        this.pivotLinkage = new PivotLinkageBar({
            pivot: new Point({ x: 250, y: 320, radius: 14, color: '#ee7722', rotation: 0 }),
            length: 240,
            slideOffset: -20,
            pointA: new Point({ x: 120, y: 320, radius: 10, color: '#22aa66' })
        })

        this.wheel = new PassiveWheelPoint({
            center: new Point({ x: 560, y: 320, radius: 54, color: '#6688dd', rotation: 45 }),
            offsetRadius: 34,
            offsetAngle: 35,
            motorSpeed: 0
        })

        this.pivotLinkage.pointB = this.wheel.point
        this.pivotLinkage.setDriveSide('pointB')
        this.pivotLinkage.syncLimits()
        this.pivotLinkage.setSlideFromPointB()
        this.pivotLinkage.sync()

        this.dragging.add(
            this.wheel.center,
            this.wheel.point,
            this.pivotLinkage.pivot,
            this.pivotLinkage.pointA,
            this.pivotLinkage.pointB
        )

        this.dragging.onDragStart = this.onDragStart.bind(this)
        this.dragging.onDragEnd = this.onDragEnd.bind(this)
    }

    onDragStart(ev, point) {
        if (this.pivotLinkage.hasPoint(point)) {
            this.pivotLinkage.setActiveHandle(point)
        }

        if (this.wheel.hasPoint(point)) {
            this.wheel.setActiveHandle(point)
        }
    }

    onDragEnd() {
        this.pivotLinkage.clearActiveHandle()
        this.wheel.clearActiveHandle()
    }

    solve(iterations = 6) {
        for (let i = 0; i < iterations; i += 1) {
            // Drive pass applies user or motor intent.
            this.wheel.step('drive')
            this.pivotLinkage.step()
            // React pass accepts enforced linkage result and stalls/back-drives motor.
            this.wheel.step('react')
        }

        // Final settle pass ensures rendered geometry reflects solved state,
        // not an intermediate drag sample.
        this.pivotLinkage.step()
        this.wheel.step('react')
    }

    draw(ctx) {
        this.clear(ctx)
        // this.wheel.rotation += .5
        // this.wheel.syncWheelFromPoint()
        this.solve()
        this.wheel.draw(ctx)
        this.pivotLinkage.draw(ctx)
    }
}

stage = MainStage.go();
