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
        this.linkGlow = new Map()
        this.points = PointList.generate.random(120, 500)
        this.points.forEach((p, i) => {
            p.vx = 0
            p.vy = 0
            p.radius = 1.4 + Math.random() * 1.6
            p.minDistance = 25 + Math.random() * 65
            p.minVelocity = 0.01
            p.maxVelocity = 1.5 + Math.random() * 2
            p.damping = 0.93 + Math.random() * 0.055
            p.attractionStrength = 0.12 + Math.random() * 0.4
            p.repulsionStrength = 50 + Math.random() * 180
            p.followNearestCount = 1 + (i % 4)
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
        // Each directed relationship has its own flash state, independent
        // of node brightness. New edges flash; surviving edges slowly fade.
        const nextGlow = new Map()
        ctx.lineWidth = 0.6
        for (const link of links) {
            const key = `${link.from}:${link.toTarget ? 'target' : link.to}`
            const previous = this.linkGlow.get(key)
            const glow = previous === undefined ? 1 : previous * 0.965
            nextGlow.set(key, glow)

            const a = positions[link.from]
            const b = link.toTarget ? target : positions[link.to]
            ctx.strokeStyle = `rgba(210, 220, 185, ${0.055 + 0.60 * glow})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
        }
        // Removed links lose their glow; reappearing links flash anew.
        this.linkGlow = nextGlow

        for (const p of points) {
            // Light is driven by actual movement, not a random blink timer.
            // Each firefly has a different maxVelocity, so normalize by its own cap.
            const speed = Math.hypot(p.vx, p.vy)
            const motion = Math.min(1, speed / p.maxVelocity)
            // Fast attack, slow release: avoid flicker when velocity drops.
            const targetGlint = motion * motion
            p.glint = Math.max(targetGlint, (p.glint ?? 0) * 0.975)
            const glint = p.glint
            const brightness = 0.10 + 0.90 * glint
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
            ctx.fillStyle = `hsla(${p.hue}, 100%, ${45 + 48 * glint}%, ${brightness})`
            ctx.fill()
        }

        ctx.strokeStyle = 'rgba(140, 165, 165, 0.08)'
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
