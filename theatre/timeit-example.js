/*
title: TimeIt Class Example
files:
    head
    pointlist
    point
    stage
    mouse
    fps
    ../point_src/random.js
    ../point_src/timeit.js

---

The `TimeIt` class helps track time between two calls.

This can be used for anything requiring fairly precise timing at a millisecond range.
See the [easing-example](./easing-example.js) for another demo.
*/


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.point = new Point({x: 250, y: 150 , radius: 20, rotation: 45})
        this.timer = new TimeIt('Clicker')
    }

    onClick(ev) {
        if(this.timer.running == false) {
            return this.startTime()
        };

        this.stopTime()
    }

    startTime(){
        console.log('start timer')
        this.point.x = random.int(100, 700)
        this.point.y = random.int(100, 700)
        this.timer.start()
        return
    }

    stopTime(){
        this.timer.stop()
        console.log('Stop click', this.timer.toString())
        this.timer.reset()
    }

    draw(ctx){
        this.clear(ctx)
        this.point.pen.indicator(ctx)
        this.fps.drawFPS(ctx)
        // console.log('draw')
    }
}

stage = MainStage.go(/*{ loop: true }*/)
