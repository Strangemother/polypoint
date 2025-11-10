/*
title: Egg Shape with 3D Effect
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
        // this.center = this.center || new Point(400, 300) // fallback if not set
        this.point = this.center.copy().update({radius: this.radius})
        this.dragging.add(this.point)

        // Create static circle points in local XY plane
        this.circlePoints3D = []
        const steps = 40
        for (let i = 0; i < steps; i++) {
            const theta = (Math.PI * 2 * i) / steps
            const x = Math.cos(theta) * this.radius
            const y = Math.sin(theta) * this.radius
            this.circlePoints3D.push({ x, y, z: 0 })
        }
    }

    draw(ctx) {
        this.clear(ctx)

        this.angleX += -Math.cos(this.angleY) * .01
        this.angleY += Math.sin(this.angleX) * .04
        // this.angleZ += 0.01

        const center = this.center
        const rotatedProjected = this.circlePoints3D.map(p => {
            let r = rotate3D(p, this.angleX, this.angleY, this.angleZ)
            let scale = 1 // (r.z * 0.003 + 1)
            return {
                x: r.x * scale + this.point.x,
                y: r.y * scale + this.point.y
            }
        })

        // Draw the disc outline
        ctx.beginPath()
        for (let i = 0; i < rotatedProjected.length; i++) {
            const p = rotatedProjected[i]
            if (i === 0) ctx.moveTo(p.x, p.y)
            else ctx.lineTo(p.x, p.y)
        }
        ctx.closePath()

        ctx.strokeStyle = '#AA6666'
        ctx.lineWidth = 2
        ctx.stroke()

        // Optionally, fill the disc
        ctx.fillStyle = 'rgba(200, 100, 100, 0.3)'
        ctx.fill()
        this.point.pen.indicator(ctx, {color: '#AA6666'})

    }

    draw(ctx) {
        this.clear(ctx)

        // this.angleX += 0.01
        this.angleY += 0.1
        this.angleZ += 0.01
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

// class MainStage extends Stage {
//     canvas='playspace'
//     live = true

//     mounted(){
//         this.point = this.center.copy().update({radius: 100})
//         this.dragging.add(this.point)
//         this.angleX = 0
//         this.angleY = 0
//         this.angleZ = 0
//     }

//     draw(ctx){
//         this.clear(ctx)

//         this.angleX += 0.01
//         this.angleY += 0.01
//         this.angleZ += 0.01

//         this.point.pen.indicator(ctx, {color: '#AA6666'})

//     }
// }


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