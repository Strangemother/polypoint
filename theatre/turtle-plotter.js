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

> A most basic version of a "turtle".

This very simple example of turtle drawing we move a _pen_ using coordindate
based plotting with a _down_ and _up_.

1. Drag the point
2. Run the `walk()` function

It processes the `steps()` forever, plotting _lines_ for each _down_ and _up_ command
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


addButton('walk', {
    onclick(ev) {
        stage.walk(stage.stepCount)
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
        return [
            // ['down']
            ['rotate', -90] // degree
            , ['forward', 1]
            , ['rotate', 90]
            , ['forward', 1]
            , ['rotate', 90]
            , ['forward', 4]
            , ['rotate', 20]
            , ['forward', 1]
            , ['rotate', -20]
            , ['forward', 3]
            // , ['up']
            // , ['forward', .1] // unit of width

            // , ['rotate', 1] // degree
            // , ['goto', 0]
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

    walk(count=this.stepCount, initPoint){
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

    printSize(){
        let line = (this.lines.length > 0)? this.lines[0]: this.line
        console.log(`size: ${this.lines.length}x${line.length}`)
    }

    journey(i=0, initPoint){
        if(initPoint == undefined) {
            initPoint = this.turtle.copy()
        }

        this._flagStop = false

        // run
        this.walk(2, initPoint)

        if(this._flagStop == true || this.turtle.distanceTo(initPoint) < 2) {
            this.up_Action()
            console.log('Stop')
            this.printSize()
            return
        }


        if(i > 500) {
            this._flagStop = true
            console.log('Max steps exceeded')
            return
        }

        this.journey(i++, initPoint)
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

    up_Action() {
        /* stash line */
        let item = this.turtle
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
