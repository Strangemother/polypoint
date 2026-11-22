/*
title: Chromie - Solo Swimmer from Friendly Little Worlds V34
files:
    head
    pointlist
    point
    ../point_src/stage.js
    ../point_src/keyboard.js

---

Call chromite.setIntent({speed:.7,angle:135,duration:180}) to steer from future AI.
*/

const overrideColor=undefined;

class Chromite {
    intentColor = 'cyan'
    exploreColor = '#999'
    constructor({x=200,y=200,hue=210,mass=1,genes={}}={}){
        const radians=Math.random()*Math.PI*2;
        const g={...Chromite.randomGenes(),...genes};
        g.curiosity=Math.max(.35,g.curiosity);
        this.point={
            x, y
            , hue
            , baseHue: hue
            , mass
            , radius: 4 * Math.sqrt(mass)
            , vx: Math.cos(radians) * .7
            , vy: Math.sin(radians) * .7
            , radians
            , speedScale: 1
            , energy: 100
            , age: 0
            , lifespan: Math.round(30000 * g.longevity)
            , genes: g
            , tail: null
            , swimPhase: Math.random() * Math.PI * 2
        };
        this.wanderHeading=radians;
        this.wanderTimer=0;
        this.intent=null;
    }

    static randomGenes() {
        return {
            aggression: Math.random(),
            fear: Math.random(),
            speed: .12 + Math.pow(Math.random(),.85) * 5.1,
            turnRate: .008 + Math.random() * .48,
            curiosity: Math.random(),
            metabolism: .25 + Math.random() * 1.85,
            longevity: 3.45 + Math.random() * 1.65,
            digestion: 0.35 + Math.random() * 1.45,
            sociability: Math.random()
        }
    }
    // angle: degrees from +X on screen, speed: normalized 0..1.
    setIntent({speed=.5,angle=0,duration=180}={}){
        if (![speed, angle, duration].every(Number.isFinite)) {
            throw new TypeError('speed, angle and duration must be finite numbers');

        }
        this.intent={
            speed:Math.max(0,Math.min(1,speed)),
            heading:angle*Math.PI/180,
            remaining:Math.max(1,Math.round(duration))
        };
    }

    clearIntent() {
        this.intent = null;
    }

