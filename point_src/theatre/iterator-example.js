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


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        const mutators = new Mutators(this)
        let x = 200
            , y = 200
            , amplitude = this.amplitude = 90
            , c = this.c = new Point(x,y)
            , p = this.point = new Point(x, y)
            ;
        p.radius = 30
        c.radius = amplitude

        this.xIter = new Iterator(x, [
                (v)=> mutators.stageLimit(v, 'width')
                // , (v)=>mutators.sin(v, amplitude)
            ])
        this.yIter = new Iterator(y, [
                (v)=>mutators.stageLimit(v, 'height')
                // , (v)=>mutators.cos(v, amplitude)
            ])
        this.rotIter = new Iterator(0, [
                (v)=>mutators.modulus(v, 360)
            ])
    }

    draw(ctx){
        this.clear(ctx)
        let c = this.c
        let p = this.point
        let speed = .02
        let amplitude = this.amplitude

        p.x = c.x + (Math.sin(this.xIter.step(speed)) * amplitude)
        p.y = c.y + (Math.cos(this.yIter.step(speed)) * amplitude)

        p.rotation = this.rotIter.step(-2)

        c.pen.indicator(ctx, {color:'grey'})
        p.pen.indicator(ctx, {color:'green'})
    }
}

stage = MainStage.go()
