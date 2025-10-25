/*
---
title: Split
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
*/
class MainStage extends Stage {
    canvas='playspace'
    live = true

    mounted(){
        this.count = 80
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
        this.damping = 1  // Bounce damping (affects normal velocity)
        this.rollingFriction = 0.98  // Rolling resistance (affects tangential velocity)
        this.dragging.add(this.ball)

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

        // Create and draw ray projecting in direction of velocity
        // Adaptive ray length: shorter when moving slowly or close to the curve
        let velocityMag = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy)

        // Base ray length on velocity magnitude, with minimum and maximum bounds
        let baseRayLength = Math.max(this.ball.radius * 2, Math.min(100, velocityMag * 20))

        let rayStart = new Point(this.ball.x, this.ball.y)

        // Calculate ray direction from velocity (or default to downward if no velocity)
        let rayDirX, rayDirY

        if (velocityMag > 0.01) {
            // Ray points in direction of velocity
            rayDirX = this.ball.vx / velocityMag
            rayDirY = this.ball.vy / velocityMag
        } else {
            // Default to pointing downward if ball is stationary
            rayDirX = 0
            rayDirY = 1
        }

        let rayEnd = new Point(
            this.ball.x + rayDirX * baseRayLength,
            this.ball.y + rayDirY * baseRayLength
        )

        ctx.strokeStyle = 'red'
        ctx.lineWidth = 2
        // ctx.beginPath()
        // ctx.moveTo(rayStart.x, rayStart.y)
        // ctx.lineTo(rayEnd.x, rayEnd.y)
        // ctx.stroke()

        // Detect nearby normals along the ray path
        // First, find the closest normal point to use as the origin for sampling
        let closestNormal = null
        let minDist = Infinity

        normals.forEach(point => {
            let rayDx = rayEnd.x - rayStart.x
            let rayDy = rayEnd.y - rayStart.y
            let rayLengthSquared = rayDx * rayDx + rayDy * rayDy

            if (rayLengthSquared === 0) {
                let dist = Math.sqrt(
                    Math.pow(point.x - rayStart.x, 2) +
                    Math.pow(point.y - rayStart.y, 2)
                )
                if (dist < minDist) {
                    minDist = dist
                    closestNormal = point
                }
            } else {
                // Project point onto ray line
                let t = ((point.x - rayStart.x) * rayDx + (point.y - rayStart.y) * rayDy) / rayLengthSquared
                t = Math.max(0, Math.min(1, t))

                let closestX = rayStart.x + t * rayDx
                let closestY = rayStart.y + t * rayDy

                let distance = Math.sqrt(
                    Math.pow(point.x - closestX, 2) +
                    Math.pow(point.y - closestY, 2)
                )

                if (distance < minDist) {
                    minDist = distance
                    closestNormal = point
                }
            }
        })

        // Now find nearby normals evenly sampled around the closest normal
        let searchRadius = this.ball.radius
        let nearbyNormals = []
        let minNormals = 3

        if (closestNormal) {
            while (nearbyNormals.length < minNormals && searchRadius < 200) {
                nearbyNormals = normals.filter(point => {
                    // Distance from the closest normal point (our origin)
                    let distance = Math.sqrt(
                        Math.pow(point.x - closestNormal.x, 2) +
                        Math.pow(point.y - closestNormal.y, 2)
                    )
                    return distance <= searchRadius
                })

                if (nearbyNormals.length < minNormals) {
                    searchRadius *= 1.5
                }
            }
        }