    getSensors(){
        const p=this.point;
        return {
            x: p.x
            , y: p.y
            , angle: p.radians * 180 / Math.PI
            , speed: Math.hypot(p.vx, p.vy)
            , energy: p.energy
            , age: p.age
            , intentActive: Boolean(this.intent)
        };
    }
    update(dt=1,width=800,height=600){
        if (!(width > 0 && height > 0)) {
            return;
        }
        const p = this.point
            , g = p.genes
            , d = Math.max(0, Math.min(3, dt))
            ;
        p.age += d;
        const currentSpeed=Math.hypot(p.vx,p.vy);
        p.energy = Math.max(0,
                    Math.min(150, p.energy -(.005+currentSpeed*.004+g.aggression*.004)*g.metabolism*d/10)
                );
        const cruise = Math.max(.72, Math.min(1.30, .86 + .20 * Math.sqrt(Math.max(.05, p.mass))));
        const maxSpeed = 2.3 * p.speedScale * g.speed * .30 * cruise;

        if (this.intent) {
            this.point.hue = this.intentColor
            const cmd=this.intent;
            const desired=maxSpeed*cmd.speed;
            const steering=Math.min(1,.08*d);
            p.vx+=(Math.cos(cmd.heading)*desired-p.vx)*steering;
            p.vy+=(Math.sin(cmd.heading)*desired-p.vy)*steering;
            cmd.remaining-=d;
            if (cmd.remaining <= 0) {
                this.intent = null
            };
        }else{
            // V34 curiosity-driven solo exploration, with its gentle noise and damping.
            this.point.hue = this.exploreColor
            this.wanderTimer -= d;
            if (this.wanderTimer <= 0) {
                this.wanderHeading=Math.random()*Math.PI*2;
                this.wanderTimer=90+Math.random()*240;
            }

            const urge = .014 * g.curiosity * d;
            p.vx += Math.cos(this.wanderHeading) * urge + (Math.random() - .5) * .08 * d;
            p.vy += Math.sin(this.wanderHeading) * urge + (Math.random() - .5) * .08 * d;
            const damping = Math.pow(.97, d);

            p.vx *= damping;
            p.vy *= damping;
        }
        // V34 speed cap and genetically limited rate of turning.
        let speed=Math.hypot(p.vx,p.vy);
        if(speed>maxSpeed && speed>0){
            p.vx *= maxSpeed / speed;
            p.vy *= maxSpeed / speed;
            speed = maxSpeed;
        }
        if(speed>.03){
            const target=Math.atan2(p.vy,p.vx);
            const delta=Math.atan2(Math.sin(target-p.radians),Math.cos(target-p.radians));
            p.radians+=Math.max(-g.turnRate*d,Math.min(g.turnRate*d,delta));
            p.vx=Math.cos(p.radians)*speed;
            p.vy=Math.sin(p.radians)*speed;
        }
        p.x+=p.vx*d;p.y+=p.vy*d;
        let wrapped=false;
        if (p.x < -p.radius) {
            p.x = width + p.radius; wrapped = true
        }
        if (p.x > width + p.radius) {
            p.x = -p.radius; wrapped = true
        }
        if (p.y < -p.radius) {
            p.y = height + p.radius; wrapped = true
        }
        if (p.y > height + p.radius) {
            p.y = -p.radius; wrapped = true
        }
        if (wrapped) {
            p.tail = null
        };
    }
    updateTail(p) {
        const count = 7
            , spacing = Math.max(1.1, p.radius * .48)
            ;
        if (!p.tail) {
            const angle=p.radians||0
            p.tail = Array.from({ length: count }, (_, i) => (
                {
                    x: p.x - Math.cos(angle) * spacing * (i + 1)
                    , y: p.y - Math.sin(angle) * spacing * (i + 1)
                }
            ))
            p.swimPhase = Math.random() * Math.PI * 2
        }
        const v=Math.hypot(p.vx,p.vy)
        p.swimPhase+=.09+Math.min(.22,v*.055)
        let leader=p
        const angle=p.radians||0
        for(let i=0;i<p.tail.length;i++) {
            const n=p.tail[i]
            let dx = n.x - leader.x
                , dy = n.y - leader.y
                , d = Math.hypot(dx, dy)
                ;
            if (d < .00001) {
                dx = -Math.cos(angle); dy = -Math.sin(angle);
                d = 1
            }
            const wave = Math.sin(p.swimPhase - i * .72) * (i + 1) / count * Math.min(2.25, p.radius * .5) * Math.min(1, v / 1.2)

            n.x += (leader.x + dx / d * spacing - Math.sin(angle) * wave - n.x) * .55
            n.y += (leader.y + dy / d * spacing + Math.cos(angle) * wave - n.y) * .55
            leader = n

        }
    }
    drawTail(ctx,p) {
        if (!p.tail) {
            return
        }
        // ctx.save()
        let color = p.hue // 'hsla(' + p.hue + ' 85% 67% / .82)'

        ctx.strokeStyle = overrideColor? overrideColor: color
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round'
        let prev = {
            x: p.x
            , y: p.y
        }
        for(let i=0;i<p.tail.length;i++){
            const next = p.tail[i]
                , t = i / Math.max(1, p.tail.length - 1)
            ctx.lineWidth= 2//Math.max(.55,p.radius*(.82-.69*t))
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke()
            prev=next
        }
        // ctx.restore()
    }

    draw(ctx){
        const p=this.point;
        this.updateTail(p);
        this.drawTail(ctx,p);
        ctx.beginPath();
        ctx.arc(p.x,p.y,Math.max(.8,p.radius*.66),0,Math.PI*2);
        let color = p.hue // 'hsl('+p.hue+' 85% '+Math.max(33,65-(p.age/p.lifespan)*18)+'%)';
        ctx.strokeStyle = overrideColor ? overrideColor : color;
        // ctx.fillStyle = overrideColor ? overrideColor : color;
        ctx.stroke();
        // p.pen.indicator(ctx)
        // ctx.fill();
    }
}

class MainStage extends Stage {
    canvas='playspace'
    mounted(){
        this.chromite=new Chromite({
            x: this.canvas.width / 2
            , y: this.canvas.height / 2
            // , hue: 210
            , mass: 30
            , genes: {
                curiosity: 2.8,
                speed: 4.8,
                turnRate: .16
            }
        });
        // A public reference for future event-based orchestrators.
        window.chromite=this.chromite;
    }

    draw(ctx){
        this.clear(ctx);
        this.chromite.update(1,this.canvas.width,this.canvas.height);
        this.chromite.draw(ctx);
    }
}
const stage=MainStage.go();
