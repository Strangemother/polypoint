/*
---
title: Angle Values
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/protractor.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/stage.js
    ../point_src/angle.js
 */

aa = new Angle(20, 'tau')
ab = new Angle(20).tau

class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.indicatorPoint = new Point({x:200,y:200, radius: 100})
        this.dragging.addPoints(this.indicatorPoint)
    }

    draw(ctx){
        this.clear(ctx)

        let a = this.indicatorPoint;
        a.pen.indicator(ctx)

        // this.targetPoint.pen.fill(ctx, '#33dd33')
    }
}


;stage = MainStage.go();