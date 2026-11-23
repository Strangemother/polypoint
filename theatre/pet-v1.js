/*
title: Chromie - Solo Swimmer from Friendly Little Worlds V34
files:
    head
    pointlist
    point
    ../point_src/stage.js
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


class MainStage extends GamepadStage {
    canvas='playspace'

    mounted(){
        super.mounted()
        this.rightTriggerValue = 0;
        this.defaultSpeed = .3;

        let chr = this.newChromite()
        window.chromite = this.chromite = chr;

        this.dragging.add(chr.point)
    }

    newChromite(){
        let center = this.center.xy 
        let chr = new Chromite({
            x: center.x
            , y: center.y
            // , hue: 210
            , mass: 2
            , genes: {
                curiosity: 1,
                speed: 5,
                turnRate: .1
            }
        });
        return chr;
    }
3
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
        let rads = radiansToDegrees(this.chromite.point.directionTo(focul))
        // timeout is ms, duration is frames.
        // calc 
        
        this.chromite.setIntent({
             speed: 4
            , angle: rads
            , duration: (60 * (timeout * .001))
        });

        this.focusTimer = setTimeout(()=>this.checkFocusComplete(focul), timeout)
    }

    checkFocusComplete(focul){
        let cp = this.chromite.point;
        if(cp.distanceTo(focul) < (cp.radians * 2 + focul.radians * 2)) {
            this.digest(cp, focul)
        } else {
            this.startFocusComplete(focul)
        }
    }

    digest(cp, focul) {
        console.log('digested', cp, focul)
        this.focusPoint = null;
        clearTimeout(this.focusTimer)
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
        if(fp) {
            fp.pen.circle(ctx, 5)
        }

        let chr = this.chromite;
        this.screenWrap.performMany([chr.point]);
        
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

    }
}

const stage=MainStage.go();
