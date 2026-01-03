/*
title: Turtle Graphics Drawing
categories: basic
    dragging
files:
    head
    point
    pointlist
    stage
    mouse
    dragging
    stroke
    ../point_src/constrain-distance.js
    ../point_src/functions/range.js
    ../point_src/split.js
    ../point_src/relative-xy.js
    ../point_src/relative.js
    ../point_src/random.js
---

> A great little turtle.

In this version we clean up the journey and walk methods, ensuring the _turtle_
can walk a path until it meets the initial point.

Using a few simple commands, it's possible to draw very complex shapes.


*/

addControl('steps', {
    field: 'range'
    , stage: this
    , min: 1
    , max: 200
    // , value: 1
    , onchange(ev, unit) {
        /*slider changed. */
        let sval = ev.currentTarget.value
        unit.value = sval
        stage.stepCount = Number(sval)
    }
})


addButton('feet', {
    onclick(ev) {
        stage.turtle.feet(stage.stepCount)
    }
})

addButton('cut', {
    onclick(ev) {
        stage.turtle.cut()
    }
})


addButton('clear', {
    onclick(ev) {
        stage.turtle.lines = []
    }
})


addButton('walk', {
    onclick(ev) {
        stage.turtle.walk()
    }
})

addButton('once', {
    onclick(ev) {
        stage.turtle.once()
    }
})

addButton('journey', {
    onclick(ev) {
        stage.turtle.journey()
    }
})


class Turtle extends Point {
    stepTick = 0

    turtleSteps() {
        return this.steps
    }

    created() {
        this.lines = [
            // (new PointList([20, 20], [3, 40])).cast()
        ]
        this.start_action();

    }


    toe(prepare=true, liveLine=true) {
        if(prepare && !this.isDown) {
            // this.down_Action()
            this.start_action()
        }
        if(prepare && liveLine) {
            this.lines.push(this.line)
        }
        this.performStep(this.stepTick++, 1)
    }

    feet(count=this.steps.length, initPoint){
        for (var i = 0; i < range(count).length; i++) {
            // range(count)[i]
            let line = (this.lines.length > 0)? this.lines[0]: this.line
            let home = line[0]
            if(line.length > 1 && line[0] && this.distanceTo(home) < 2) {
                this._flagStop = true
                this.printSize()
                return
            }

            this.performStep(this.stepTick++, 1)
        }
    }

    journey() {
        // A journey is a walk, with start and end steps.
        this.start_action();
        this.walk()
        return this.cut()
    }

    once() {
        /* walk the journey once, no repeat*/
        this.start_action();

        let stepCount = this.steps.length
        for (var i = 0; i < range(stepCount).length; i++) {
            // range(count)[i]
            console.log('tick', i, this.stepTick)
            this.performStep(this.stepTick++, 1)
        }
        return this.cut()
    }

    walk(startPoint, i=0, pointLimit=300, stepLimit=3000) {
        if(startPoint == undefined) {
            startPoint = this.copy();
        }

        this.performStep(this.stepTick++, 1)

        // let line = (this.lines.length > 0)? this.lines[0]: this.line
        let home = startPoint // line[0]

        // let line = (this.lines.length > 0)? this.lines[0]: this.line
        // let home = line[0]
        let _distance = home? this.distanceTo(home): undefined;
        if(i > 1 && home && _distance < 1) {
            console.log('Stop.')
            this.printSize()
            return
        }

        if(i > stepLimit) {
            console.warn('Runaway stop at', stepLimit, 'steps')
            this.printSize()
            return this.line
        }

        if(this.line && this.line.length > pointLimit) {
            console.warn('Runaway stop at', pointLimit, 'points')
            this.printSize()
            return  this.line
        }

        return this.walk(startPoint, ++i, pointLimit, stepLimit)
    }

    cut(){
        // let item = this
        let l = this.line
        this.lines.push(l)
        this.line = new PointList()
        return l
    }

    printSize(){
        let line = (this.lines.length > 0)? this.lines[0]: this.line
        console.log(`size: ${this.lines.length}x${line.length}`)
    }

