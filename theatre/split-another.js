/*
---
title: Alternative Point Split
categories: split
    curve
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/extras.js
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/split.js
    ../point_src/screenwrap.js
    ../point_src/curve-extras.js

Collision uses the segments between consecutive curve samples. The segment
normal controls bounce direction; sample angles and radii are visual only.
*/

console.log('Role')

class MainStage extends Stage {
    canvas='playspace'
    live = true

    mounted(){
        this.count = 300
        let lpoints4 = [new Point(200, 300, 300, 90), new Point(800, 400, 200, 100)]
        this.curve2 = new BezierCurve(...lpoints4)
        this.dragging.add( ...lpoints4)

        // Ball setup
        this.ball = new Point({
            x: 400,
            y: 100,
            radius: 15,
            vx: 0,
            vy: 0
        })

        this.showNormals = false
        this.showHitPoint = false
        this.drawCollisonPoints = false
        // Physics constants
        this.gravity = 0.1
        this.damping = .86  // Bounce damping (affects normal velocity)
        this.rollingFriction = 0.98  // Rolling resistance (affects tangential velocity)
        this.dragging.add(this.ball)

    }

    findCollisionSegment(points) {
        let closest = null
        let minDistanceSquared = Infinity
        let ball = this.ball

        for (let i = 0; i < points.length - 1; i++) {
            let start = points[i]
            let end = points[i + 1]
            let dx = end.x - start.x
            let dy = end.y - start.y
            let lengthSquared = dx * dx + dy * dy
            if (lengthSquared === 0) { continue }

            let t = ((ball.x - start.x) * dx + (ball.y - start.y) * dy) / lengthSquared
            t = Math.max(0, Math.min(1, t))
            let x = start.x + t * dx
            let y = start.y + t * dy
            let offsetX = ball.x - x
            let offsetY = ball.y - y
            let distanceSquared = offsetX * offsetX + offsetY * offsetY
            if (distanceSquared >= minDistanceSquared) { continue }

            let length = Math.sqrt(lengthSquared)
            let normalX = -dy / length
            let normalY = dx / length
            let side = offsetX * normalX + offsetY * normalY
            let normalVelocity = ball.vx * normalX + ball.vy * normalY

            // At zero separation, use the side the ball is moving from.
            if (side < 0 || (side === 0 && normalVelocity > 0)) {
                normalX = -normalX
                normalY = -normalY
            }

            minDistanceSquared = distanceSquared
            closest = { start, end, x, y, normalX, normalY, distanceSquared }
        }

        return closest
    }

    resolveCollision(contact) {
        let ball = this.ball
        if (!contact || contact.distanceSquared > ball.radius * ball.radius) { return }

        let { x, y, normalX, normalY } = contact
        let separation = (ball.x - x) * normalX + (ball.y - y) * normalY
        let correction = ball.radius - separation
        ball.x += normalX * correction
        ball.y += normalY * correction

        let normalVelocity = ball.vx * normalX + ball.vy * normalY
        if (normalVelocity >= 0) { return }

        let tangentX = -normalY
        let tangentY = normalX
        let tangentVelocity = (ball.vx * tangentX + ball.vy * tangentY) * this.rollingFriction
        normalVelocity = -normalVelocity * this.damping

        ball.vx = normalVelocity * normalX + tangentVelocity * tangentX
        ball.vy = normalVelocity * normalY + tangentVelocity * tangentY
    }

    draw(ctx){
        this.clear(ctx)

        // Apply gravity to ball
        this.ball.vy += this.gravity
        this.ball.x += this.ball.vx
        this.ball.y += this.ball.vy

        this.curve2.render(ctx, {color: '#777'})
        let normals = this.curve2.split(this.count,  0)
        this.screenWrap.perform(this.ball)

        normals.each.radius = 10
        if(this.showNormals) {
            normals.pen.lines(ctx, 'green', 2)
        }

        let contact = this.findCollisionSegment(normals)
        this.resolveCollision(contact)

        // Draw nearby normals in a different color to show detection
        if(contact && this.drawCollisonPoints) {
            [contact.start, contact.end].forEach(point => {
                ctx.fillStyle = '#00FFFFAA'
                ctx.beginPath()
                ctx.arc(point.x, point.y, 5, 0, Math.PI * 2)
                ctx.fill()
            })
        }


        // Draw collision point if it exists
        if (contact && this.showHitPoint) {
            let collisionPoint = new Point({
                x: contact.x,
                y: contact.y,
                radians: Math.atan2(contact.normalY, contact.normalX),
                radius: Math.hypot(this.ball.vx, this.ball.vy) * 5
            })
            collisionPoint.pen.indicator(ctx)
        }

        // Draw ball
        this.ball.pen.circle(ctx, 2)

    }
}


;stage = MainStage.go();