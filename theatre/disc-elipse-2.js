/*
title: Ellipse Disc Projection V2
categories: curve
src_dir: ../point_src/
files:
    head
    pointlist
    point
    ../point_src/math.js
    ../point_src/point-content.js
    mouse
    stage
    ../point_src/stage-clock.js
    ../point_src/extras.js
    ../point_src/random.js
    dragging
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/curve-extras.js
    xybind
---

*/
class MainStage extends Stage {
    canvas = 'playspace'
    live = true

    mounted() {
        this.angleX = 0
        this.angleY = 0
        this.angleZ = 0
        this.radius = 100
        this.point = this.center.copy().update({radius: this.radius})
        this.dragging.add(this.point)
    }

    draw(ctx) {
        this.draw2(ctx)
    }

    draw1(ctx) {
        this.clear(ctx)
        // this.angleX += 0.1
        // this.angleY -= 0.1
        // this.angleZ = 0
        // this.angleZ += 0.01
        this.drawDisc(ctx)
        this.point.pen.indicator(ctx, {color: '#AA6666'})
    }

    drawDisc(ctx) {

        const center = this.point
        const baseRadius = this.point.radius

        // Simulate 3D disc squash using sin of rotation
        const rx = baseRadius
        const ry = baseRadius * Math.cos(this.angleX) * Math.cos(this.angleY)

        // Draw the ellipse as a disc projection
        ctx.beginPath()
        ctx.ellipse(center.x, center.y, rx, Math.abs(ry), this.angleZ, 0, 2 * Math.PI)
        ctx.strokeStyle = '#AA6666'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = 'rgba(200, 100, 100, 0.3)'
        ctx.fill()
    }

    draw2(ctx) {
        this.clear(ctx)

        this.angleX += 0.1
        // this.angleY += 0.1
        // this.angleZ += 0.01

        const r = this.radius || 100
        const center = this.center

        // // Define local axes of a unit circle (X and Y axes in 3D)
        // let xAxis = rotate3D({x: r, y: 0, z: 0}, this.angleX, this.angleY, this.angleZ)
        // let yAxis = rotate3D({x: 0, y: r, z: 0}, this.angleX, this.angleY, this.angleZ)

        // // Radii are lengths of the projected axes
        // const rx = Math.sqrt(xAxis.x**2 + xAxis.y**2)
        // const ry = Math.sqrt(yAxis.x**2 + yAxis.y**2)

        // // Rotation angle of the x-axis (for canvas ellipse rotation)
        // const rotation = Math.atan2(xAxis.y, xAxis.x)


        let xDir = rotate3D({x: 1, y: 0, z: 0}, this.angleX, this.angleY, this.angleZ)
        let yDir = rotate3D({x: 0, y: 1, z: 0}, this.angleX, this.angleY, this.angleZ)

        const rx = r * Math.sqrt(xDir.x**2 + xDir.y**2)
        const ry = r * Math.sqrt(yDir.x**2 + yDir.y**2)
        const rotation = Math.atan2(xDir.y, xDir.x)

        ctx.beginPath()
        ctx.ellipse(center.x, center.y, rx, ry, rotation, 0, 2 * Math.PI)

        ctx.strokeStyle = '#AA6666'
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.fillStyle = 'rgba(200, 100, 100, 0.3)'
        ctx.fill()
        this.point.pen.indicator(ctx, {color: '#AA6666'})
    }

    draw3(ctx) {
        this.clear(ctx)

        this.angleX += 0.01
        // this.angleY += 0.01
        this.angleZ += 0.01

        const r = this.radius
        const center = this.point

        // Rotate 4 points around disc
        let px = rotate3D({x: r, y: 0, z: 0}, this.angleX, this.angleY, this.angleZ)
        let nx = rotate3D({x: -r, y: 0, z: 0}, this.angleX, this.angleY, this.angleZ)
        let py = rotate3D({x: 0, y: r, z: 0}, this.angleX, this.angleY, this.angleZ)
        let ny = rotate3D({x: 0, y: -r, z: 0}, this.angleX, this.angleY, this.angleZ)

        // Project all to 2D
        const proj = (pt) => [center.x + pt.x, center.y + pt.y]

        let [x1, y1] = proj(px)
        let [x2, y2] = proj(nx)
        let [y1x, y1y] = proj(py)
        let [y2x, y2y] = proj(ny)

        const rx = 0.5 * Math.hypot(x1 - x2, y1 - y2)
        const ry = 0.5 * Math.hypot(y1x - y2x, y1y - y2y)
        const rotation = Math.atan2(y1 - y2, x1 - x2)

        ctx.beginPath()
        ctx.ellipse(center.x, center.y, rx, ry, rotation, 0, 2 * Math.PI)
        ctx.strokeStyle = '#AA6666'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = 'rgba(200, 100, 100, 0.3)'
        ctx.fill()

        this.point.pen.indicator(ctx, {color: '#AA6666'})
    }

