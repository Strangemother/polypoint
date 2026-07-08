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

    width(a=this.a, b=this.b){
        return b - a
    }

    t(v, a=this.a, b=this.b) {
        return this.width(a, b) * v
    }

    get(step=this.step, easing=this.easing, a=this.a, b=this.b){
        /* a smoothing function */
        // console.log('Value In', step)

        let mutator = this.mutate(step, easing)

        // console.log('Mutated', mutator)
        let done = step >= (1 - .00001)
        if(done && this.doneStop) { mutator = 1 }
        let raw = this.t(mutator, a, b)
        // console.log('Computed', raw)
        let res = a + raw

        if(done == true) {
            this.emitDoneEvent(res, raw, mutator, step)
        }

        // console.log('Result', res)
        return res
    }

    pluck(a=this.a, b=this.b,  step=this.step, easing=this.easing) {
        return this.get(step, easing, a, b)
    }

    mutate(value, easing) {
        let easingUnit= (easing == undefined? this.easing: easing)
        try{
            return easingUnit(value)
        }catch {
            debugger;
        }
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



class PointListLerper {

    constructor(pointList) {
        this.parent = pointList
        this.lerpKeys = ['x', 'y', 'radius', 'rotation']
        this.currentTime = 0
        this.seconds = 2
    }

    getCommonValue() {
        if(this.commonValue) {
            return this.commonValue
        };

        let commonValue = this.commonValue = new Value()
        commonValue.doneStop = true
        commonValue.setEasing(this.getCommonEasingFunction())
        return commonValue
    }

    getCommonEasingFunction(){
        /* return an easing function */
        return quarticEaseInOut
    }

    through(a, b, settings) {
        /* Lerp this entire pointlist from _a_ to _b_.
        Settings can be a number or a settings object. */
        let d = {
            /* time taken over the deltatime  currentTime */
            seconds: this.seconds
            /* values on a point to lerp.*/
            , keys: this.lerpKeys
            , currentTime: this.currentTime
            , easing: undefined
            , fps: 60
            , delay: 0
            // , easing:
        }

        Object.assign(d, settings)
        // d.delta = 1 / (d.fps * (d.seconds + d.delay))

        let spl = 1 / (d.fps * (d.seconds + d.delay)) // d.delta
            , lerpKeys = d.keys
            , commonVal = this.getCommonValue()
            , pa = a
            , pb = b
            /* a percent of 0 to 1.*/
            , currentTime = d.currentTime + spl
            // , currentTime = this.currentTime = d.currentTime + spl
            , easingFunction = d.easing
            ;

        this.currentTime += spl
        // this.currentTime = d.currentTime + spl
        this.parent.forEach((p,i)=> {
            let a = pa[i]
            let b = pb[i]
            let di = d[i]

            if(di !=undefined
                && (di.seconds != undefined
                    || di.delay != undefined)
                && di?.currentTime == undefined
            ) {
                /* precompute*/
                let _seconds = di.seconds == undefined? d.seconds: di.seconds
                let _delay = di.delay == undefined? d.delay: di.delay
                di.currentTime = -(_delay/_seconds)
            }

            /* A custom easing function by index. */
            let ease = di?.easing == undefined? easingFunction: di.easing;
            var ct = di?.currentTime == undefined? currentTime: di.currentTime;
            if(di?.seconds || di?.delay) {
                let _seconds = di.seconds == undefined? d.seconds: di.seconds
                let spl = 1 / (d.fps * _seconds)
                ct = ct + spl
                di.currentTime = ct
            }

            lerpKeys.forEach(k=>{
                /* iterate the target values of the _current_ point.
                Use the common Value to calculate the eased new value.*/
                if (ct < 0) ct=0;
                p[k] = commonVal.pluck(a[k], b[k], ct, ease)
            })

        })



    }
}

Polypoint.head.install(PointListLerper)

Polypoint.head.deferredProp('PointList',
    function lerper() {
        return new PointListLerper(this)
    }
);

