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
    , onchange(ev, unit) {
        /*slider changed. */
        let sval = ev.currentTarget.value
        unit.value = sval
        stage.stepCount = Number(sval)
    }
})


addButton('button', {
    label: 'walk'
    , onclick(ev) {
        stage.walk(stage.stepCount)
    }
})

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    steps() {
        return [
            ['down']
            , ['forward', 1] // unit of width
            , ['rotate', 30] // degree
            // , ['forward', 1] // degree
            , ['up'] // degree
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
        this.stepCount = 1
        this.stepTick = 0
        this.lines = []
    }

    draw(ctx){
        this.clear(ctx)
        this.points.pen.indicator(ctx, 'green')
        if(this._isDrawing) {
            this.downAt.pen.line(ctx, this.points.last())
        }

        this.lines.forEach(pair=>{
            pair[0].pen.line(ctx, pair[1])
        })
    }

    walk(count=this.stepCount){
        range(count).forEach(()=>{
            this.performStep(this.ctx, this.stepTick++, 1)
        })
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
        console.log('Running Action', func, args)
        return this[func].apply(this, args)
    }

    forward_Action(distance) {
        let item = this.points.last()
        item.relative.forward(item.radius * 2 * distance)
    }

    down_Action() {
        /* pen down actuate drawing on step.*/
        let item = this.points.last()
        this.downAt = item.copy()
        this._isDrawing = true
    }

    up_Action() {
        /* stash line */
        let item = this.points.last()
        this.lines.push([this.downAt, item.copy()])
        this._isDrawing = false
    }

    rotate_Action(v) {
        let item = this.points.last()
        item.rotation += v
    }

    goto_Action() {}
}


stage = MainStage.go(/*{ loop: true }*/)
