class TimeIt {
    /* The TimeIt entity provides _time taken_ tests for running code.

        timeit = new TimeIt('my label')
        timeit.start()
        timeit.stop()
        timeit.timeTaken()

    This can be reduced to two statements, by assigning a `startNow` bool
    to the constructor:

        timeit = new TimeIt('my label', true)
        console.log(timeit.stop().toString())
        // TimeIt("y") complete 2002ms

     */
    constructor(label, startNow=false) {
        this.label = label
        if(startNow) {
            this.start()
        }
    }

    stringLabel() {
        let n = this.constructor.name
        return `${n}("${this.label}")` || n
    }

    stamp() {
        return +(new Date)
    }

    start() {
        this.timeIn = this.stamp()
        return this
    }

    stop() {
        if(this.timeOut != undefined) { return };
        this.timeOut = this.stamp()
        return this
    }

    timeTaken() {
        let timeOut = this.timeOut
        if(timeOut == undefined) {
            timeOut = this.stamp()
        }

        let timeIn = this.timeIn
        if(timeIn == undefined) {
            timeIn = this.stamp()
        }

        return timeOut - timeIn
    }

    reset() {
        this.timeIn = undefined
        this.timeOut = undefined
        return this
    }

    get value() {
        return this.timeTaken()
    }

    runningString() {
        if(this.timeIn == undefined) {
            return 'not running'
        }

        if(this.timeOut == undefined) {
            return 'running'
        }

        return 'complete'
    }

    toString() {
        return `${this.stringLabel()} ${this.runningString()} ${this.value}ms`
    }

    [Symbol.toPrimitive](hint){

        // return this.value;

        let o = {
            'number': ()=>this.value
            , 'string': ()=> this.toString()
            // Upon operator (+)
            , 'default': ()=>this.value
        }

        let f = o[hint]
        f = (f == undefined)? f=()=>this:f

        return f()
    }

}