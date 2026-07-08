/*
title: Hyperway Step Animation
categories: minimal
files:
    head
    point
    pointlist
    stage
    stroke
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
        this.points.pen.line(ctx,{width: 4, color: '#444'})
        this.points.pen.fill(ctx, 'purple')
        this.point.pen.circle(ctx, {color: '#8f6faf'})
    }
}


stage = MainStage.go(/*{ loop: true }*/)

