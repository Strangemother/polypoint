/*
---
title: UI Controls
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/distances.js
    ../point_src/dragging.js

---

An example of creating basic interactive controls. For these examples the page
utilises "Petite Vue" for minimal HTML templating

The function `addControl` emits an event for the _mini app_ to collect.
*/
class MainStage extends Stage {
    canvas='playspace'
    // live=false
    live = true
    mounted(){
        this.point = new Point(300, 400, 100)
        this.dragging.add(this.point)

        // this.lerper = new Iterator(0, .1, 1)
        this.tick = 0

        addButton('button', {
            label: 'my button'
        })

        addControl('text', {
            field: 'input'
            , value: 'Bananana'
            , onchange(ev) {}
        })
        addControl('number type', {
            field: 'input'
            , value: 20
            , type: 'number'
            , onchange(ev) {}
        })

        addControl('choice', {
            field: 'select'
            , options: [
                'eggs'
                , 'butter'
                , 'bacon'
                , 'bread'
            ]
            , stage: this
            , onchange(ev) {
                let sval = ev.currentTarget.value
            }
        })

        addControl('slider', {
            field: 'range'
            , stage: this
            , onchange(ev) {
                /*slider changed. */
                // debugger;
                let sval = ev.currentTarget.value
                this.stage.offset = parseFloat(sval) * .01
            }
        })

    }

    draw(ctx){
        this.clear(ctx)

        let pos = this.mouse.position
        pos.pen.circle(ctx)

        this.point.pen.indicator(ctx)
    }
}


;stage = MainStage.go();