/*
title: Ghostly Gravity Garden, PollyPoint Edition
categories: gravity
    particles
    interactive
files:
    head
    point
    pointlist
    stroke
    stage
    mouse
    dragging
    ../point_src/gradient.js
    ../point_src/events.js
    ../point_src/velocity.js
---

The same fuzzy atom, this time built with PollyPoint's PointList, point pens,
dragging helper and VelocityReactor. Drag the star; double-click to scatter.
The original ghostly-gravity-garden.js is unchanged.
*/

class MainStage extends Stage {
    canvas = 'playspace'

    mounted() {
        this.well = this.center.copy()
        this.well.radius = 18
        this.points = new PointList(...Array.from({ length: 80 }, () => new Point()))
        this.reactor = new VelocityReactor()
        this.reactor.points = this.points
        this.trails = new Map()
        this.glow = new Gradient()
        this.glow.addStops({
            0: 'rgba(100,230,255,.75)',
            1: 'rgba(100,230,255,0)'
        })

        this.points.forEach(p => {
            p.radius = 1.5 + Math.random() * 2.2
            p.hue = 170 + Math.random() * 130
            p.color = `hsl(${p.hue}, 95%, 80%)`
            this.resetOrbit(p)
        })

        // Let PollyPoint deal with pointer coordinates and dragging.
        this.dragging.addPoints(this.well)
    }

    onDblclick() {
        this.scatter()
    }

    resetOrbit(p) {
        const a = Math.random() * Math.PI * 2
        const r = 55 + Math.random() * Math.min(this.dimensions.width, this.dimensions.height) * .42
        const speed = Math.sqrt(190 / r)
        p.x = this.well.x + Math.cos(a) * r
        p.y = this.well.y + Math.sin(a) * r
        p.velocity.set(-Math.sin(a) * speed, Math.cos(a) * speed)
        this.trails.set(p, [])
    }

    scatter() {
        this.points.forEach(p => {
            const a = Math.random() * Math.PI * 2
            p.vx += Math.cos(a) * 3
            p.vy += Math.sin(a) * 3
            this.trails.get(p).length = 0
        })
    }

    drawTrail(ctx, points, hue) {
        if (points.length < 2) return
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)
        for (let i = 1; i < points.length - 1; i++) {
            const a = points[i], b = points[i + 1]
            ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2)
        }
        const last = points[points.length - 1]
        ctx.lineTo(last.x, last.y)
        ctx.strokeStyle = `hsla(${hue}, 95%, 75%, .36)`
        ctx.lineWidth = 1.2
        ctx.stroke()
    }

    draw(ctx) {
        this.clear(ctx)
        const { width, height } = this.dimensions
        ctx.fillStyle = '#080d1d'
        ctx.fillRect(0, 0, width, height)

        // Only the interesting bit remains ours: gravity.
        this.points.forEach(p => {
            const dx = this.well.x - p.x
            const dy = this.well.y - p.y
            const distance = Math.sqrt(dx * dx + dy * dy + 900)
            const acceleration = Math.min(.8, 170 / (distance * distance))
            p.vx = (p.vx + dx / distance * acceleration) * .999
            p.vy = (p.vy + dy / distance * acceleration) * .999
        })
        this.reactor.step()

        this.points.forEach(p => {
            if (p.x < -90 || p.x > width + 90 || p.y < -90 || p.y > height + 90) {
                this.resetOrbit(p)
            }
            const trail = this.trails.get(p)
            trail.push({ x: p.x, y: p.y })
            if (trail.length > 28) trail.shift()

            // Local quadratic trail variant; core quadCurve remains untouched.
            this.drawTrail(ctx, trail, p.hue)
            p.pen.fill(ctx, p.color)
        })

        // Refresh the radial gradient around the draggable well.
        this.glow.radial(
            this.well.copy().update({ radius: 2 }),
            this.well.copy().update({ radius: 58 })
        )
        ctx.fillStyle = this.glow.getObject(ctx)
        ctx.beginPath()
        ctx.arc(this.well.x, this.well.y, 58, 0, Math.PI * 2)
        ctx.fill()
        this.well.pen.fill(ctx, '#b9f5ff')
        ctx.font = '13px sans-serif'
        ctx.fillStyle = '#d5e7fa'
        ctx.fillText('Drag the star • Double-click to scatter • PollyPoint edition', 16, 26)
    }
}

stage = MainStage.go()
