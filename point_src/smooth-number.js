/*
title: Smooth Number
---

> The `SmoothNumber` class receives fast number updates, and returns a _averaged_ number when queried.


        const smoothVal = new SmoothNumber()
        speedNumber.push(stage.mouse.speed())

        stage.fps.text = speedNumber

A `SmoothNumber` combines a average of many values in a list, visually
updated a (Framerate) modulo speed.


Push numbers into the list, to get an average over time allows for nicer-looking
updates on a fast changing number, such as the FPS.

## Setup

Create a new instance of the `SmoothNumber`:

    const initValue = 40
        , width = 20      // how many historical points
        , updateRate = 10 // every X frames
        , valueFix = 0    // value.toFixed

    const smoothVal = new SmoothNumber(initValue, width, updateRate, valueFix)

Then we can push a value to it:

    smoothVal.push(currentFPS)

It can be done many (many) times. When required, we read the number:

    smoothVal.get()

This secretly returns the `smoothVal.value` - but checks to ensure the value is fresh.

### Easier

To save the hassle of _pushing_ then _getting_ a number, we can do this with one call.

    fpsValue = this.smoothVal.pushGet(Math.round(currentFPS)+1)

This adheres to the update-rate, so the number `fpsValue` will change slower than
directly reading `currentFPS`.

This is nicer for humans - as most of them can't read text at 60FPS+ apparently?



*/
class SmoothNumber {
    /* A SmoothNumber provides a nicer read-back of a number over a period
    of time. Similar to the FPS counter.

    Create an instance and push a number when required.
    Read the _value_ through a few routines.

    Create:
        const initValue = 40
        width = 20      // how many historical points
        updateRate = 10 // every X frames
        valueFix = 0    // value.toFixed
        const smoothVal = new SmoothNumber(initValue, width, updateRate, valueFix)
        smoothVal.push(currentFPS)

    Read:

        smoothVal.get()

    Push + Read:

        b = this.smoothVal.pushGet(Math.round(currentFPS)+1)

     */
    // Higher is a longer delay between visual text updates.
    modulusRate = 1
    // Count of position to store historical fps counts.
    width = 20
    // decimal accuracy. Generally 0 is preferred.
    fixed = 0

    constructor(value=0, width=10, modulusRate=1, fixed=0) {

        this.width = width;
        this.value = value
        this.fixed = fixed
        this.modulusRate = modulusRate

        let a = new Array(this.width)
        a.fill(value)
        this.ticks = a
        this.inc = 0
        this.dirty = -1
    }


    pushGet(val) {
        /* Apply a value, and return the current smooth value
        This returned the cached value not a new one. */
        return this.update(this.modulusRate, val)
    }

    push(val) {
        this.incrementPush(val)
        return this.modUpdate()
    }

    get() {
        if(this.dirty) { return this.mutateCompute() }
        return this.value
    }

    [Symbol.toPrimitive](hint){

        // return this.value;

        let o = {
            'number': ()=> Number(this.value)
            , 'string': ()=> this.fixValue(Number(this.value))
            // Upon operator (+)
            , 'default': ()=> this.value
        }

        let f = o[hint]
        f = (f == undefined)? f=()=>this:f

        return f()
    }


    update(modulusRate=this.modulusRate, val=1) {
        this.modUpdate(this.inc, modulusRate)
        this.incrementPush(val)
        return this.value
    }

    modUpdate(inc=this.inc, modulusRate=this.modulusRate) {
        /* Perform an update  if the modulo matches,
        return the value */
        if(inc % modulusRate == 0) {
            // this.value = val
            /* A cleaner value output takes the average of a list of fps counts.*/
            return this.mutateCompute()
        }

        return this.value
    }

    mutateCompute(){
        this.value = this.computeValue()
        this.dirty = 0
        return this.value
    }

    computeValue(){
        let r = (this.ticks.reduce((a,b) => a+b) / this.width)
        return this.fixValue(r)
    }

    fixValue(r, fixed=this.fixed){
        return fixed==null? r: r.toFixed(fixed)
    }

    incrementPush(storeValue, tick=1){
        let i = this.inc += tick

        if(this.inc % this.width == 0) {
             i = this.inc = 0
        }

        this.ticks[i] = storeValue
        this.dirty = 1
        return i
    }

    reset(value=Number(this.value)) {
        this.ticks.fill(value)
    }
}

