/*
title: Tethered Controller Point
categories: binding
files:
    head
    point
    pointlist
    mouse
    stage
    dragging
    ../point_src/distances.js
    ../point_src/tethers.js
    ../point_src/stage-clock.js
---

You can "tether" two points, such that the _parent_ will manipulate the child.
This is a _semi-hierarchical link_ or I prefer to say 1.5 directional from
parent to child.

*/


class MainStage extends Stage {
    canvas='playspace'
    live = true

    mounted(){
        // this.createPoints()
        // this.dragging.add(...this.points, ...this.controlPoints)
        this.point = new Point(200, 200, 100)
        let cp = this.point.tethers.add({ x: 100, y: 50})
        this.dragging.add(this.point, cp)
    }

    draw(ctx){
        this.clear(ctx)
        if(this.clock.tick % 1 == 0) {
            this.point.tethers.step()
        }

        this.point.pen.indicator(ctx, {color: '#336600'})
        this.point.tethers.points.pen.fill(ctx, '#33DDAA')
    }
}



;stage = MainStage.go();