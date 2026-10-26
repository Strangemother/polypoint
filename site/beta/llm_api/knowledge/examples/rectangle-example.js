/*
title: Rectangle Drawing Tool
categories: minimal
files:
    head
    point
    pointlist
    stage
    stroke
    ../point_src/rectangle.js
---

The minimal requirements include the _head_, _stage_, and the _point_.
*/
class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {

        this.points = PointList.generate.list(8, new Point(100, 0), new Point(100, 200))
        this.points.each.radius = 15
        this.point = this.points[2].copy()
        this.point.radius = 30
    }

    draw(ctx){
        this.clear(ctx)
        // this.points.pen.rect(ctx,{width: 4, color: '#444'})
        this.points.pen.rectangles(ctx, {color:'purple'})
        this.point.pen.rectangle(ctx, {
                width: 60
                , color: '#8f6faf'
                , radii:[7]
                , strokeWidth: 1
            })
        // this.point.pen.rect(ctx, {color: '#8f6faf'})
    }
}


stage = MainStage.go(/*{ loop: true }*/)

