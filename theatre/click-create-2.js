/*
title: Example
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/extras.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/point.js
    stroke
    ../point_src/stage.js
    mouse
    dragging
---

*/


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.points = new PointList(
                new Point({x: 250, y: 150 , radius: 20, rotation: 45})
            )
        this.dragging.add(...this.points)
    }

    onEmptyDown(ev) {
        console.log('onEmptyDown')
        let p = Point.from(ev).update({radius: 10})
        this.points.push(p)
        this.dragging.add(p)
    }

    draw(ctx){
        this.clear(ctx)
        this.points.pen.indicator(ctx)

    }
}

stage = MainStage.go(/*{ loop: true }*/)