    draw4(ctx) {
        this.clear(ctx)

        // this.angleX += 0.01
        this.angleY += 0.01
        this.angleZ += 0.01

        const r = this.radius
        const center = this.center
        const steps = 100
        const points = []

        for (let i = 0; i < steps; i++) {
            const theta = (i / steps) * 2 * Math.PI
            const point3D = {
                x: r * Math.cos(theta),
                y: r * Math.sin(theta),
                z: 0
            }
            const rotated = rotate3D(point3D, this.angleX, this.angleY, this.angleZ)
            points.push([center.x + rotated.x, center.y + rotated.y])
        }

        // Now compute bounding box (approximate ellipse)
        let minX = Infinity, maxX = -Infinity
        let minY = Infinity, maxY = -Infinity
        for (const [x, y] of points) {
            if (x < minX) minX = x
            if (x > maxX) maxX = x
            if (y < minY) minY = y
            if (y > maxY) maxY = y
        }

        const ellipseWidth = maxX - minX
        const ellipseHeight = maxY - minY
        const rx = ellipseWidth / 2
        const ry = ellipseHeight / 2
        const cx = (minX + maxX) / 2
        const cy = (minY + maxY) / 2

        // Optional: Find orientation
        const [a1, a2] = points[0]
        const [b1, b2] = points[Math.floor(steps / 4)]
        const rotation = Math.atan2(b2 - a2, b1 - a1)

        ctx.beginPath()
        ctx.ellipse(cx, cy, rx, ry, rotation, 0, 2 * Math.PI)
        ctx.strokeStyle = '#AA6666'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = 'rgba(200, 100, 100, 0.3)'
        ctx.fill()

        this.point.pen.indicator(ctx, {color: '#AA6666'})
    }

    draw5(ctx) {
        this.clear(ctx)

        this.angleX += 0.01
        this.angleY += 0.01
        // this.angleZ += 0.01

        const r = this.radius
        const center = this.center
        const steps = 100

        ctx.beginPath()

        for (let i = 0; i <= steps; i++) {
            const theta = (i / steps) * 2 * Math.PI
            const point3D = {
                x: r * Math.cos(theta),
                y: r * Math.sin(theta),
                z: 0
            }

            const rotated = rotate3D(point3D, this.angleX, this.angleY, this.angleZ)
            const x2D = center.x + rotated.x
            const y2D = center.y + rotated.y

            if (i === 0) ctx.moveTo(x2D, y2D)
            else ctx.lineTo(x2D, y2D)
        }

        ctx.closePath()
        ctx.strokeStyle = '#AA6666'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = 'rgba(200, 100, 100, 0.3)'
        ctx.fill()

        this.point.pen.indicator(ctx, {color: '#AA6666'})
    }

    draw6(ctx) {
        this.clear(ctx)

        this.angleX += 0.01
        this.angleY += 0.01
        this.angleZ += 0.01

        const r = this.radius
        const center = this.center

        // Rotate the unit vectors
        let xDir = rotate3D({x: 1, y: 0, z: 0}, this.angleX, this.angleY, this.angleZ)
        let yDir = rotate3D({x: 0, y: 1, z: 0}, this.angleX, this.angleY, this.angleZ)

        // Z compensation to counter 3D "shrink"
        const safeZ = (z) => Math.min(0.999, Math.max(-0.999, z))
        const zCorrectedLength = (dir) => r / Math.sqrt(1 + safeZ(dir.z)**2)

        const rx = zCorrectedLength(xDir)
        const ry = zCorrectedLength(yDir)
        const rotation = Math.atan2(xDir.y, xDir.x)

        ctx.beginPath()
        ctx.ellipse(center.x, center.y, rx, ry, rotation, 0, 2 * Math.PI)

        ctx.strokeStyle = '#AA6666'
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.fillStyle = 'rgba(200, 100, 100, 0.3)'
        ctx.fill()

        this.point.pen.indicator(ctx, {color: '#AA6666'})
    }


}


function rotate3D(point, angleX, angleY, angleZ) {
    let {x, y, z} = point

    // X Rotation
    let cosX = Math.cos(angleX), sinX = Math.sin(angleX)
    let y1 = y * cosX - z * sinX
    let z1 = y * sinX + z * cosX

    // Y Rotation
    let cosY = Math.cos(angleY), sinY = Math.sin(angleY)
    let x2 = x * cosY + z1 * sinY
    let z2 = -x * sinY + z1 * cosY

    // Z Rotation
    let cosZ = Math.cos(angleZ), sinZ = Math.sin(angleZ)
    let x3 = x2 * cosZ - y1 * sinZ
    let y3 = x2 * sinZ + y1 * cosZ

    return {x: x3, y: y3, z: z2}
}


;stage = MainStage.go();