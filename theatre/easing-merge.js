/*
categories: easing
files:
    head
    point
    pointlist
    ../point_src/math.js
    ../point_src/point-content.js
    stage
    mouse
    ../point_src/stage-clock.js
    ../point_src/easing.js
    ../point_src/timeit.js
    ../point_src/iter/lerp.js
    ../point_src/random.js
*/
addButton('move', {
    // label: 'move'
     onclick: ()=> console.log('move')
})


addControl('easing', {
    field: 'select'
    , onchange(ev) {
        let v = ev.currentTarget.value
        console.log('set easeNameY to', v)
        stage.easeNameY = v
        stage.easeNameX = v

        stage.easingFunctionX = easingFunctions.get(stage.easeNameX, stage.easyDirX)
        stage.easingFunctionY = easingFunctions.get(stage.easeNameY, stage.easyDirY)
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

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.point = new Point(100, 100, 20)
        this.microValue = this.clock.frameStepValue(2) // seconds
        /*  quad, cubic, quartic, quintic, sine, circular,
            exponential, elastic, back, bounce

            in, out, inOut */

        this.easingFunctionX = multiEase(
                                // easingFunctions.sine.inOut,
                                easingFunctions.back.in,
                                easingFunctions.sine.in,
                                // easingFunctions.elastic.in
                                // easingFunctions.bounce.out
                            )
        this.easingFunctionY = multiEase(
                                // easingFunctions.back.in,
                                // easingFunctions.sine.out,
                                // easingFunctions.sine.in,
                                // easingFunctions.back.inOut,
                                easingFunctions.bounce.out
                            )

        let _this = this;
    }

    onClick(ev) {
        this.dest = Point.from(ev)
        this.vx = new Value(this.point.x, this.dest.x, this.easingFunctionX)
        this.vy = new Value(this.point.y, this.dest.y, this.easingFunctionY)
        this.microStep = 0
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
