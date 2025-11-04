/*
title: Planetary Gears
src_dir: ../point_src/
categories: gears
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/stage.js
    ../point_src/point.js
    dragging
    pointlist
    mouse
    stroke
    ../point_src/split.js
    ../point_src/stage-clock.js
    ../point_src/touching.js
    ../point_src/coupling.js
    ../point_src/xybind.js
    ../point_src/gearbox.js
    ../point_src/gearbox-planets.js
---

Planetary gear system with sun, planet, and ring gears.
The planet gears orbit around the sun while rotating on their own axes.
*/


class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        this.rawPointConf = { circle: { color: 'orange', width: 1}}
        this.generate()
        this.setupControls()
        
        // Add all gears to dragging (optional - can make planets draggable)
        // Note: dragging planets will fight with their orbital motion
        this.dragging.add(this.planetary.sun, this.planetary.ring)
    }

    generate(){
        let gb = this.gearBox = new GearBox()
        
        // Create a planetary gear system
        // Motor speed in degrees per frame (not radians!)
        this.planetary = gb.createPlanetarySystem({
            sunXY: { x: 300, y: 300 },
            sunRadius: 60,
            planetRadius: 25,
            // ringRadius will be auto-calculated to properly touch planets
            planetCount: 3,
            sunMotor: 1  // degrees per frame
        })
        
        // Create a second planetary system for comparison
        this.planetary2 = gb.createPlanetarySystem({
            sunXY: { x: 650, y: 300 },
            sunRadius: 40,
            planetRadius: 20,
            // ringRadius will be auto-calculated
            planetCount: 4,
            sunMotor: -1.5  // opposite direction, degrees per frame
        })
        
        console.log('Planetary systems created')
        console.log('System 1 - Sun:', this.planetary.sun, 'Planets:', this.planetary.planets)
        console.log('System 2 - Sun:', this.planetary2.sun, 'Planets:', this.planetary2.planets)
        
        return gb.points
    }

    setupControls() {
        // Keyboard controls
        this.keys = {}
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true
            this.handleKeyPress(e.key)
        })
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false
        })
    }

    handleKeyPress(key) {
        switch(key) {
            case ' ': // spacebar - toggle sun motor
                let current = this.planetary.sun.motor
                this.planetary.setSunMotor(current === 0 ? 1 : 0)
                break
            case 'ArrowUp': // speed up
                this.planetary.sun.motor += 0.5
                break
            case 'ArrowDown': // speed down
                this.planetary.sun.motor -= 0.5
                break
            case 'r': // reverse
                this.planetary.sun.motor *= -1
                break
            case 's': // toggle spokes
                this.gearBox.doSpokes = !this.gearBox.doSpokes
                break
            case '1': // lock/unlock ring
                this.ringLocked = !this.ringLocked
                if(this.ringLocked) {
                    this.planetary.ring.angularVelocity = 0
                    this.planetary.ring.motor = 0
                }
                break
            case '2': // make ring rotate
                this.planetary.ring.motor = this.planetary.ring.motor === 0 ? 1 : 0
                break
        }
    }

    draw(ctx){
        this.clear(ctx)
        
        // Draw the gear system
        this.gearBox.performDraw(ctx)
        
        // Draw orbital paths (optional visualization)
        this.drawOrbitalPaths(ctx)
        
        // Draw velocity info on gears
        ctx.fillStyle = 'white'
        ctx.font = '10px monospace'
        
        this.gearBox.points.forEach((p)=>{
            let angVel = (p.angularVelocity * 100).toFixed(1)
            p.text.string(ctx, angVel)
        })
        
        // Draw carrier info
        this.drawCarrierInfo(ctx)
        
        // Draw controls info
        this.drawControls(ctx)
        
        let p = this.dragging.getPoint();
        if(p) {
            p.pen.circle(ctx, {color: 'yellow'})
        }
    }

    drawOrbitalPaths(ctx) {
        // Draw faint circles showing planet orbital paths
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)'
        ctx.lineWidth = 1
        ctx.setLineDash([5, 5])
        
        // System 1
        ctx.beginPath()
        ctx.arc(this.planetary.sun.x, this.planetary.sun.y, 
                this.planetary.orbitRadius, 0, Math.PI * 2)
        ctx.stroke()
        
        // System 2
        ctx.beginPath()
        ctx.arc(this.planetary2.sun.x, this.planetary2.sun.y, 
                this.planetary2.orbitRadius, 0, Math.PI * 2)
        ctx.stroke()
        
        ctx.setLineDash([])
    }

    drawCarrierInfo(ctx) {
        ctx.fillStyle = 'white'
        ctx.font = '12px monospace'
        
        let y = 20
        ctx.fillText(`System 1:`, 10, y)
        y += 15
        ctx.fillText(`  Sun Motor: ${this.planetary.sun.motor.toFixed(2)}° /frame`, 10, y)
        y += 15
        ctx.fillText(`  Carrier Angle: ${this.planetary.carrierAngle.toFixed(1)}°`, 10, y)
        y += 15
        ctx.fillText(`  Carrier Velocity: ${this.planetary.carrierVelocity.toFixed(3)}° /frame`, 10, y)
        y += 15
        ctx.fillText(`  Ring Radius: ${this.planetary.ring.radius.toFixed(0)}`, 10, y)
        
        y += 25
        ctx.fillText(`System 2:`, 10, y)
        y += 15
        ctx.fillText(`  Sun Motor: ${this.planetary2.sun.motor.toFixed(2)}° /frame`, 10, y)
        y += 15
        ctx.fillText(`  Carrier Angle: ${this.planetary2.carrierAngle.toFixed(1)}°`, 10, y)
        y += 15
        ctx.fillText(`  Ring Radius: ${this.planetary2.ring.radius.toFixed(0)}`, 10, y)
    }

    drawControls(ctx) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.font = '11px monospace'
        
        let x = this.canvas.width - 200
        let y = 20
        
        ctx.fillText('Controls:', x, y)
        y += 15
        ctx.fillText('SPACE - Toggle sun motor', x, y)
        y += 15
        ctx.fillText('↑/↓   - Speed up/down', x, y)
        y += 15
        ctx.fillText('R     - Reverse', x, y)
        y += 15
        ctx.fillText('S     - Toggle spokes', x, y)
        y += 15
        ctx.fillText('1     - Lock ring gear', x, y)
        y += 15
        ctx.fillText('2     - Rotate ring gear', x, y)
    }
}


stage = MainStage.go()
