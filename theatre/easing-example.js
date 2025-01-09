/*

files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/stage.js
    ../point_src/events.js
    ../point_src/stage-clock.js
    ../point_src/easing.js
    ../point_src/timeit.js
    ../point_src/iter/lerp.js
    ../point_src/random.js


 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.point = new Point(100, 100, 20)
        this.events.wake()
        this.microValue = this.clock.frameStepValue(2) // seconds
        /*  quad, cubic, quartic, quintic, sine, circular,
            exponential, elastic, back, bounce

            in, out, inOut */
        this.easeNameX = 'sine'
        this.easyDirX = 'inOut'
        this.easeNameY = 'cubic'
        this.easyDirY = 'inOut'

        this.easingFunctionX = easingFunctions.get(this.easeNameX, this.easyDirX)
        this.easingFunctionY = easingFunctions.get(this.easeNameY, this.easyDirY)

        addButton('move', {
            // label: 'move'
             onclick: ()=> console.log('move')
        })

        let _this = this;

        addControl('easing', {
            field: 'select'
            , onchange(ev) {
                let v = ev.currentTarget.value
                console.log('set easeNameY to', v)
                _this.easeNameY = v
                _this.easeNameX = v

                _this.easingFunctionX = easingFunctions.get(_this.easeNameX, _this.easyDirX)
                _this.easingFunctionY = easingFunctions.get(_this.easeNameY, _this.easyDirY)
            }

            , options: [
                "linear"
                , "quad"
                , "cubic"
                , "quartic"
                , "sine"
                , "circular"
                , "exponential"
                , "elastic"
                , "back"
                , "bounce"
            ]
        })
    }

    onClick(ev) {
        this.dest = Point.from(ev)

        this.vx = new Value(this.point.x, this.dest.x, this.easingFunctionX)
        this.vy = new Value(this.point.y, this.dest.y, this.easingFunctionY)
        const timerX = new TimeIt('x', true)
        const timerY = new TimeIt('y', true)

        this.vx.doneHandler = function(value, preValue, mutator, step) {
            console.log(timerX.stop().toString());
        }

        this.vy.doneHandler = function(value, preValue, mutator, step) {
            console.log(timerY.stop().toString());
        }

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