        closestNormal.radius = clamp(closestNormal.radius,5 , closestNormal.radius)
        // Calculate average collision point from nearby normals
        let collisionPoint = null
        if (nearbyNormals.length > 0) {
            // Sort normals by their position along the curve (by x position for horizontal-ish curves)
            let sortedByPosition = nearbyNormals.slice().sort((a, b) => a.x - b.x)

            // Find which two sequential normals the ball is between
            let point1 = sortedByPosition[0]
            let point2 = sortedByPosition.length > 1 ? sortedByPosition[1] : sortedByPosition[0]

            // Find the pair of sequential points that bracket the ball's x position
            for (let i = 0; i < sortedByPosition.length - 1; i++) {
                if (this.ball.x >= sortedByPosition[i].x && this.ball.x <= sortedByPosition[i + 1].x) {
                    point1 = sortedByPosition[i]
                    point2 = sortedByPosition[i + 1]
                    break
                }
            }

            // Project ball position onto the line segment between point1 and point2
            let segmentDx = point2.x - point1.x
            let segmentDy = point2.y - point1.y
            let segmentLengthSquared = segmentDx * segmentDx + segmentDy * segmentDy

            let avgX, avgY, avgRadians

            if (segmentLengthSquared > 0) {
                // Calculate projection parameter t based on ball's position
                let t = ((this.ball.x - point1.x) * segmentDx + (this.ball.y - point1.y) * segmentDy) / segmentLengthSquared
                t = Math.max(0, Math.min(1, t)) // Clamp to [0, 1]

                // Calculate projected point on line segment
                avgX = point1.x + t * segmentDx
                avgY = point1.y + t * segmentDy

                // Interpolate the normal angle
                avgRadians = point1.radians + t * (point2.radians - point1.radians)
            } else {
                // Points are the same, use point1
                avgX = point1.x
                avgY = point1.y
                avgRadians = point1.radians
            }

            // Calculate impact strength from current velocity
            let impactStrength = Math.sqrt(
                Math.pow(this.ball.vx, 2) +
                Math.pow(this.ball.vy, 2)
            )

            collisionPoint = new Point({
                x: avgX,
                y: avgY,
                radians: avgRadians,
                radius: impactStrength * 5  // Set radius to reflect incoming impact
            })
        }

        // Check if ball is touching any nearby normals
        if (collisionPoint) {
            let distance = Math.sqrt(
                Math.pow(collisionPoint.x - this.ball.x, 2) +
                Math.pow(collisionPoint.y - this.ball.y, 2)
            )

            // If distance is less than or equal to ball radius, collision detected
            if (distance <= this.ball.radius) {
                // Use collision point's normal vector for reflection
                let normalX = Math.cos(collisionPoint.radians)
                let normalY = Math.sin(collisionPoint.radians)

                // Ensure ball is never below the normal - position it exactly at ball.radius distance
                this.ball.x = collisionPoint.x + normalX * this.ball.radius
                this.ball.y = collisionPoint.y + normalY * this.ball.radius

                // Separate velocity into normal and tangential components
                let normalVelocity = this.ball.vx * normalX + this.ball.vy * normalY
                let tangentX = -normalY  // Perpendicular to normal
                let tangentY = normalX
                let tangentVelocity = this.ball.vx * tangentX + this.ball.vy * tangentY

                // Apply damping to normal component (bounce)
                normalVelocity = -normalVelocity * this.damping

                // Apply rolling friction to tangential component (rolling resistance)
                tangentVelocity = tangentVelocity * this.rollingFriction

                // Reconstruct velocity from components
                this.ball.vx = normalVelocity * normalX + tangentVelocity * tangentX
                this.ball.vy = normalVelocity * normalY + tangentVelocity * tangentY - this.gravity - 0.1 // Small extra gravity to prevent sticking
            }
        }
        // Draw nearby normals in a different color to show detection
        if(this.drawCollisonPoints) {
            nearbyNormals.forEach(point => {
                ctx.fillStyle = '#00FFFFAA'
                ctx.beginPath()
                ctx.arc(point.x, point.y, 5, 0, Math.PI * 2)
                ctx.fill()
            })
        }


        // Draw collision point if it exists
        if (collisionPoint && this.showHitPoint) {
            ctx.fillStyle = 'red'
            // ctx.beginPath()
            // ctx.arc(collisionPoint.x, collisionPoint.y, 8, 0, Math.PI * 2)
            collisionPoint.pen.indicator(ctx)
            // ctx.fill()
        }

        // Draw ball
        this.ball.pen.circle(ctx, 2)

    }
}


;stage = MainStage.go();