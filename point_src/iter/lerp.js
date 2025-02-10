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

---

    v=Value(100, 600, quadEaseInOut)

===

This could be used for time, by providing to _dates_ and calulating the
distance between an expected time, and a smoothed time.

    // 2 seconds

    v = Value(+Date, +Date+2000)
    v.step(.7) // should be at seconds location.

    v = Value(+Date, +Date+2000, quinticEaseInout)
    v.step(.7) // will be ahead of the first value by X seconds

---
    const secondsEasing = function(v) {
        // a easing function to flag _time over seconds_ from
        // a relative start time.
    }

    let deltaFrom = 0
    let fps = 60
    let delta = 14 // ms - for one delta over 1000ms (I think.)
    // 1 to 100 over 4 seconds.
    v = Value(1, 100, seconds(4, deltaFrom, fps))
    v.step(delta)
*/


class Value {

    constructor(a=0, b=1, easing=undefined, doneStop=false) {
        this.a = a
        this.fix = 5
        this.b = b
        this.step = .005
        this.done = false
        this.doneStop = doneStop

        this.setEasing(easing)
    }

    setEasing(easing){
        let linear = v=>v;
        // let linear = v=>Number(v.toFixed(this.fix));
        this.easing = easing == undefined? linear: easing
    }

    width(){
        return this.b - this.a
    }

    t(v) {
        return this.width() * v
    }

    get(step=this.step){
        /* a smoothing function */
        // console.log('Value In', step)

        let mutator = this.mutate(step)
        // console.log('Mutated', mutator)
        let done = step >= (1 - .00001)
        if(done && this.doneStop) { mutator = 1 }
        let raw = this.t(mutator)
        // console.log('Computed', raw)
        let res = this.a + raw

        if(done == true) {
            this.emitDoneEvent(res, raw, mutator, step)
        }

        // console.log('Result', res)
        return res
    }

    mutate(value) {
        return this.easing(value)
    }

    emitDoneEvent(value, preValue, mutator, step) {
        if(this.done == false){
            this.doneHandler(value, preValue, mutator, step)
        }
        this.done = true
    }

    doneHandler(value, preValue, mutator, step) {
        // console.log('done', value, preValue)
    }

    split(count=1) {
        /* return a list of numbers, split through the count divisor

        v= new Value(100, 600)
        v.split(10)[9] == 600
        v.split(2) == [100, 600]
        */

        let r = []
        let divisor = 1/(count-1);
        for (var i = 0; i < count; i++) {
            let step = i * divisor;

            r.push(this.get(step))
        }
        return r
    }
}