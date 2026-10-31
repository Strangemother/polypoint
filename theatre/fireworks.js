/*
title: Firework Garden
categories: animation
    particles
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/compass.js
    ../point_src/point.js
    ../point_src/stage.js
*/


class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        this.rockets = []
        this.sparks = []
        this.wheels = []
        this.frame = 0
        this.palette = ['#ff557f', '#ffca52', '#60edff', '#a68cff', '#7bffb2', '#ff8b48', '#f9f6ff']
    }
    launch(w, h) {
        const p = new Point(w * (.12 + Math.random() * .76), h + 8, 3)
        p.vx = (Math.random() - .5) * 1.3
        p.vy = -(5.5 + Math.random() * 6.8)
        p.fuse = 32 + Math.random() * 58
        p.hue = this.palette[Math.floor(Math.random() * this.palette.length)]
        const choice = Math.random()
        p.kind = choice < .14 ? 'wheel' : choice < .29 ? 'globe' : choice < .49 ? 'willow' : choice < .68 ? 'peony' : 'normal'
        this.rockets.push(p)
    }
    makeWheel(rocket) {
        this.wheels.push({center: new Point(rocket.x, rocket.y, 1),
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() < .5 ? -1 : 1) * .2,
            age: 0, hue: rocket.hue})
    }

    willow(rocket) {
        for (let i = 0; i < 90; i++) {
            const a = Math.PI * 2 * i / 90
            const sp = 1.6 + Math.random() * 1.8
            const p = new Point(rocket.x, rocket.y, .65)
            p.vx = Math.cos(a) * sp
            p.vy = Math.sin(a) * sp
            p.life = 160 + Math.random() * 35
            p.hue = Math.random() < .2 ? '#fff2aa' : '#e9ad4a'
            p.willow = true
            p.trail = []
            this.sparks.push(p)
        }
    }
    peony(rocket) {
        // Fibonacci sphere: evenly spaced directions on a 3D shell.
        // Project each direction into the screen, scaling with depth.
        const count = 220
        const goldenAngle = Math.PI * (3 - Math.sqrt(5))
        const spin = Math.random() * Math.PI * 2
        const tilt = (Math.random() - .5) * .8
        for (let i = 0; i < count; i++) {
            const z = 1 - 2 * (i + .5) / count
            const ring = Math.sqrt(1 - z * z)
            const angle = i * goldenAngle + spin
            const xx = ring * Math.cos(angle)
            const yy = ring * Math.sin(angle)
            const zz = z * Math.cos(tilt) + yy * Math.sin(tilt)
            const yz = yy * Math.cos(tilt) - z * Math.sin(tilt)
            const perspective = 2.6 / (2.6 - zz * .7)
            const p = new Point(rocket.x, rocket.y, .55 + .65 * perspective)
            p.vx = xx * 3.25 * perspective
            p.vy = yz * 3.25 * perspective
            p.peony = true
            p.depth = zz
            p.life = 105
            p.maxLife = 105
            p.hue = (i % 9 === 0) ? '#ffffff' : rocket.hue
            this.sparks.push(p)
        }
    }
    burst(rocket) {
        if (rocket.kind === 'willow') { this.willow(rocket); return }
        if (rocket.kind === 'peony') { this.peony(rocket); return }
        if (rocket.kind === 'wheel') { this.makeWheel(rocket); return }
        const globe = rocket.kind === 'globe'
        const n = globe ? 120 : 75 + Math.floor(Math.random() * 55)
        for (let i = 0; i < n; i++) {
            const a = Math.PI * 2 * i / n + (globe ? 0 : Math.random() * .09)
            const speed = globe ? 2.7 : (1.1 + Math.random() * 3.8) * (i % 7 === 0 ? 1.35 : 1)
            const p = new Point(rocket.x, rocket.y, .6 + Math.random() * 1.15)
            p.vx = Math.cos(a) * speed
            p.vy = Math.sin(a) * speed
            p.life = globe ? 95 : 55 + Math.random() * 55
            p.globe = globe
            p.maxLife = p.life
            p.hue = globe ? rocket.hue : (Math.random() < .19 ? '#ffffff' : rocket.hue)
            this.sparks.push(p)
        }
    }
    draw(ctx) {
        const w = ctx.canvas.width, h = ctx.canvas.height
        this.clear(ctx)
        ctx.fillStyle = '#08091a'
        ctx.fillRect(0, 0, w, h)
        this.frame++
        if (this.frame % 21 === 1) this.launch(w, h)
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        for (let i = this.rockets.length - 1; i >= 0; i--) {
            const p = this.rockets[i]
            p.x += p.vx; p.y += p.vy; p.vy += .075; p.fuse--
            ctx.strokeStyle = '#e5b9ff'
            ctx.lineWidth = 2
            ctx.beginPath(); ctx.moveTo(p.x, p.y + 14); ctx.lineTo(p.x, p.y); ctx.stroke()
            p.pen.fill(ctx, '#fff5db')
            if (p.fuse <= 0 || p.vy >= -.7) {
                this.burst(p)
                this.rockets.splice(i, 1)
            }
        }
        for (let i = this.wheels.length - 1; i >= 0; i--) {
            const wheel = this.wheels[i]
            wheel.age++
            wheel.angle += wheel.spin
            for (let arm = 0; arm < 3; arm++) {
                const a = wheel.angle + arm * Math.PI * 2 / 3
                const d = 10 + Math.min(wheel.age, 25) * .6
                const p = new Point(wheel.center.x + Math.cos(a) * d,
                                    wheel.center.y + Math.sin(a) * d, .7)
                p.vx = Math.cos(a + Math.PI / 2) * 2.5
                p.vy = Math.sin(a + Math.PI / 2) * 2.5
                p.life = 26 + Math.random() * 15
                p.hue = Math.random() < .2 ? '#ffffff' : wheel.hue
                this.sparks.push(p)
            }
            if (wheel.age > 65) this.wheels.splice(i, 1)
        }
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const p = this.sparks[i]
            if (p.willow) {
                if (this.frame % 2 === 0) p.trail.push([p.x, p.y])
                if (p.trail.length > 28) p.trail.shift()
                ctx.globalAlpha = Math.min(.75, p.life / 75)
                ctx.strokeStyle = p.hue
                ctx.lineWidth = .7
                ctx.beginPath()
                p.trail.forEach((xy, k) => {
                    if (k === 0) ctx.moveTo(xy[0], xy[1])
                    else ctx.lineTo(xy[0], xy[1])
                })
                ctx.stroke()
            }
            p.x += p.vx; p.y += p.vy
            p.vx *= p.willow ? .993 : p.peony ? .994 : p.globe ? .99 : .985
            p.vy = p.vy * (p.willow ? .995 : p.peony ? .994 : p.globe ? .99 : .985) + (p.willow ? .035 : p.peony ? .002 : p.globe ? .006 : .035)
            p.life--
            if (p.life <= 0) { this.sparks.splice(i, 1); continue }
            ctx.globalAlpha = Math.min(1, p.life / (p.willow ? 80 : p.peony ? 40 : p.globe ? 40 : 25)) * (p.peony ? .68 + .32 * (p.depth + 1) / 2 : 1)
            p.pen.fill(ctx, p.hue)
        }
        ctx.restore()
    }
}
stage = MainStage.go()
