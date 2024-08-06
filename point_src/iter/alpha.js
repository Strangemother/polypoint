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

