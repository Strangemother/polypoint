/*
title: Ghostly Gravity Garden
categories: gravity
    particles
    interactive
files:
    head
    point
    stage
---

Drag the glowing star to bend the paths of eighty orbiting points.
Double-click to scatter the garden.
A little experiment from Ghostly for Jaybird.
*/

class MainStage extends Stage {
    canvas = 'playspace'

    mounted() {
        const { width, height } = this.dimensions
        this.well = new Point({ x: width / 2, y: height / 2, radius: 14 })
        this.particles = Array.from({ length: 80 }, () => {
            const a = Math.random() * Math.PI * 2
            const r = 55 + Math.random() * Math.min(width, height) * .42
            const speed = Math.sqrt(190 / r)
            return {
                point: new Point({
                    x: this.well.x + Math.cos(a) * r,
                    y: this.well.y + Math.sin(a) * r,
                    radius: 1.5 + Math.random() * 2.2
                }),
                vx: -Math.sin(a) * speed,
                vy: Math.cos(a) * speed,
                hue: 170 + Math.random() * 130,
                trail: []
            }
        })
        const canvas = document.getElementById('playspace')
        const locate = e => {
            const rect = canvas.getBoundingClientRect()
            return {
                x: (e.clientX - rect.left) * canvas.width / rect.width,
                y: (e.clientY - rect.top) * canvas.height / rect.height
            }
        }
        this.draggingWell = false
        canvas.addEventListener('pointerdown', e => {
            const p = locate(e)
            if (Math.hypot(p.x - this.well.x, p.y - this.well.y) < 48) {
                this.draggingWell = true
                canvas.setPointerCapture(e.pointerId)
                this.well.x = p.x
                this.well.y = p.y
            }
        })
        canvas.addEventListener('pointermove', e => {
            if (!this.draggingWell) return
            const p = locate(e)
            this.well.x = p.x
            this.well.y = p.y
        })
        canvas.addEventListener('pointerup', () => { this.draggingWell = false })
        canvas.addEventListener('pointercancel', () => { this.draggingWell = false })
        canvas.addEventListener('dblclick', () => this.scatter())
    }

    scatter() {
        for (const b of this.particles) {
            const a = Math.random() * Math.PI * 2
            b.vx += Math.cos(a) * 3
            b.vy += Math.sin(a) * 3
            b.trail.length = 0
        }
    }

    draw(ctx) {
        this.clear(ctx)
        const { width, height } = this.dimensions
        ctx.fillStyle = '#080d1d'
        ctx.fillRect(0, 0, width, height)

        for (const b of this.particles) {
            const p = b.point
            const dx = this.well.x - p.x
            const dy = this.well.y - p.y
            const distance = Math.sqrt(dx * dx + dy * dy + 900)
            const acceleration = Math.min(.8, 170 / (distance * distance))
            b.vx = (b.vx + dx / distance * acceleration) * .999
            b.vy = (b.vy + dy / distance * acceleration) * .999
            p.x += b.vx
            p.y += b.vy

            if (p.x < -90 || p.x > width + 90 || p.y < -90 || p.y > height + 90) {
                const a = Math.random() * Math.PI * 2
                const r = 60 + Math.random() * Math.min(width, height) * .3
                p.x = this.well.x + Math.cos(a) * r
                p.y = this.well.y + Math.sin(a) * r
                b.vx = -Math.sin(a)
                b.vy = Math.cos(a)
                b.trail.length = 0
            }

            b.trail.push({ x: p.x, y: p.y })
            if (b.trail.length > 28) b.trail.shift()
            ctx.beginPath()
            b.trail.forEach((v, i) => {
                if (i === 0) ctx.moveTo(v.x, v.y)
                else ctx.lineTo(v.x, v.y)
            })
            ctx.strokeStyle = `hsla(${b.hue}, 95%, 75%, .36)`
            ctx.lineWidth = 1.2
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
            ctx.fillStyle = `hsl(${b.hue}, 95%, 80%)`
            ctx.fill()
        }

        const glow = ctx.createRadialGradient(
            this.well.x, this.well.y, 2, this.well.x, this.well.y, 58
        )
        glow.addColorStop(0, 'rgba(100,230,255,.75)')
        glow.addColorStop(1, 'rgba(100,230,255,0)')
        ctx.beginPath()
        ctx.arc(this.well.x, this.well.y, 58, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()
        ctx.beginPath()
        ctx.arc(this.well.x, this.well.y, this.well.radius, 0, Math.PI * 2)
        ctx.fillStyle = '#b9f5ff'
        ctx.fill()

        ctx.font = '13px sans-serif'
        ctx.fillStyle = '#d5e7fa'
        ctx.fillText('Drag the star • Double-click to scatter', 16, 26)
    }
}

stage = MainStage.go()
