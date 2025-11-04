/*
title: Just a Stagr
categories: minimal
files:
    head
    stage
---

The minimal requirements include the _head_ and _stage_.
*/
class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
    }

    draw(ctx){
        this.clear(ctx)
        // this.points.pen.rect(ctx,{width: 4, color: '#444'})
    }
}


stage = MainStage.go(/*{ loop: true }*/)

