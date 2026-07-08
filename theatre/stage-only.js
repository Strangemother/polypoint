/*
title: Stage Without Points
categories: minimal
files:
    head
    ../point_src/stage.js
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

