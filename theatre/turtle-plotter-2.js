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
        stage.feet(stage.stepCount)
    }
})

addButton('cut', {
    onclick(ev) {
        stage.cut()
    }
})


addButton('clear', {
    onclick(ev) {
        stage.lines = []
    }
})


addButton('walk', {
    onclick(ev) {
        stage.walk()
    }
})

addButton('journey', {
    onclick(ev) {
        stage.journey()
    }
})


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    steps() {
        // return this.divSteps(22)
        // return this.triSteps()
        return [
            ['forward', 1]
            , ['rotate', 45]
            , ['forward', .5]
            , ['rotate', -60]
            , ['forward', 1]
            , ['rotate', -60]
            , ['forward', 1]
            , ['rotate', 45]
            , ['forward', 1.5]
        ]
    }

    stepsComplex() {
        return [
            ['rotate', -90] // degree
            , ['forward', 1]
            , ['rotate', 90]
            // , ['forward', 1]
            // , ['rotate', -90]
            , ...this.cubeSteps()
            , ['forward', 1]
            , ['rotate', 45]
            , ...this.divSteps(4)
            , ...this.divSteps(4)
            , ['forward', 1]
            // , ['rotate', 20]
            // , ['forward', 1]
            // , ['rotate', -20]
            // , ['forward', 3]
            // , ['up']
            // , ['forward', .1] // unit of width

            // , ['rotate', 1] // degree
            // , ['goto', 0]
        ]
    }

    cubeSteps(){
        return [
            ['rotate', -90] // degree
            , ['forward', 1]
        ]
    }

    divSteps(split=5){
        return [
            ['rotate', -(360/split)] // degree
            , ['forward', 1]
        ]
    }

    octagonSteps(){
        return [
            ['rotate', -45] // degree
            , ['forward', 1]
        ]
    }

    triSteps(){
        return [
            ['rotate', -120] // degree
            , ['forward', 1]
        ]
    }

    mounted(){
        this.points = new PointList(
                        [250 , 50, 20]
                        // , [250 , 170, 20, -90]
                        // , [250 , 290, 20]
                    ).cast()
        this.dragging.add(...this.points)
        this.line = new PointList()
        this.stepCount = this.steps().length
        this.stepTick = 0
        this.lines = [
            // (new PointList([20, 20], [3, 40])).cast()
        ]

        this.turtle = this.center.copy()
        this.dragging.add(this.turtle)

        this.turtle.radius = 10
    }

    draw(ctx){
        this.clear(ctx)

        this.turtle.pen.indicator(ctx, 'red')
        this.line.pen.line(ctx, {color: 'pink'})

        this.lines.forEach(line=>{
            line.pen.line(ctx, {color: 'red'})
            // line.pen.indicators(ctx)
        })
    }

    feet(count=this.stepCount, initPoint){
        for (var i = 0; i < range(count).length; i++) {
            // range(count)[i]
            let line = (this.lines.length > 0)? this.lines[0]: this.line
            let home = line[0]
            if(line.length > 1 && line[0] && this.turtle.distanceTo(home) < 2) {
                this._flagStop = true
                this.printSize()
                return
            }

            this.performStep(this.ctx, this.stepTick++, 1)
        }
    }

    journey() {
        // A journey is a walk, with start and end steps.
        this.start_action();
        this.walk()
        this.cut()
    }

    walk(startPoint, i=0, pointLimit=300, stepLimit=3000) {
        if(startPoint == undefined) {
            startPoint = this.turtle.copy();
        }

        this.performStep(this.ctx, this.stepTick++, 1)

        // let line = (this.lines.length > 0)? this.lines[0]: this.line
        let home = startPoint // line[0]

        // let line = (this.lines.length > 0)? this.lines[0]: this.line
        // let home = line[0]
        let _distance = home? this.turtle.distanceTo(home): undefined;
        if(i > 1 && home && _distance < 1) {
            console.log('Stop.')
            this.printSize()
            return
        }

        if(i > stepLimit) {
            console.warn('Runaway stop at', stepLimit, 'steps')
            this.printSize()
            return
        }

        if(this.line && this.line.length > pointLimit) {
            console.warn('Runaway stop at', pointLimit, 'points')
            this.printSize()
            return
        }

        this.walk(startPoint, ++i, pointLimit, stepLimit)
    }

    cut(){
        let item = this.turtle
        this.lines.push(this.line)
        this.line = new PointList()
    }

    printSize(){
        let line = (this.lines.length > 0)? this.lines[0]: this.line
        console.log(`size: ${this.lines.length}x${line.length}`)
    }

    performStep(ctx, tick, stepCount=1) {
        let items = this.steps()
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
        let item = this.turtle
        item.relative.forward(item.radius * 2 * distance)
        this.line.push(this.turtle.copy())
    }

    down_Action() {
        /* pen down actuate drawing on step.*/
        this.line = new PointList(this.turtle.copy())
    }

    start_action(){
        this.line = new PointList(this.turtle.copy())
        this.line.push(this.turtle.copy())
    }

    up_Action() {
        /* stash line */
        // let item = this.turtle
        this.lines.push(this.line)
        this.line = new PointList()
    }

    rotate_Action(v) {
        let item = this.turtle
        item.rotation += v
    }

    goto_Action() {}
}


stage = MainStage.go(/*{ loop: true }*/)
