/*
title: Cluster 6 - Expressive Firefly Swarm
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
            p.hue = 36 + Math.random() * 22
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
        // Snapshot first: clusterDucks chooses neighbours using pre-move positions.
        // Mirror that exact selection rule for the visual edges.
        const positions = points.map(p => ({x: p.x, y: p.y}))
        const distances = positions.map(p => Math.hypot(target.x - p.x, target.y - p.y))
        const links = []
        for (let i = 0; i < points.length; i++) {
            const nearer = []
            for (let j = 0; j < points.length; j++) {
                if (i === j || !(distances[j] < distances[i])) continue
                nearer.push({
                    index: j,
                    distance: Math.hypot(positions[j].x - positions[i].x,
                                         positions[j].y - positions[i].y)
                })
            }
            nearer.sort((a, b) => a.distance - b.distance)
            if (!nearer.length) {
                links.push({from: i, toTarget: true})
            } else {
                const count = Math.min(points[i].followNearestCount ?? 2, nearer.length)
                for (let k = 0; k < count; k++) {
                    links.push({from: i, to: nearer[k].index})
                }
            }
        }

        simpleCluster(points, target, {
            func: clusterDucks,
            followNearestCount: 2
        })

        // Real following edges, drawn from the pre-move snapshot so the
        // rendered graph matches the neighbours used by this simulation step.
        ctx.lineWidth = 0.7
        ctx.strokeStyle = 'rgba(255, 182, 55, 0.22)'
        for (const link of links) {
            const a = positions[link.from]
            const b = link.toTarget ? target : positions[link.to]
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
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

        ctx.strokeStyle = 'rgba(255, 208, 125, 0.25)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(center.x, center.y)
        ctx.lineTo(target.x, target.y)
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(target.x, target.y, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#ffda85'
        ctx.fill()
        center.pen.indicator(ctx, {color: '#ffffff'})
    }
}

const stage = new MainStage('playspace')
stage.loopDraw()
