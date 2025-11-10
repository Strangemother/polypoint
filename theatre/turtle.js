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
---

*/


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    steps() {
        return [
            ['forward', 1] // unit of width
            , ['down']
            , ['rotate', 10] // degree
            , ['forward', 4] // degree
            , ['up'] // degree
            , ['goto', 0]
        ]
    }

    mounted(){
        this.points = new PointList(
                        [250 , 50, 20]
                        // , [250 , 170, 20, -90]
                        // , [250 , 290, 20]
                    ).cast()
        this.dragging.add(...this.points)
        this.stepTick = 0
    }

    draw(ctx){
        this.clear(ctx)
        this.points.pen.indicator(ctx, 'green')
        this.performStep(ctx, this.stepTick++, 20)
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
        return this[func].apply(this, args)
    }

    forward_Action(distance) {
        let item = this.points.last()
        item.relative.forward(item.radius * 2 * distance)
    }

    down_Action() {
        // let item = this.points.last()
        // item.relative.forward(item.radius * 2 * distance)
    }

    rotate_Action() {}
    forward_Action() {}
    up_Action() {}
    goto_Action() {}
}


stage = MainStage.go(/*{ loop: true }*/)
