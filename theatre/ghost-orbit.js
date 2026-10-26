/*
title: Ghost Orbit
category: animation
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point.js
    ../point_src/stage.js
*/
class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        this.t = 0
        this.satellites = Array.from({length: 12}, (_, i) => ({
            phase: i * Math.PI * 2 / 12,
            orbit: 65 + (i % 3) * 35,
            speed: .3 + (i % 4) * .12,
            radius: 3 + i % 3
        }))
    }
    draw(ctx) {
        this.clear(ctx)
        const c = this.center
        this.t += .012
        const glow = ctx.createRadialGradient(c.x, c.y, 2, c.x, c.y, 65)
        glow.addColorStop(0, '#d9f8ff')
        glow.addColorStop(.35, '#6ac8ff')
        glow.addColorStop(1, 'rgba(30,100,200,0)')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(c.x, c.y, 65, 0, Math.PI * 2)
        ctx.fill()
        this.satellites.forEach(s => {
            const a = this.t * s.speed + s.phase
            const x = c.x + Math.cos(a) * s.orbit
            const y = c.y + Math.sin(a) * s.orbit * .65
            ctx.beginPath()
            ctx.arc(x, y, s.radius, 0, Math.PI * 2)
            ctx.fillStyle = '#bdeeff'
            ctx.fill()
        })
    }
}
stage = MainStage.go()
