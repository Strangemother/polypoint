/*
title: Hover Action
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/extras.js
    ../point_src/random.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/functions/clamp.js
    ../point_src/distances.js
    ../point_src/dragging.js



 */
class MyPoint extends Point {
    onClick(ev) {
        console.log('Clicked!')
    }

    onMousemove(ev) {
        // console.log('move')
    }

    onMousedown(ev) {
        console.log('down')
    }

    onMouseup(ev) {
        console.log('up')
    }

    onDragStart(ev) {
        console.log('drag start')
    }

    onDragEnd(ev) {
        console.log('drag end')
    }

    onDragMove(ev) {
        // console.log('drag move')
    }

    onLongClick(ev, delta) {
        let args = Array.from(arguments)
        console.log('onLongClick', args)
    }

    onWheel(ev) {
        let args = Array.from(arguments)
        console.log(args)
    }
}


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.stroke = new Stroke({
            dash: [5,5]
            , color: 'grey'
            , width: 2
        })

        let p = this.point = new MyPoint(233,142)
        this.dragging.add(p)
    }

    draw(ctx){
        this.clear(ctx)
        this.point.pen.indicator(ctx)
    }
}


stage = MainStage.go()