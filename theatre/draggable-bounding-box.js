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
        let p = this.point

        p.pen.indicator(ctx, {color: '#444'})

        let r = p.radians + (Math.PI/4)
        p.pen.ngon(ctx, 3, p.radius, 1, '#880000', 2, p.radians)
        p.pen.box(ctx, p.radius, 'red', 2, r)
        // this.point.pen.box(ctx, this.point.radius, 'red', 2, r)
    }
}


stage = MainStage.go(/*{ loop: true }*/)

