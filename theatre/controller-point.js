/*
---
title: Controller
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/stage.js
 */


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.point = new Point({x:200,y:200, radius: 100})
        this.point.controlPoint = this.point.copy().update({radius: 10})
        this.point.controlPoint.parent = this.point;
        this.point.controlPoint.onDragMove = function(ev){
            let d = this.distance2D(this.parent)
            console.log(d)
            this.set(
                d.x,
                d.y,
                )
        }
        this.point.controlPoint.x = 20
        this.point.controlPoint.y = 20
        this.dragging.addPoints(this.point, this.point.controlPoint)
    }

    draw(ctx){
        this.clear(ctx)
        // this.point.controlPoint.xy = this.point.xy
        this.point.controlPoint.rel.x = this.point.x
        this.point.controlPoint.rel.y = this.point.y
        let a = this.point;
        a.pen.indicator(ctx)
        a.controlPoint.pen.indicator(ctx)
        // this.targetPoint.pen.fill(ctx, '#33dd33')
    }
}


;stage = MainStage.go();