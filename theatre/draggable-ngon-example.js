/*
title: Most Minimal Example
categories: minimal
files:
    head
    point
    stage
    mouse
    dragging
---

The minimal requirements include the _head_, _stage_, and the _point_
And it's draggable.

*/
class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        this.point = this.center.copy().update({radius: 100})
        this.dragging.add(this.point)
    }

    draw(ctx){
        this.clear(ctx)
        this.point.pen.indicator(ctx, {color: '#444'})
        this.point.pen.ngon(ctx, 3, this.point.radius, 1, '#880000', 2, Math.PI + this.point.radians)
    }
}


stage = MainStage.go(/*{ loop: true }*/)

