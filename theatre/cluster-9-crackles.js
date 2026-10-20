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
        this.dance = true
        this.showLines = true
        this.showPoints = false
        this.connectLineWidth = 2
        const pointCount = 200

        this.beacon = this.center.copy()
        this.dragging.add(this.beacon)


        this.t = 0
        this.linkGlow = new Map()
        this.points = PointList.generate.random(pointCount, 500)
        this.points.forEach((p, i) => {
            p.vx = 0
            p.vy = 0
            p.radius = 1.4 + Math.random() * 1.6
            p.minDistance = 30 + Math.random() * 10
            p.minVelocity = 0.01
            p.maxVelocity = 1.5 + Math.random() * 2
            p.damping = 0.95 + Math.random() * 0.055
            p.attractionStrength = 0.12 + Math.random() * 0.4
            p.repulsionStrength = 10 + Math.random() * 18
            p.followNearestCount = 1//2 + (i % 4)
            p.hue = 36 + Math.random() * 22
        })
    }

    draw(ctx) {
        this.clear(ctx)
        const center = this.beacon
        const points = this.points
        const time = this.t++ * 0.012
        const dance = this.dance;
        const showLines = this.showLines;
        let target = {
            x: center.x
            , y: center.y
        }

        if (dance) {

            // The orbiting target tugs the duckling chains into a gentle dance.
            target = {
                x: center.x + Math.cos(time) * 78,
                y: center.y + Math.sin(time * 0.73) * 55
            }
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

        // Update each node's actual glow before sampling it for new links.
        // The same computed value is used to draw the node below.
        for (const p of points) {
            const speed = Math.hypot(p.vx, p.vy)
            const motion = Math.min(1, speed / p.maxVelocity)
            const targetGlint = motion * motion
            p.glint = Math.max(targetGlint, (p.glint ?? 0) * 0.975)
        }

        if (showLines) {

            // Real following edges, drawn from the pre-move snapshot so the
            // rendered graph matches the neighbours used by this simulation step.
            // Each link samples its source node's glow only when first formed,
            // then fades on its own, regardless of later speed changes.
            const nextGlow = new Map()
            ctx.lineWidth = this.connectLineWidth
            for (const link of links) {
                const key = `${link.from}:${link.toTarget ? 'target' : link.to}`
                const previous = this.linkGlow.get(key)
                const source = points[link.from]
                const state = previous === undefined
                    ? {fade: 1, initialLight: 0.10 + 0.90 * source.glint}
                    : {fade: previous.fade * 0.965, initialLight: previous.initialLight}
                nextGlow.set(key, state)

                const a = positions[link.from]
                const b = link.toTarget ? target : positions[link.to]
                // The quiet baseline remains barely visible for all links.
                ctx.strokeStyle = 'rgba(140, 165, 165, 0.055)'
                ctx.beginPath()
                ctx.moveTo(a.x, a.y)
                ctx.lineTo(b.x, b.y)
                ctx.stroke()

                const flashAlpha = 0.60 * state.initialLight * state.fade
                if (flashAlpha > 0.003) {
                    ctx.strokeStyle = `hsla(${source.hue}, 100%, 80%, ${flashAlpha})`
                    ctx.stroke()
                }
            }
            // Removed links lose their glow; reappearing links flash anew.
            this.linkGlow = nextGlow
        }

        if (this.showPoints) {
            for (const p of points) {
                // Brightness uses the same velocity-driven value sampled by links.
                const glint = p.glint
                const brightness = 0.10 + 0.90 * glint
                const col = `hsla(${p.hue}, 100%, ${45 + 48 * glint}%, ${brightness})`
                p.pen.fill(ctx, {color: col})
            }
        }

        if (center.pen.line) {
            const strokeCol = 'rgba(140, 165, 165, 0.08)';
            center.pen.line(ctx,target, strokeCol, 1)
        }

        (new Point(target)).pen.circle(ctx, { color: '#443222' });
        center.pen.circle(ctx, {color: 'orange', width: 1})
    }
}

const stage = new MainStage('playspace')
stage.loopDraw()
