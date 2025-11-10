/*
title: Ellipse Disc Projection
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
        this.clear(ctx)
        this.angleX = Math.PI * 2
        // this.angleX += 0.01
        // this.angleY += 0.01
        // this.angleZ += 0.1
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