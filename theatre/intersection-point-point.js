/*
title: Point Intersection
category: intersection
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/mirror.js
    ../point_src/stage.js
    ../point_src/text/label.js
    ../point_src/intersections.js

---

Discover the intersection of two points, the returned points
are the intersection of those points.

    getCircleCircleIntersections(pointA, pointB)

*/


function quantizeNumber(value, quantize=1) {
  const quantizedValue = Math.round(value / quantize) * quantize;
  return quantizedValue;
}



class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.pointA = new Point({x:200,y:200, radius:90})
        this.pointB = new Point({x:390,y:240, radius:130})
        this.dragging.addPoints(this.pointA, this.pointB)
        this.events.wake()

    }

    draw(ctx){
        this.clear(ctx)

        this.pointA.pen.indicator(ctx)
        this.pointB.pen.indicator(ctx, {color: this.pointB.color})

        let i2 = getCircleCircleIntersections(this.pointA, this.pointB)
        if(i2.length > 0) {

            i2.forEach((xy)=>{
                let iPoint = (new Point).copy(xy).update({radius: 5})
                // iPoint.radius = 30
                iPoint.pen.fill(ctx, '#CC00BB')
            })
        }
    }
}


;stage = MainStage.go();