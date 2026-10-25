/*
title: Chromies - Double Sprint V29
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
            speed: .12 + Math.pow(Math.random(),.85) * 5.1,
            turnRate: .008 + Math.random() * .48,
            curiosity: Math.random(),
            metabolism: .25 + Math.random() * 1.85,
            longevity: .45 + Math.random() * 1.65,
            digestion: .55 + Math.random() * 1.45,
            sociability: Math.random()
        }
    }
    inheritGenes(parent, other, weight=1) {
        const genes = {}
        for (const key of ['aggression','fear','speed','turnRate','curiosity','metabolism','longevity','digestion','sociability']) {
            const center = other ? parent[key]*weight + other[key]*(1-weight) : parent[key]
            const variation = key==='speed' ? 1.25 : key==='turnRate' ? .085 : key==='metabolism' || key==='longevity' || key==='digestion' ? .28 : .25
            const lo = key==='speed' ? .12 : key==='turnRate' ? .008 : key==='metabolism' ? .25 : key==='longevity' ? .45 : key==='digestion' ? .55 : 0
            const hi = key==='speed' ? 5.2 : key==='turnRate' ? .5 : key==='metabolism' ? 2.1 : key==='longevity' ? 2.1 : key==='digestion' ? 2 : 1
            const roll=Math.random()
            const candidate=roll<.22 ? lo+Math.random()*(hi-lo) : center+(Math.random()+Math.random()-1)*variation*(roll<.5?2:1)
            genes[key]=Math.max(lo,Math.min(hi,candidate))
        }
        return genes
    }
    initialiseLife(p) {
        p.energy = 65 + Math.random() * 35
        p.age = 0
        p.lifespan = Math.round(3000 * p.genes.longevity)
        p.maturity = 0
        p.digestTimer = 0
    }
    makeFood(x,y,mass=.25,hue=null) {
        this.nutrients.push({x,y,mass,hue,vx:(Math.random()-.5)*.32,vy:(Math.random()-.5)*.32,phase:Math.random()*6.283})
    }
    recycle(p) {
        const count=Math.max(1,Math.min(6,Math.ceil(p.mass/.25)))
        for(let i=0;i<count;i++)this.makeFood(p.x+(Math.random()-.5)*10,p.y+(Math.random()-.5)*10,p.mass/count,p.hue)
    }
    // A brief, distance-fading splash of momentum when a creature bursts.
    popShockwave(source, strength=1) {
        const radius=56+Math.min(105,source.radius*5);
        // An expanding pressure front, not an instantaneous teleport.
        this.shockwaves.push({x:source.x,y:source.y,r:0,radius,strength,age:0,duration:13});
        this.ripples.push({x:source.x,y:source.y,r:3,life:17,maxLife:17});
    }
    advanceShockwaves() {
        const w=this.canvas.width,h=this.canvas.height;
        for(const wave of this.shockwaves) {
            const previous=wave.r;
            wave.age++;
            wave.r=wave.radius*Math.min(1,wave.age/wave.duration);
            for(const p of this.points) {
                const dx=((p.x-wave.x+w*1.5)%w)-w*.5;
                const dy=((p.y-wave.y+h*1.5)%h)-h*.5;
                let d=Math.hypot(dx,dy);
                // The pressure arrives as the expanding front passes each creature.
                if(d>previous && d<=wave.r+5) {
                    const theta=d<.001?Math.random()*Math.PI*2:Math.atan2(dy,dx);
                    const near=1-Math.min(1,d/wave.radius);
                    const shove=(5+Math.pow(near,1.2)*33)*wave.strength;
                    p.knockX=(p.knockX||0)+Math.cos(theta)*shove*.14;
                    p.knockY=(p.knockY||0)+Math.sin(theta)*shove*.14;
                }
            }
        }
        this.shockwaves=this.shockwaves.filter(w=>w.age<w.duration);
    }
    driftFood() {
        const w=this.canvas.width,h=this.canvas.height
        for(const f of this.nutrients){
            f.phase+=.012
            f.vx=Math.max(-.36,Math.min(.36,f.vx*.985+Math.sin(f.phase)*.002+(Math.random()-.5)*.006))
            f.vy=Math.max(-.36,Math.min(.36,f.vy*.985+Math.cos(f.phase*.83)*.002+(Math.random()-.5)*.006))
            f.x=(f.x+f.vx+w)%w
            f.y=(f.y+f.vy+h)%h
        }
    }
    germinate() {
        if(this.points.length>=8 || !this.nutrients.length)return
        if(this.points.length>0 && Math.random()>.04)return
        const f=this.nutrients.shift()
        const p=new Point({x:f.x,y:f.y,radius:Math.max(1,4*Math.sqrt(f.mass))})
        p.genes=this.randomGenes()
        this.initialiseLife(p)
        p.energy=40
        p.mass=f.mass
        p.hue=Math.floor(Math.random()*12)*30
        p.vx=(Math.random()-.5)*.7;p.vy=(Math.random()-.5)*.7
        p.speedScale=1;p.cool=60;p.hunger=0
        this.points.push(p);this.dragging.add(p)
    }
    addChromies() {
        // Introduce genuinely new arrivals, with fresh colours and independently rolled genes.
        // Stay inside the existing simulation's 400-creature population ceiling.
        const available=Math.max(0,400-this.points.length);
        const count=Math.min(available,3+Math.floor(Math.random()*4));
        const w=this.canvas.width,h=this.canvas.height;
        const newcomers=[];
        for(let i=0;i<count;i++){
            const mass=.25+Math.random()*.75;
            const radius=4*Math.sqrt(mass);
            const a=Math.random()*Math.PI*2;
            const p=new Point({
                x:radius+Math.random()*Math.max(1,w-2*radius),
                y:radius+Math.random()*Math.max(1,h-2*radius),
                radius
            });
            p.mass=mass;
            p.genes=this.randomGenes();
            this.initialiseLife(p);
            p.hue=Math.random()*360;
            p.vx=Math.cos(a)*(.35+Math.random()*.8);
            p.vy=Math.sin(a)*(.35+Math.random()*.8);
            p.radians=a;
            p.speedScale=1;
            p.cool=45;
            p.hunger=0;
            newcomers.push(p);
        }
        if(newcomers.length){
            this.points.push(...newcomers);
            this.dragging.add(...newcomers);
        }
    }
    sprinkleFood(x,y,amount=14) {
        const w=this.canvas.width,h=this.canvas.height
        for(let i=0;i<amount;i++){
            const angle=Math.random()*Math.PI*2
            const radius=Math.sqrt(Math.random())*32
            const fx=(x+Math.cos(angle)*radius+w)%w
            const fy=(y+Math.sin(angle)*radius+h)%h
            this.makeFood(fx,fy,.12)
        }
    }
    mounted() {
        const self=this
        addButton('Sprinkle food', {
            onclick(){
                const w=self.canvas.width,h=self.canvas.height
                self.sprinkleFood(w*(.2+Math.random()*.6),h*(.2+Math.random()*.6))
            }
        })

        addButton('Add Chromies (3–6)', {
            onclick(){ self.addChromies(); }
        })
        this.points = new PointList()
        this.nutrients = []
        this.ripples = []
        this.shockwaves = []
        for(let i=0;i<80;i++)this.makeFood(Math.random()*this.canvas.width,Math.random()*this.canvas.height,.25)
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
            p.speedScale = 1
            this.points.push(p)
        }
        this.dragging.add(...this.points)
    }
    hueDiff(a,b) {
        const d = Math.abs(a-b)%360
        return Math.min(d, 360-d)
    }
    wheelStep(a,b,fraction=.5) {
        const arc=((b-a+540)%360)-180;
        return (a+arc*fraction+360)%360;
    }
    mixHue(a,b) {
        const x = Math.cos(a*Math.PI/180)+Math.cos(b*Math.PI/180)
        const y = Math.sin(a*Math.PI/180)+Math.sin(b*Math.PI/180)
        return (Math.atan2(y,x)*180/Math.PI+360)%360
    }
    wrapDelta(a,b,size) {
        return ((b-a+size*1.5)%size)-size*.5;
    }
    step() {
        const ps = this.points
        const width = this.canvas.width, height = this.canvas.height
        this.driftFood()
        this.advanceShockwaves()
        for (const p of ps) {
            if (p.cool > 0) p.cool--
            if (p.digestTimer > 0) p.digestTimer--
            p.hunger = (p.hunger || 0) + 1
            p.age++
            const activity = Math.hypot(p.vx,p.vy)
            p.energy -= (.005 + activity * .004 + p.genes.aggression * .004) * p.genes.metabolism
            p.energy = Math.max(0,Math.min(150,p.energy))
            const mates=[]; let friend = null, best = Infinity
            let threat = null, threatScore = 0
            for (const q of ps) {
                if (p === q) continue
                const dx=this.wrapDelta(p.x,q.x,width), dy=this.wrapDelta(p.y,q.y,height)
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
                if(hue<35 && dist<175 && p.genes.sociability>.12) {
                    mates.push({q,score:dist + hue*.7});
                }
                // Gently repel neighbours so the screen stays lively.
                const personalSpace = 20 + p.radius + q.radius
                if (dist < personalSpace && dist > 0) {
                    const force = (personalSpace-dist)/personalSpace*.13 * p.speedScale * (1+.6*p.genes.fear)
                    p.vx -= dx/dist*force
                    p.vy -= dy/dist*force
                }
            }
            // Starving swimmers become opportunistic: any colour, any size.
            const desperation=Math.pow(Math.max(0,Math.min(1,(90-p.energy)/90)),2);
            const desperate=p.energy<35;
            // Stay committed unless a clearly better-sized meal appears.
            if(p.digestTimer<=0 && p.energy<90 && this.nutrients.length){
                const quality=(f)=>{
                    const dx=this.wrapDelta(p.x,f.x,width),dy=this.wrapDelta(p.y,f.y,height);
                    const dist=Math.hypot(dx,dy);
                    return dist<=(desperate?300:160) ? (desperate ? 1/(12+dist) : Math.pow(Math.max(.02,f.mass),.65+Math.min(1.35,p.mass*.18))/(24+dist)) : 0;
                };
                let bestFood=null,bestScore=0;
                for(const f of this.nutrients){
                    const score=quality(f);
                    if(score>bestScore){bestFood=f;bestScore=score;}
                }
                const current=p.foodTarget;
                const currentScore=current&&this.nutrients.includes(current)?quality(current):0;
                if(!currentScore || (p.foodCommit||0)<=0 ||
                   (bestFood!==current && bestScore>currentScore*1.65)){
                    p.foodTarget=bestFood;
                    p.foodCommit=24+Math.floor(Math.random()*17);
                }
                p.foodCommit--;
                const food=p.foodTarget;
                if(food){
                    const dx=this.wrapDelta(p.x,food.x,width),dy=this.wrapDelta(p.y,food.y,height);
                    const dist=Math.hypot(dx,dy)||1;
                    if(dist<(desperate?300:160)){
                        const hunger=(90-p.energy)/90;
                        const drive=.025+.16*desperation;
                        p.vx+=dx/dist*drive*p.speedScale;
                        p.vy+=dy/dist*drive*p.speedScale;
                    }
                }
            } else {
                p.foodTarget=null;p.foodCommit=0;
            }
            // Desperate creatures without a reachable meal explore rather
            // than drifting to a halt. A persistent heading avoids jitter.
            if(desperate && !p.foodTarget){
                if(!Number.isFinite(p.wanderHeading) || (p.wanderTimer||0)<=0){
                    p.wanderHeading=Math.random()*Math.PI*2;
                    p.wanderTimer=45+Math.floor(Math.random()*75);
                }
                p.wanderTimer--;
                const urge=(.025+.09*desperation)*p.speedScale;
                p.vx+=Math.cos(p.wanderHeading)*urge;
                p.vy+=Math.sin(p.wanderHeading)*urge;
            }
            if(!desperate && mates.length && p.genes.sociability>.12) {
                // Duckies-style local cohesion: seek the centre of 2-3 similar neighbours.
                mates.sort((a,b)=>a.score-b.score);
                const n=Math.min(mates.length,p.genes.sociability>.55?3:2);
                let dx=0,dy=0,ax=0,ay=0;
                for(let i=0;i<n;i++){
                    const q=mates[i].q;
                    dx+=((q.x-p.x+width*1.5)%width)-width*.5;
                    dy+=((q.y-p.y+height*1.5)%height)-height*.5;
                    ax+=q.vx;ay+=q.vy;
                }
                dx/=n;dy/=n;ax/=n;ay/=n;
                const dist=Math.hypot(dx,dy)||1;
                const pull=.025+.07*p.genes.sociability;
                p.vx+=dx/dist*pull*p.speedScale + (ax-p.vx)*.015*p.genes.sociability;
                p.vy+=dy/dist*pull*p.speedScale + (ay-p.vy)*.015*p.genes.sociability;
            } else if (!desperate && friend) {
                const dx=this.wrapDelta(p.x,friend.x,width), dy=this.wrapDelta(p.y,friend.y,height);
                const dist=Math.hypot(dx,dy)||1;
                const chase=.055*p.speedScale*(.35+1.5*p.genes.aggression);
                p.vx+=dx/dist*chase;p.vy+=dy/dist*chase;
            }
            if(threat && threat !== p) {
                const dx=-this.wrapDelta(p.x,threat.x,width),dy=-this.wrapDelta(p.y,threat.y,height)
                const d=Math.hypot(dx,dy)||1
                const flee=.14*p.genes.fear*threatScore*p.speedScale
                p.vx+=dx/d*flee;p.vy+=dy/d*flee
            }
            p.vx += (Math.random()-.5)*.08*p.speedScale
            p.vy += (Math.random()-.5)*.08*p.speedScale
            p.vx *= .97; p.vy *= .97
            const speed=Math.hypot(p.vx,p.vy)
            // Individual maximum remains genetic; desperation gradually unlocks it.
            // Baseline is 30% of genetic speed; hunger raises it to 60% (2x baseline).
            const limit = 2.3 * p.speedScale * p.genes.speed * (.30+.30*desperation)
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
            p.x+=p.vx+(p.knockX||0);
            p.y+=p.vy+(p.knockY||0);
            p.knockX=(p.knockX||0)*.88;
            p.knockY=(p.knockY||0)*.88;
            if(Math.abs(p.knockX)<.015)p.knockX=0;
            if(Math.abs(p.knockY)<.015)p.knockY=0
            // Toroidal screen wrap. Reset the visual tail at the seam so it
            // doesn't draw a long line across the canvas.
            let wrapped = false
            if(p.x < -p.radius) {p.x=width+p.radius;wrapped=true}
            if(p.x > width+p.radius) {p.x=-p.radius;wrapped=true}
            if(p.y < -p.radius) {p.y=height+p.radius;wrapped=true}
            if(p.y > height+p.radius) {p.y=-p.radius;wrapped=true}
            if(wrapped) p.tail = null
        }
        const eaten = new Set()
        for(const p of ps){
            if(p.digestTimer > 0)continue
            for(const f of this.nutrients){
                if(eaten.has(f))continue
                const dx=Math.abs(f.x-p.x),dy=Math.abs(f.y-p.y)
                if(Math.hypot(Math.min(dx,width-dx),Math.min(dy,height-dy))<p.radius+2){
                    eaten.add(f)
                    if(Number.isFinite(f.hue)) {
                        const difference=((f.hue-p.hue+540)%360)-180;
                        p.hue=this.wheelStep(p.hue,f.hue,.38);
                    }
                    p.mass+=f.mass
                    p.radius=Math.min(17,4*Math.sqrt(p.mass))
                    p.energy=Math.min(150,p.energy+Math.max(8,f.mass*45))
                    p.hunger=0
                    // Genetic digestion time, measured in frames. One meal per digestive cycle.
                    p.digestTimer=Math.round(35+90*p.genes.digestion)
                    break
                }
            }
        }
        if(eaten.size)this.nutrients=this.nutrients.filter(f=>!eaten.has(f))
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
                    a.speedScale=1
                    a.radius=Math.min(17,4*Math.sqrt(total))
                    a.cool=25
                    a.hunger=0
                    a.digestTimer=Math.max(a.digestTimer||0,b.digestTimer||0)
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
            const maxPieces = Math.min(10, Math.floor(p.mass / .20), 400 - population + 1)
            if (maxPieces < 2) continue
            const baseCount = 2 + Math.floor(Math.random()*Math.max(1,Math.min(7,Math.floor(p.mass/.25))-1))
            const count = Math.max(2,Math.min(maxPieces,Math.round(baseCount*1.3)))
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
                child.hue = Math.random()<.65 ? Math.random()*360 : this.wheelStep(p.hue,(p.hue+(Math.random()+Math.random()-1)*300+360)%360,.85)
                child.vx = p.vx + Math.cos(theta) * .7
                child.vy = p.vy + Math.sin(theta) * .7
                child.speedScale = 1
                child.cool = 45
                child.hunger = 0
                child.radians = Math.atan2(child.vy, child.vx)
                offspring.push(child)
            }
            this.popShockwave(p,Math.min(1.35,.7+p.mass*.09))
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
            if(p.energy <= 0 && p.age > 500) {this.popShockwave(p,.65);gone.add(p);this.recycle(p)}
        }
        if(gone.size || newborns.length) {
            // Keep the surviving Point objects and re-register dragging.
            const survivors=Array.from(ps).filter(p=>!gone.has(p))
            this.points=new PointList(...survivors, ...newborns)
            this.dragging.add(...newborns)
        }
        this.germinate()
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
        ctx.lineCap='round';ctx.lineJoin='round'
        let prev={x:p.x,y:p.y}
        for(let i=0;i<p.tail.length;i++){
            const next=p.tail[i],t=i/Math.max(1,p.tail.length-1)
            ctx.lineWidth=Math.max(.55,p.radius*(.82-.69*t))
            ctx.beginPath();ctx.moveTo(prev.x,prev.y);ctx.lineTo(next.x,next.y);ctx.stroke()
            prev=next
        }
        ctx.restore()
    }
    draw(ctx) {
        this.clear(ctx)
        this.step()
        ctx.save()
        for(const ring of this.ripples){
            const alpha=ring.life/ring.maxLife;
            ctx.beginPath();ctx.arc(ring.x,ring.y,ring.r,0,Math.PI*2);
            ctx.strokeStyle='rgba(140,185,220,'+(.3*alpha)+')';
            ctx.lineWidth=1.5*alpha;ctx.stroke();
            ring.r+=2.6;ring.life--;
        }
        this.ripples=this.ripples.filter(r=>r.life>0)
        ctx.restore()
        ctx.save()
        for(const f of this.nutrients){
            const r=Math.max(1.2,Math.min(3,2*Math.sqrt(f.mass/.25)))
            ctx.fillStyle=Number.isFinite(f.hue)?`hsla(${f.hue} 65% 35% / .85)`:'rgba(32,40,53,.8)'
            ctx.beginPath();ctx.arc(f.x,f.y,r,0,Math.PI*2);ctx.fill()
            ctx.fillStyle=Number.isFinite(f.hue)?`hsla(${f.hue} 80% 70% / .65)`:'rgba(95,107,120,.55)'
            ctx.beginPath();ctx.arc(f.x-.35,f.y-.45,.5,0,Math.PI*2);ctx.fill()
        }
        ctx.restore()
        for(const p of this.points) {
            this.updateTail(p)
            this.drawTail(ctx,p)
            ctx.beginPath()
            ctx.arc(p.x,p.y,Math.max(.8,p.radius*.66),0,Math.PI*2)
            ctx.fillStyle=`hsl(${p.hue} 85% ${Math.max(33,65-(p.age/p.lifespan)*18)}%)`
            ctx.fill()
        }
    }
}
const stage=MainStage.go()
