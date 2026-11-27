/*
title: Chromie 1
files:
    head
    pointlist
    point
    ../point_src/stage.js
    ../point_src/random.js
    ../point_src/keyboard.js
    stroke
    dragging
    mouse
    ../point_src/screenwrap.js
    ../theatre/pets/v1/chromite.js
    ../theatre/pets/v1/gamepad_monitor.js
    ../theatre/pets/v1/gamepad_stage.js
---
*/

class StateChromite extends Chromite {
    // state = 'born'
    age = -1
    _state = 'unborn'
    health = 100
    _alive = false
    
    set alive(v) {
        this._alive = v
        if (v) {
            this.exploreColor = '#990000'
            this.autoWander = true
        }
        
    }

    get alive() {
        return this._alive
    }

    set state(v) {
        // on set.
        this._state = v.toLowerCase();
        let f = this[`on_${this._state}`]
        if (f) {
            f.call(this)
        }
    }

    get state() {
        return this._state
    }

    on_born() {
        console.log('born')
        this.setMany({
            age: 0
            , lifeDate: +Date
        })
    }

    setMany(d) {
        for (let k in d) {
            this[k] = d[k]
        }
    }

    perform(ctx, dt = 1) {

        // super.perform(ctx, dt)
        this.update(dt)
        this.draw(ctx)

        if (this.alive) {
            this.age += (.1 * dt)
            this.point.pen.circle(ctx, this.point.radius + 100, '#111')
        }
    }

    digest(pointItem) {
        console.log('Digest')
        this.health += ~~pointItem.radius
    }

    pointMouseDown() {
        super.pointMouseDown()
        if (!this.alive) {
            this.alive = true
        }
        this.isDragging = true;
    }
}



addWidget('multi', {
    fields: {
        age: { value: 0 }
        , health: { value: 0 }
        // , charlie: { value: 0 }
    }
})


class MainStage extends GamepadStage {
    canvas='playspace'

    mounted(){
        super.mounted()
        this.rightTriggerValue = 0;
        this.defaultSpeed = .3;
        this.dTick = 0
        
        let chr = this.newChromite()
        window.chromite = this.chromite = chr;
        this.chromite2 = this.newChromite({
            exploreColor: '#444'
        })
        this.dragging.add(chr.point,this.chromite2.point)
    }

    newChromite(o){
        let center = this.center.xy
        let chr = new StateChromite(Object.assign({
            x: center.x
            , y: center.y
            // , hue: 210
            , mass: .5
            , genes: {
                curiosity: 0,
                speed: 1,
                turnRate: .3
            }
        }, o));
        return chr;
    }

    firstDraw(ctx){
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }

    onEmptyDown(e){
        console.log(e)
        this.focusPoint = Point.from(e)
        this.startFocusComplete(this.focusPoint)
    }

    startFocusComplete(focul, timeout=400){
        clearTimeout(this.focusTimer)

        let cs = [this.chromite, this.chromite2]

        cs.forEach(c => {
            let rads = radiansToDegrees(c.point.directionTo(focul))
            // timeout is ms, duration is frames.
            // calc
            const intent = {
                speed: 4
                , angle: rads
                , duration: (60 * (timeout * .001))
            }

            c.setIntent(intent);
        })

        this.focusTimer = setTimeout(()=>this.checkFocusComplete(focul), timeout)
    }

    checkFocusComplete(focul){
        let cs = [this.chromite, this.chromite2]
        let hit = false;
        cs.forEach(c => {
            let cp = c.point;
            if(cp.distanceTo(focul) < (cp.radians * 2 + focul.radians * 2)) {
                this.digest(cp, focul)
                hit = true
            } else {
            }
        })
        if (!hit) {
            this.startFocusComplete(focul)
        }
    }

    digest(cp, focul) {
        this.focusPoint = null;
        clearTimeout(this.focusTimer)
        this.chromite.digest(focul)
    }

    onRightTrigger(input){
        this.rightTriggerValue = input.value;
        let speed = this.defaultSpeed
        if(input.value !== 0) {
            speed = input.value
        }
        this.updateControllerIntent({ speed });
    }

    onLeftStick(input){
        if (Math.hypot(input.x, input.y) === 0) { return };
        const angle = Math.atan2(input.y, input.x) * 180 / Math.PI;
        this.updateControllerIntent({angle});
    }

    updateControllerIntent({speed, angle}){
        const intent = this.chromite.intent;
        let defaultSpeed = this.defaultSpeed;
        if(this.rightTriggerValue !== 0) {
            defaultSpeed = this.rightTriggerValue;
        }

        if(angle == undefined) {
            angle = (intent?.heading ?? this.chromite.point.radians) * 180 / Math.PI
        }

        if(speed == undefined){
             speed = intent?.speed ?? defaultSpeed;
        }

        this.chromite.setIntent({
             speed
            , angle
            , duration: 150
        });
    }

    draw(ctx){
        this.clear(ctx);
        if (this.gamepadFrame++ % 4 === 0){
            this.gamepad.update()
        };

        let fp = this.focusPoint;
        if (fp) {
            // food drop item.
            fp.pen.circle(ctx, 5, 'pink')
        }

        let chr = this.chromite;
        this.screenWrap.performMany([chr.point, this.chromite2.point]);

        if(fp) {
            let cp = chr.point;
            let focul = fp;
            let target = (cp.radius * 2) + (focul.radius * 2)
            let dis = cp.distanceTo(focul)
            // console.log(dis.toFixed(2), target.toFixed(2))
            if(dis < target) {
                this.digest(cp, focul)
            }
        }
        // chr.update(1);
        // chr.draw(ctx);
        chr.perform(ctx, 1);
        this.chromite2.perform(ctx)

        if (this.dTick++ % 10 == 0){
            updateWidgetValues('multi', {
                age: ~~(chr.age) 
                , health: chr.health
                // , charlie: random.float(-1, 1).toFixed(3)
            })
        }
        // this.dTick += 1

    }
}

const stage=MainStage.go();
