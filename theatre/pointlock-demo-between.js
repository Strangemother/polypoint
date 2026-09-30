/*
---
title: PointLock Demo
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
    ../point_src/pointlock.js

    
*/
class MainStage extends Stage {
    canvas='playspace'
    mounted(){
        this.target = new Point(200, 200, 50, 30)
        this.line = new PointList(
            new Point(100, 100, 50, 30),
            new Point(600, 500, 50, 30)
        )

        this.dragging.add(
            this.target,
            ...this.line
        )
    }
    
    draw(ctx){
        this.clear(ctx)
        // this.line.pen.indicator(ctx)
        this.line.pen.line(ctx, {color:'red'})
        this.target.lock.between(...this.line)
        this.target.pen.indicator(ctx)
    }
}


;stage = MainStage.go();
