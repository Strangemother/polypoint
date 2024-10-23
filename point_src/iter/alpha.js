class Iter {

    constructor(v=0, speed=.1, width=100, fixed=undefined, clamp=false) {
        this.origin = v
        this.value = v

        this.speed = speed
        this.width = width
        this.fixed = fixed
        this.clamp = clamp
    }

    tick(value) {
        this.origin = value
        this.step()
    }

    step(tick) {
        this.value = this.update(this.origin+tick)
        return this.value
    }

    update(value) {
        let v = value == undefined? this.origin: value;
        let swingSpeed = this.speed;
        let swingDegrees = this.width;
        let deltaSwing = Math.sin( (v * swingSpeed) % 360) * swingDegrees
        let r = this.origin + deltaSwing
        if(this.clamp && r < 0) {
            return 0
        }

        return this.fixed == undefined? r: Number(r.toFixed(this.fixed))
    }

    [Symbol.toPrimitive](hint){

        // return this.value;

        let o = {
            'number': ()=>this.value
            , 'string': ()=>this.value
            // Upon operator (+)
            , 'default': ()=>this.value
        }

        let f = o[hint]
        f = (f == undefined)? f=()=>this:f

        return f()
    }
}

/* A LerpValue provides a number between two numbers. The stepping function can be linear
or another easing.

    v = Value(1, 100)
    v.get(.5) -> ~50

    v = Value(1, 100, cubicSmooth)
    v.get(.7) -> ~90
    v.get(.9) -> ~99

Stepping over time may need a tick step function

    v = Value(1, 100)
    v.deltaFrom = stage.clock.tick
    v.step(delta=14ms)
    // somehow flag 1sec of 60fps?
    v.get()
    v.get()
    v.get()

Divisor Values accept an A, B and a splitting V

    Value(0, 1, 100)
    v.get(.5) -> .05

*/

class Value {
    constructor(a=0, b=1, easing=undefined) {
        this.a = a
        this.b = b
        this.step = .5
                                            // linear
        this.easing = easiing == undefined? v=>v: easing
    }

    width(){
        return this.b - this.a
    }

    t(v) {
        return this.width() * v
    }

    get(step=this.step){
        raw = this.t(this.step)
                /* a smoothing function */
        return this.mutate(raw)
    }

    mutate(value) {
        return this.easing(value)
    }
}