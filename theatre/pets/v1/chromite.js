/*
First version of the chromite is a swimming auto mover.
*/

const overrideColor=undefined;

class Chromite {
    intentColor = 'cyan'
    exploreColor = '#999'
    dragColor = 'orange'

    constructor({x=200,y=200,hue=210,mass=1,genes={}}={}){
        const radians=Math.random()*Math.PI*2;
        const g={...Chromite.randomGenes(),...genes};
        g.curiosity=Math.max(.35,g.curiosity);
        this.point=new Point({
            x, y
            , hue
            , baseHue: hue
            , mass
            , radius: 4 * Math.sqrt(mass)
            , vx: Math.cos(radians) * .7
            , vy: Math.sin(radians) * .7
            , modulusRotate: false
            , radians
            , speedScale: 1
            , energy: 100
            , age: 0
            , lifespan: Math.round(30000 * g.longevity)
            , genes: g
            , swimPhase: Math.random() * Math.PI * 2
        });

        this.point.tail = PointList.from(
            Array.from({length: 7}, () => new Point({x, y}))
        );
        this.resetTail(this.point);
        this.point.onMousedown = this.pointMouseDown.bind(this)
        this.point.onMouseup = this.pointMouseUp.bind(this)
        this.point.onScreenWrapChange = () => {
            this.resetTail(this.point);
            this.point.swimPhase = Math.random() * Math.PI * 2;
        };
        this.wanderHeading=radians;
        this.wanderTimer=0;
        this.intent=null;
    }
    pointMouseDown() {
        this.isDragging = true;
    }
    pointMouseUp() {
        this.isDragging = false;
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

    getColor() {
        if (this.isDragging) {
            return this.dragColor;
        }

        if (this.intent) {
            return this.intentColor
        }

        return this.exploreColor
    }
    
    update(dt=1){
        
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
            
            this.wanderTimer -= d;
            if (this.wanderTimer <= 0) {
                this.wanderHeading=Math.random()*Math.PI*2;
                this.wanderTimer=90+Math.random()*240;
            }
            
            this.point.hue = this.getColor()        

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
        p.x+=p.vx*d;
        p.y+=p.vy*d;
        this.updateTail(p);
    }
    resetTail(p) {
        const spacing = Math.max(1.1, p.radius * .48)
            , angle = p.radians || 0
            ;
        p.tail.forEach((point, i) => {
            point.x = p.x - Math.cos(angle) * spacing * (i + 1);
            point.y = p.y - Math.sin(angle) * spacing * (i + 1);
        });
    }
    updateTail(p) {
        const count = p.tail.length
            , spacing = Math.max(1.1, p.radius * .48)
            ;
        const v=Math.hypot(p.vx,p.vy)
        /*
        v: the chromite’s current speed.
        .09: base phase advance per update, in radians.
        .055: how much speed increases the phase advance.
        .22: cap on that speed contribution.
        */
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
        let color = p.hue // 'hsla(' + p.hue + ' 85% 67% / .82)'
        p.tail.pen.quadCurve(ctx, {color, lineWidth: 2})
    }

    draw(ctx){
        const p=this.point;
        this.drawTail(ctx,p);

        const color = p.hue;
        p.pen.indicator(ctx, {color, width: 2});

        this.drawIntentRing(ctx)
    }

    drawIntentRing(ctx) {
        /*
            intent={
                speed:Math.max(0,Math.min(1,speed)),
                heading:angle*Math.PI/180,
                remaining:Math.max(1,Math.round(duration))
            };
        */
        const p = this.point;
        if (!this.intent) return;
        const {speed, heading, remaining} = this.intent;
        
        // p.lookAt = heading
        // draw intent ring based on speed and heading
        let ringR = p.radius + (10 * speed * 2)
        // p.pen.circle(ctx, ringR, 'red', 2)
        // p.project(ringR * (speed * 1.1)).pen.circle(ctx, 4, 'white', 2)
        // p.radians = heading
        p.project(ringR * (speed * 1.1)).pen.circle(ctx, 4, 'yellow', 1)
        
    }

    perform(ctx, d){
        this.update(d)
        this.draw(ctx)
    }
}
