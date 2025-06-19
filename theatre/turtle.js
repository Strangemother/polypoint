/*
title: Example
categories: basic
    dragging
files:
    head
    point
    pointlist
    stage
    mouse
    dragging
    stroke
    ../point_src/constrain-distance.js
    ../point_src/split.js
---

*/


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.points = new PointList(
                        [250 , 50, 20]
                        // , [250 , 170, 20, -90]
                        // , [250 , 290, 20]
                    ).cast()
        this.dragging.add(...this.points)
    }

    draw(ctx){
        this.clear(ctx)
        this.points.pen.indicator(ctx, 'green')
    }
}

stage = MainStage.go(/*{ loop: true }*/)
