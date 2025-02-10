/*
---
title: Splatout
files:
    head
    point
    pointlist
    mouse
    stage
    stroke
    dragging
    ../point_src/random.js
    ../point_src/stage-clock.js
    ../point_src/easing.js
    ../point_src/iter/lerp.js
---

*/
class MainStage extends Stage {
    canvas='playspace'
    // live=false
    mounted(){
        this.p = this.center.copy()
        this._lastP = undefined
        this.p.color = random.color()

        this.microValue = this.clock.frameStepValue(1) // seconds
        this.backgroundColor = undefined; //this.randomColor()
    }


    onMousedown(e){
        /*
            Grab Point
            Animate To size.
            Then the new background color,
        */
        this._lastP = this.p
        let p = Point.from(e).update({ radius: 1 })
        this.p = p
        p.color = random.color()
        let width = this.dimensions.width * 1.5
        let easing = easingFunctions.get('sine', 'in')
        let st = this;
        let v = this.v = new Value(this.p.radius, width, easing)
        v.doneHandler = ()=>{
            this.nextTick(this.switchOut.bind(this))
        }

        this.microStep = 0
    }

    switchOut() {
        console.log('doneHandler')
        let p = this.p
        this.v = undefined;
    }

    step(){
        if(this.v) {
            this.p.radius = this.v.get(this.microStep)
        }
        this.microStep += this.microValue
    }

    draw(ctx){
        this.clear(ctx)
        this.step()
        this._lastP && this._lastP.pen.fill(ctx)
        this.p.pen.fill(ctx)
    }
}


;stage = MainStage.go();