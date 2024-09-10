/*An iterator can automatically count between a range. */

class Iterator {

    value = 0

    constructor(value=0, mutators) {
        this.initValue = this.value = value
        this.mutators = mutators
    }

    step(t=1) {
        var v = this.value
        v += t

        for(let mutator of this.mutators) {
            v = mutator(v)
        }
        this.value = v
        return v
    }
}


class Mutators {

    constructor(stage) {
        this.stage = stage
    }

    stageLimit(v, direction) {
        let _stage = this.stage;
        if(v > _stage.dimensions[direction]) {
            v = 0
        }
        if(v < 0) {
            v = _stage.dimensions[direction]
        }
        return v
    }

    modulus(v, mod=360) {
        return v % mod
    }

    sin(v, mul=1) {
        return Math.sin(v) * mul
    }

    cos(v, mul=1) {
        return Math.cos(v) * mul
    }
}

