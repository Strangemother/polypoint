/*
title: Minimal Point Addition
categories: minimal
files:
    head
    point
    stage
    mouse
    dragging
---

The minimal requirements include the _head_, _stage_, and the _point_.
*/
class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        this.pointA = new Point(10,10)
        this.pointB = new Point(10,10)
        this.dragging.add(this.pointA, this.pointB)
    }

    draw(ctx){
        this.clear(ctx)
        this.pointA.pen.indicator(ctx)
        this.pointB.pen.indicator(ctx)
        this.pointA.add(this.pointB).pen.indicator(ctx)
    }
}


stage = MainStage.go(/*{ loop: true }*/)

