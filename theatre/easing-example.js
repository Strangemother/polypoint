class TimeIt {
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

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.point = new Point(100, 100, 20)
        this.events.wake()
        this.microValue = 1 / (60 * 2) //2 seconds

        this.easingFunctionX =
                // circularEaseInOut
                // circularEaseOut
                // exponentialEaseInOut
                // exponentialEaseOut
                // elasticEaseInOut
                // elasticEaseOut
                // backEaseInOut
                // bounceEaseOut
                // bounceEaseIn
                // bounceEaseInOut
                sineEaseInOut
                // quarticEaseInOut
                // cubicEaseInOut
                // quinticEaseInOut
                ;
        this.easingFunctionY =
                bounceEaseOut
                // elasticEaseOut
                // quinticEaseOut
                ;
    }

    onClick(ev) {
        this.dest = Point.from(ev)
        console.log('click')
        this.vx = new Value(this.point.x, this.dest.x, this.easingFunctionX)
        this.vy = new Value(this.point.y, this.dest.y, this.easingFunctionY)
        const timerX = new TimeIt('x', true)
        const timerY = new TimeIt('y', true)
        let st = this

        this.vx.doneHandler = (function(value, preValue, mutator, step) {
                console.log(timerX.stop().toString());
            }).bind(this.vx)

        this.vy.doneHandler = (function(value, preValue, mutator, step) {
                console.log(timerY.stop().toString());
            }).bind(this.vy)

        this.microStep = 0
        this.timeIn = +(new Date)

    }

    draw(ctx){
        if(this.vy) {
            this.point.x = this.vx.get(this.microStep)
            this.point.y = this.vy.get(this.microStep)
        }

        this.microStep += this.microValue
        if(this.microStep > 1) {
            this.microStep = 1
        }

        this.clear(ctx)
        this.point.pen.fill(ctx, '#880000')
    }
}

stage = MainStage.go(/*{ loop: true }*/)
