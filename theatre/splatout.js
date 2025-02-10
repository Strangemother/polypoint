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
        this.p.color = this.randomColor()

        this.microValue = this.clock.frameStepValue(1) // seconds
        this.backgroundColor = undefined; //this.randomColor()
    }


    onMousedown(e){
        /*
            Grab Point
            Animate To size.
            Then the new background color,
        */
        let p = Point.from(e).update({ radius: 5 })
        this.p = p
        p.color = this.randomColor()
        let width = this.dimensions.width * 1.5
        let easing = easingFunctions.get('sine', 'in')
        let st = this;
        let v = this.v = new Value(this.p.radius, width, easing)
        v.doneHandler = ()=>{
            // st.switchOut()
            this.nextTick(this.switchOut.bind(this))
        }

        this.microStep = 0
    }

    randomColor(){
        let deg = random.int(360)
        let sat = random.int(100)
        let lig = random.int(100)
        return `hsl(${deg}deg ${sat}% ${lig}%)`
    }

    switchOut() {
        console.log('doneHandler')
        let p = this.p
        this.v = undefined;

        this.backgroundColor = p.color

        // this.nextTick(
        setTimeout(()=>{
            // p.color = this.randomColor()
            // p.radius = 5
            // this.p.radius = 50
        }, 400)
    }

    step(){
        if(this.v) {
            let t = this.v.get(this.microStep)
            this.p.radius = t
        } else {
            // this.p.radius -= this.microValue * 30
        }

        this.microStep += this.microValue
    }

    draw(ctx){
        this.clear(ctx, this.backgroundColor)
        this.p.pen.fill(ctx)
        this.step()
        // this.p.pen.indicator(ctx)
    }
}


;stage = MainStage.go();