/*
---
title: Line class example
files:
    ../point_src/math.js
    head
    point
    pointlist
    dragging
    mouse
    stage
    dragging
    stroke
    ../point_src/curve-extras.js


*/
class MainStage extends Stage {
    canvas='playspace'
    mounted(){
        let lpoints = [new Point(100, 100), new Point(500, 100)]
        this.line = new Line(...lpoints)

        this.dragging.add(...lpoints)
    }

    draw(ctx){
        this.clear(ctx)
        this.line.render(ctx, {color: 'red'})

    }
}


;stage = MainStage.go();