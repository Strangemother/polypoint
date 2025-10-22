/*
---
title: Split
categories: split
    curve
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/extras.js
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/split.js
    ../point_src/curve-extras.js
*/
class MainStage extends Stage {
    canvas='playspace'
    // live=false
    live = true
    mounted(){
        this.count = 40
        let lpoints4 = [new Point(200, 300, 300, 90), new Point(800, 400, 200, 100)]
        this.curve2 = new BezierCurve(...lpoints4)
        this.dragging.add( ...lpoints4)
    }

    draw(ctx){
        this.clear(ctx)

        this.curve2.render(ctx, {color: '#777'})
        let normals = this.curve2.split(this.count,  0)

        normals.each.radius = 10
        normals.pen.lines(ctx, 'green', 2)
    }
}


;stage = MainStage.go();