    performStep(tick, stepCount=1) {
        let items = this.turtleSteps()
        let item = items[Math.floor(tick % items.length)]
        range(stepCount).forEach(()=>{
            this.performAction(item)
        })
    }

    performAction(item) {
        let func = `${item[0]}_Action`
        let args = item.slice(1,)
        // console.log('Running Action', func, args)
        return this[func].apply(this, args)
    }

    forward_Action(distance) {
        let item = this
        item.relative.forward(item.radius * 2 * distance)
        this.line.push(this.copy())
    }

    down_Action() {
        this.isDown = true
        /* pen down actuate drawing on step.*/
        this.line = new PointList(this.copy())
    }

    start_action(liveLine=false){
        this.down_Action()
        this.line.push(this.copy())
        if(liveLine) {
            this.lines.push(this.line)
        }
    }

    up_Action() {
        /* stash line */
        // let item = this
        this.isDown = false
        this.lines.push(this.line)
        this.line = new PointList()
    }

    rotate_Action(v) {
        let item = this
        item.rotation += v
    }

}


class Trundle extends Turtle {
    /* A Trundle provides mildly cheaper commands, for turning and walking
    in a direction, by combing the steps into one rotation and forward.
    By default 90degree rotations

          ['forward', 10]
        , ['rotate', 90]

        , ['forward', 10]
        , ['rotate', -90]

        , ['forward', 1]

    after:

          ['forward', 10]
        , ['left', 10]
        , ['right', 1]

    */

    left_Action(distance=1, relDel=90) {
        /* Rotate 90degree left and walk forward to distance. */
        this.rotate_Action(relDel)
        this.forward_Action(distance)
    }

    right_Action(distance=1, relDel=90) {
        /* Rotate 90degree right and walk forward to distance. */
        this.rotate_Action(relDel * -1)
        this.forward_Action(distance)
    }
}

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    steps() {
        return this.layout()
    }

    layout() {

        let clock = (v=1) => ['left', v];
        let anti = (v=1) => ['right', v];

        return [
            // Assume the point is facing _left_, as 0degree.
              ['forward', 10] // Front wall.
            , clock(10) // right wall (B)
            , anti(1) // doorway out, left side.
            , anti(10) // left (B)
            , clock(5) // front door
            , clock(30) // corridor right
            , clock(5)
            , clock(14)
            , anti(1)
            , anti(14)
            , clock(5)
            , anti(1)
            , anti(5)
            , clock(10)
            , clock(4)
            , anti(4)
            , clock(30)
            , clock(14)
            , clock(20)
            , anti(1)
            , anti(20)
            , clock(30)
            , clock(24)
        ]
    }

    layoutOne() {
        return [
              ['forward', 10]
            , ['rotate', 90]

            , ['forward', 10]
            , ['rotate', -90]

            , ['forward', 1]
            , ['rotate', -90]

            , ['forward', 10]

            , ['rotate', 90]
            , ['forward', 5]
            , ['rotate', 90]
            , ['forward', 20]
            , ['rotate', 90]
            , ['forward',16]
            , ['rotate', 90]
            , ['forward', 20]

        ]
    }

    snowflake() {
        return [
            ['forward', 10]
            , ['rotate', 45]
            , ['forward', .5]
            , ['rotate', 90]
            , ['forward', 10]
            , ['rotate', -90]
            , ['forward', .5]
            , ['rotate', -90]
        ]
    }

    mounted(){

        this.line = new PointList()
        this.stepCount = this.steps().length
        this.turtle = new Trundle(500, 100);
        this.turtle.steps = this.steps()

        this.dragging.add(this.turtle)

        this.turtle.radius = 5
        this.turtle.once()
    }

    draw(ctx){
        this.clear(ctx)

        this.turtle.pen.indicator(ctx, 'red')
        // this.line.pen.line(ctx, {color: 'pink'})

        this.turtle.lines.forEach(line=>{
            line.draw.line(ctx, {color: '#333'})
            ctx.fill()
            // line.pen.quadCurve(ctx, {color: 'red'})
            line.pen.indicators(ctx, {color: '#880000'})
            line.pen.line(ctx, {color: 'red'})
        })
    }

}


stage = MainStage.go(/*{ loop: true }*/)
