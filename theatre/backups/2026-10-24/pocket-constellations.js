/*
title: Chromatic Automata
files:
    head
    pointlist
    point
    stage
    mouse
    dragging
    stroke
---
228 colour creatures (28 large, 200 half-sized and slower) seek similar hues, blend on contact, and merge with close matches.
Drag them into each other to play genetic matchmaker. Big creatures that go 800 frames without merging burst into a random number of differently sized, random-coloured offspring while conserving mass.
*/
class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        this.points = new PointList()
        const cx = this.canvas.width / 2, cy = this.canvas.height / 2
        for (let i = 0; i < 28; i++) {
            const a = i * Math.PI * 2 / 28, r = 95 + (i % 6) * 25
            const p = new Point({x: cx + Math.cos(a)*r, y: cy + Math.sin(a)*r, radius: 8})
            p.hue = Math.floor(Math.random()*12)*30
            p.vx = (Math.random()-.5)*2
            p.vy = (Math.random()-.5)*2
            p.mass = 1
            p.speedScale = 1
            p.cool = 0
            p.hunger = 0
            this.points.push(p)
        }
        // Two hundred half-sized, slower wanderers scattered throughout the stage.
        for (let i = 0; i < 200; i++) {
            const p = new Point({
                x: 8 + Math.random() * Math.max(1, this.canvas.width - 16),
                y: 8 + Math.random() * Math.max(1, this.canvas.height - 16),
                radius: 4
            })
            p.hue = Math.floor(Math.random() * 12) * 30
            p.vx = (Math.random() - .5) * .8
            p.vy = (Math.random() - .5) * .8
            p.mass = .25
            p.cool = 0
            p.speedScale = .45
            this.points.push(p)
        }
        this.dragging.add(...this.points)
    }
    hueDiff(a,b) {
        const d = Math.abs(a-b)%360
        return Math.min(d, 360-d)
    }
    mixHue(a,b) {
        const x = Math.cos(a*Math.PI/180)+Math.cos(b*Math.PI/180)
        const y = Math.sin(a*Math.PI/180)+Math.sin(b*Math.PI/180)
        return (Math.atan2(y,x)*180/Math.PI+360)%360
    }
    step() {
        const ps = this.points
        const width = this.canvas.width, height = this.canvas.height
        for (const p of ps) {
            if (p.cool > 0) p.cool--
            p.hunger = (p.hunger || 0) + 1
            let friend = null, best = Infinity
            for (const q of ps) {
                if (p === q) continue
                const dx=q.x-p.x, dy=q.y-p.y
                const dist=Math.hypot(dx,dy)||.001
                const hue=this.hueDiff(p.hue,q.hue)
                const score = hue*3 + dist*.12
                if (score < best) {best=score; friend=q}
                // Gently repel neighbours so the screen stays lively.
                const personalSpace = 20 + p.radius + q.radius
                if (dist < personalSpace && dist > 0) {
                    const force = (personalSpace-dist)/personalSpace*.13 * p.speedScale
                    p.vx -= dx/dist*force
                    p.vy -= dy/dist*force
                }
            }
            if (friend) {
                const dx=friend.x-p.x, dy=friend.y-p.y
                const dist=Math.hypot(dx,dy)||1
                p.vx += dx/dist*.055*p.speedScale
                p.vy += dy/dist*.055*p.speedScale
            }
            p.vx += (Math.random()-.5)*.08*p.speedScale
            p.vy += (Math.random()-.5)*.08*p.speedScale
            p.vx *= .97; p.vy *= .97
            const speed=Math.hypot(p.vx,p.vy)
            const limit = 2.3 * p.speedScale
            if(speed>limit) {p.vx*=limit/speed; p.vy*=limit/speed}
            if (Math.hypot(p.vx, p.vy) > 0.03) p.radians = Math.atan2(p.vy, p.vx)
            p.x+=p.vx; p.y+=p.vy
            if(p.x<p.radius){p.x=p.radius;p.vx=Math.abs(p.vx)}
            if(p.x>width-p.radius){p.x=width-p.radius;p.vx=-Math.abs(p.vx)}
            if(p.y<p.radius){p.y=p.radius;p.vy=Math.abs(p.vy)}
            if(p.y>height-p.radius){p.y=height-p.radius;p.vy=-Math.abs(p.vy)}
        }
        const gone = new Set()
        for (let i=0;i<ps.length;i++) {
            const a=ps[i]
            if(gone.has(a))continue
            for(let j=i+1;j<ps.length;j++) {
                const b=ps[j]
                if(gone.has(b) || a.cool || b.cool)continue
                const dx=b.x-a.x,dy=b.y-a.y
                const dist=Math.hypot(dx,dy)
                if(dist >= a.radius+b.radius)continue
                const difference=this.hueDiff(a.hue,b.hue)
                if(difference < 18 && ps.length-gone.size>3) {
                    const total=a.mass+b.mass
                    a.x=(a.x*a.mass+b.x*b.mass)/total
                    a.y=(a.y*a.mass+b.y*b.mass)/total
                    a.vx=(a.vx*a.mass+b.vx*b.mass)/total
                    a.vy=(a.vy*a.mass+b.vy*b.mass)/total
                    a.radians=Math.atan2(a.vy,a.vx)
                    a.hue=this.mixHue(a.hue,b.hue)
                    a.mass=total
                    a.speedScale=(a.speedScale*(total-b.mass)+b.speedScale*b.mass)/total
                    a.radius=Math.min(34,8*Math.sqrt(total))
                    a.cool=25
                    a.hunger=0
                    gone.add(b)
                } else {
                    const blended=this.mixHue(a.hue,b.hue)
                    a.hue=(a.hue*.7+blended*.3)%360
                    b.hue=(b.hue*.7+blended*.3)%360
                    a.cool=b.cool=22
                    const nx=dx/(dist||1),ny=dy/(dist||1)
                    a.vx-=nx*.7*a.speedScale;a.vy-=ny*.7*a.speedScale
                    b.vx+=nx*.7*b.speedScale;b.vy+=ny*.7*b.speedScale
                }
            }
        }
        // Starved adults burst into a random number of unequal pieces.
        // Offspring masses sum to the parent's mass (last takes the remainder).
        const newborns = []
        let population = ps.length - gone.size
        for (const p of ps) {
            if (gone.has(p) || p.mass < 1.5 || p.hunger < 800) continue
            const maxPieces = Math.min(7, Math.floor(p.mass / .25), 400 - population + 1)
            if (maxPieces < 2) continue
            const count = 2 + Math.floor(Math.random() * (maxPieces - 1))
            const weights = Array.from({length: count}, () => .3 + Math.random() * 2)
            const weightSum = weights.reduce((a,b) => a+b,0)
            let remaining = p.mass
            const baseAngle = Math.random() * Math.PI * 2
            const offspring = []
            for (let i = 0; i < count; i++) {
                const childMass = i === count - 1 ? remaining : p.mass * weights[i] / weightSum
                remaining -= childMass
                // Radius represents mass, not a mass deduction.
                const childRadius = Math.max(2, Math.min(34, 8 * Math.sqrt(childMass)))
                const theta = baseAngle + i * 2 * Math.PI / count
                const offset = p.radius + childRadius + 2
                const child = new Point({
                    x: Math.max(childRadius, Math.min(width-childRadius, p.x + Math.cos(theta)*offset)),
                    y: Math.max(childRadius, Math.min(height-childRadius, p.y + Math.sin(theta)*offset)),
                    radius: childRadius
                })
                child.mass = childMass
                child.hue = Math.random() * 360
                child.vx = p.vx + Math.cos(theta) * .7
                child.vy = p.vy + Math.sin(theta) * .7
                child.speedScale = Math.max(.45, p.speedScale * .85)
                child.cool = 45
                child.hunger = 0
                child.radians = Math.atan2(child.vy, child.vx)
                offspring.push(child)
            }
            gone.add(p)
            newborns.push(...offspring)
            population += count - 1
        }
        if(gone.size || newborns.length) {
            // Keep the surviving Point objects and re-register dragging.
            const survivors=Array.from(ps).filter(p=>!gone.has(p))
            this.points=new PointList(...survivors, ...newborns)
            this.dragging.add(...newborns)
        }
    }
    draw(ctx) {
        this.clear(ctx)
        this.step()
        for(const p of this.points) {
            p.pen.indicator(ctx, {color:`hsl(${p.hue} 85% 65%)`, width: Math.max(2,p.radius/5)})
        }
    }
}
const stage=MainStage.go()
