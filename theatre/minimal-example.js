/*
title: Most Minimal Example
categories: minimal
files:
    head
    point
    stage
---

The minimal requirements include the _head_, _stage_, and the _point_.
*/
class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        this.point = this.center.copy()
    }

    draw(ctx){
        this.clear(ctx)
        this.point.pen.indicator(ctx)
    }
}


stage = MainStage.go(/*{ loop: true }*/)

