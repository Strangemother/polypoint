/*
title: Cluster 4 - Firefly Swarm
categories: clusters
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/stage.js
    ../point_src/point.js
    ../point_src/distances.js
    pointlist
    ../point_src/events.js
    dragging
    ../point_src/cluster.js
    mouse
 */

/*
 * A little orbital ecosystem built on clusterDucks.
 * Drag the pale beacon to move the swarm. Each firefly follows nearer
 * neighbours, with its own preferred spacing, speed and attraction.
 */
class MainStage extends Stage {
    mounted() {
        this.beacon = this.center.copy()
        this.dragging.add(this.beacon)
        this.t = 0
        this.points = PointList.generate.random(90, 500)
        this.points.forEach((p, i) => {
            p.vx = 0
            p.vy = 0
            p.radius = 2 + Math.random() * 2.5
            p.minDistance = 25 + Math.random() * 65
            p.minVelocity = 0.01
            p.maxVelocity = 1.5 + Math.random() * 2
            p.damping = 0.93 + Math.random() * 0.055
            p.attractionStrength = 0.12 + Math.random() * 0.4
            p.repulsionStrength = 50 + Math.random() * 180
            p.followNearestCount = 1 + (i % 4)
            p.phase = Math.random() * Math.PI * 2
            p.hue = 155 + Math.random() * 85
        })
    }

    draw(ctx) {
        this.clear(ctx)
        const center = this.beacon
        const points = this.points
        const time = this.t++ * 0.012

        // The orbiting target tugs the duckling chains into a gentle dance.
        const target = {
            x: center.x + Math.cos(time) * 78,
            y: center.y + Math.sin(time * 0.73) * 55
        }
        simpleCluster(points, target, {
            func: clusterDucks,
            followNearestCount: 2
        })

        // Short filaments connect nearby fireflies, making clusters visible.
        ctx.lineWidth = 0.7
        for (let i = 0; i < points.length; i++) {
            const a = points[i]
            let nearest = null
            let nearestSq = 75 * 75
            for (let j = 0; j < points.length; j++) {
                if (i === j) continue
                const b = points[j]
                const dx = a.x - b.x
                const dy = a.y - b.y
                const dsq = dx * dx + dy * dy
                if (dsq < nearestSq) {
                    nearestSq = dsq
                    nearest = b
                }
            }
            if (nearest) {
                ctx.strokeStyle = 'rgba(80, 220, 180, 0.16)'
                ctx.beginPath()
                ctx.moveTo(a.x, a.y)
                ctx.lineTo(nearest.x, nearest.y)
                ctx.stroke()
            }
        }

        for (const p of points) {
            const pulse = 0.65 + 0.35 * Math.sin(time * 3 + p.phase)
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.radius * (2.1 + pulse), 0, Math.PI * 2)
            ctx.fillStyle = `hsla(${p.hue}, 95%, 65%, ${0.055 * pulse})`
            ctx.fill()
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
            ctx.fillStyle = `hsla(${p.hue}, 95%, 73%, ${0.55 + 0.45 * pulse})`
            ctx.fill()
        }

        ctx.strokeStyle = 'rgba(210, 230, 255, 0.2)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(center.x, center.y)
        ctx.lineTo(target.x, target.y)
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(target.x, target.y, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#c5dfff'
        ctx.fill()
        center.pen.indicator(ctx, {color: '#ffffff'})
    }
}

const stage = new MainStage('playspace')
stage.loopDraw()
