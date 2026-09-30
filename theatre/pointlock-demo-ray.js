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
        this.origin = this.center.copy().update({radius: 150 })

        this.dragging.add(
            this.target,
            this.origin
        )
    }
    
    draw(ctx){
        this.clear(ctx)
        // this.origin.pen.indicator(ctx)
        this.origin.pen.indicator(ctx, {color:'red'})
        this.target.lock.ray(this.origin, .3, 1.5)
        this.target.pen.indicator(ctx)
    }
}


;stage = MainStage.go();
