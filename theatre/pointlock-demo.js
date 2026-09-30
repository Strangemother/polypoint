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
        this.dragging.add(this.target)
    }
    
    draw(ctx){
        this.clear(ctx)
        this.target.lock.facing()
        this.target.pen.indicator(ctx)
    }
}


;stage = MainStage.go();
