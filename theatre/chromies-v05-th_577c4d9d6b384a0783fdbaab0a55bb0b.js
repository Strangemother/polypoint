/*
title: Chromies - Little Living World
files:
    head
    pointlist
    point
    ../point_src/stage.js
    mouse
    dragging
    stroke
---
228 colour creatures (28 large, 200 half-sized and slower) seek similar hues, blend on contact, and merge with close matches.
Drag them into each other to play genetic matchmaker. Big creatures that go 800 frames without merging burst into a random number of differently sized, random-coloured offspring while conserving mass.
*/
class MainStage extends Stage {
    canvas = 'playspace'
    randomGenes() {
        return {
            aggression: Math.random(),
            fear: Math.random(),
            speed: .55 + Math.random() * 1.1,
            turnRate: .025 + Math.random() * .24,
            curiosity: Math.random(),
            metabolism: .5 + Math.random(),
            longevity: .7 + Math.random() * .8
        }
    }
    inheritGenes(parent, other, weight=1) {
        const genes = {}
        for (const key of ['aggression','fear','speed','turnRate','curiosity','metabolism','longevity']) {
            const center = other ? parent[key]*weight + other[key]*(1-weight) : parent[key]
            const variation = key==='speed' ? .12 : key==='turnRate' ? .025 : key==='metabolism' || key==='longevity' ? .12 : .09
            const lo = key==='speed' ? .35 : key==='turnRate' ? .012 : key==='metabolism' ? .35 : key==='longevity' ? .5 : 0
            const hi = key==='speed' ? 2 : key==='turnRate' ? .38 : key==='metabolism' ? 1.8 : key==='longevity' ? 2 : 1
            genes[key] = Math.max(lo,Math.min(hi,center+(Math.random()+Math.random()-1)*variation))
        }
        return genes
    }
    initialiseLife(p) {
        p.energy = 65 + Math.random() * 35
        p.age = 0
        p.lifespan = Math.round(3000 * p.genes.longevity)
        p.maturity = 0
    }
    mounted() {
        this.points = new PointList()
        const cx = this.canvas.width / 2, cy = this.canvas.height / 2
        for (let i = 0; i < 28; i++) {
            const a = i * Math.PI * 2 / 28, r = 95 + (i % 6) * 25
            const p = new Point({x: cx + Math.cos(a)*r, y: cy + Math.sin(a)*r, radius: 4})
            p.genes = this.randomGenes()
            this.initialiseLife(p)
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
                radius: 2
            })
            p.genes = this.randomGenes()
            this.initialiseLife(p)
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
            p.age++
            const activity = Math.hypot(p.vx,p.vy)
            p.energy -= (.005 + activity * .004 + p.genes.aggression * .004) * p.genes.metabolism
            p.energy = Math.max(0,Math.min(150,p.energy))
            let friend = null, best = Infinity
            let threat = null, threatScore = 0
            for (const q of ps) {
                if (p === q) continue
                const dx=q.x-p.x, dy=q.y-p.y
                const dist=Math.hypot(dx,dy)||.001
                const hue=this.hueDiff(p.hue,q.hue)
                const danger = (q.radius / Math.max(1,p.radius)) * (q.genes ? q.genes.aggression : .5)
                const range = 18 + p.radius * 4 + 50*p.genes.fear
                if (danger > .45 && dist < range) {
                    const intensity = (range-dist)/range * danger
                    if (intensity > threatScore) {threatScore=intensity;threat=q}
                }
                const score = hue*3 + dist*.12 - p.genes.curiosity * (1 - Math.min(1,dist/180)) * 18
                if (score < best) {best=score; friend=q}
                // Gently repel neighbours so the screen stays lively.
                const personalSpace = 20 + p.radius + q.radius
                if (dist < personalSpace && dist > 0) {
                    const force = (personalSpace-dist)/personalSpace*.13 * p.speedScale * (1+.6*p.genes.fear)
                    p.vx -= dx/dist*force
                    p.vy -= dy/dist*force
                }
            }
            if (friend) {
                const dx=friend.x-p.x, dy=friend.y-p.y
                const dist=Math.hypot(dx,dy)||1
                const chase = .055*p.speedScale*(.35+1.5*p.genes.aggression)
                p.vx += dx/dist*chase
                p.vy += dy/dist*chase
            }
            if(threat && threat !== p) {
                const dx=p.x-threat.x,dy=p.y-threat.y
                const d=Math.hypot(dx,dy)||1
                const flee=.14*p.genes.fear*threatScore*p.speedScale
                p.vx+=dx/d*flee;p.vy+=dy/d*flee
            }
            p.vx += (Math.random()-.5)*.08*p.speedScale
            p.vy += (Math.random()-.5)*.08*p.speedScale
            p.vx *= .97; p.vy *= .97
            const speed=Math.hypot(p.vx,p.vy)
            const limit = 2.3 * p.speedScale * p.genes.speed
            if(speed>limit) {p.vx*=limit/speed; p.vy*=limit/speed}
            // Gene-limited steering: smooth, individual turns.
            if (Math.hypot(p.vx,p.vy) > .03) {
                const target=Math.atan2(p.vy,p.vx)
                if (!Number.isFinite(p.radians)) p.radians=target
                const delta=Math.atan2(Math.sin(target-p.radians),Math.cos(target-p.radians))
                p.radians+=Math.max(-p.genes.turnRate,Math.min(p.genes.turnRate,delta))
                const magnitude=Math.hypot(p.vx,p.vy)
                p.vx=Math.cos(p.radians)*magnitude
                p.vy=Math.sin(p.radians)*magnitude
            }
            p.x+=p.vx; p.y+=p.vy
            // Toroidal screen wrap. Reset the visual tail at the seam so it
            // doesn't draw a long line across the canvas.
            let wrapped = false
            if(p.x < -p.radius) {p.x=width+p.radius;wrapped=true}
            if(p.x > width+p.radius) {p.x=-p.radius;wrapped=true}
            if(p.y < -p.radius) {p.y=height+p.radius;wrapped=true}
            if(p.y > height+p.radius) {p.y=-p.radius;wrapped=true}
            if(wrapped) p.tail = null
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
                    a.genes=this.inheritGenes(a.genes,b.genes,a.mass/total)
                    a.energy=Math.min(150,a.energy+b.energy*.65)
                    a.lifespan=Math.round(3000*a.genes.longevity)
                    a.mass=total
                    a.speedScale=(a.speedScale*(total-b.mass)+b.speedScale*b.mass)/total
                    a.radius=Math.min(17,4*Math.sqrt(total))
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
            if (gone.has(p) || p.mass < 1.5 || p.hunger < 800 || p.energy < 25) continue
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
                const childRadius = Math.max(1, Math.min(17, 4 * Math.sqrt(childMass)))
                const theta = baseAngle + i * 2 * Math.PI / count
                const offset = p.radius + childRadius + 2
                const child = new Point({
                    x: Math.max(childRadius, Math.min(width-childRadius, p.x + Math.cos(theta)*offset)),
                    y: Math.max(childRadius, Math.min(height-childRadius, p.y + Math.sin(theta)*offset)),
                    radius: childRadius
                })
                child.genes = this.inheritGenes(p.genes)
                this.initialiseLife(child)
                child.energy = Math.max(10, p.energy/count)
                child.mass = childMass
                child.hue = (p.hue + (Math.random()+Math.random()-1)*12 + 360)%360
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
        // Older creatures gradually fade; exhaustion slows movement rather than
        // instantly deleting the entire population.
        for(const p of ps) {
            if(gone.has(p))continue
            if(p.age > p.lifespan) {
                p.energy -= .035 * p.genes.metabolism
            }
            if(p.energy <= 0 && p.age > 500) gone.add(p)
        }
        if(gone.size || newborns.length) {
            // Keep the surviving Point objects and re-register dragging.
            const survivors=Array.from(ps).filter(p=>!gone.has(p))
            this.points=new PointList(...survivors, ...newborns)
            this.dragging.add(...newborns)
        }
    }

    updateTail(p) {
        const count=7, spacing=Math.max(1.1,p.radius*.48)
        if(!p.tail) {
            const angle=p.radians||0
            p.tail=Array.from({length:count},(_,i)=>({x:p.x-Math.cos(angle)*spacing*(i+1),y:p.y-Math.sin(angle)*spacing*(i+1)}))
            p.swimPhase=Math.random()*Math.PI*2
        }
        const v=Math.hypot(p.vx,p.vy)
        p.swimPhase+=.09+Math.min(.22,v*.055)
        let leader=p
        const angle=p.radians||0
        for(let i=0;i<p.tail.length;i++) {
            const n=p.tail[i]
            let dx=n.x-leader.x,dy=n.y-leader.y,d=Math.hypot(dx,dy)
            if(d<.00001){dx=-Math.cos(angle);dy=-Math.sin(angle);d=1}
            const wave=Math.sin(p.swimPhase-i*.72)*(i+1)/count*Math.min(2.25,p.radius*.5)*Math.min(1,v/1.2)
            n.x+=(leader.x+dx/d*spacing-Math.sin(angle)*wave-n.x)*.55
            n.y+=(leader.y+dy/d*spacing+Math.cos(angle)*wave-n.y)*.55
            leader=n
        }
    }
    drawTail(ctx,p) {
        if(!p.tail)return
        ctx.save()
        ctx.strokeStyle='hsla('+p.hue+' 85% 67% / .82)'
        ctx.lineWidth=Math.max(.6,p.radius*.48)
        ctx.lineCap='round'; ctx.lineJoin='round'
        ctx.beginPath();ctx.moveTo(p.x,p.y)
        for(let i=0;i<p.tail.length-1;i++){
            const a=p.tail[i],b=p.tail[i+1]
            ctx.quadraticCurveTo(a.x,a.y,(a.x+b.x)/2,(a.y+b.y)/2)
        }
        const end=p.tail[p.tail.length-1]
        ctx.lineTo(end.x,end.y);ctx.stroke();ctx.restore()
    }
    draw(ctx) {
        this.clear(ctx)
        this.step()
        for(const p of this.points) {
            this.updateTail(p)
            this.drawTail(ctx,p)
            p.pen.indicator(ctx, {color:`hsl(${p.hue} 85% ${Math.max(33,65-(p.age/p.lifespan)*18)}%)`, width: Math.max(1,p.radius/5)})
        }
    }
}
const stage=MainStage.go()
