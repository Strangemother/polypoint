/*
title: Better Line
categories: line
files:
    head
    point
    pointlist
    stage
    mouse
    dragging
    stroke
    ../point_src/split.js
    ../point_src/random.js
    ../point_src/curve-extras.js
    ../point_src/math.js
---


*/


/*

A Better line allows more complicit tooling:

    let points = [a,b]
    Line(points)
    Line(...points)
    Line(a, b)
    Line(a, b, opts)
    Line(opts)

opts: {
    points: [a,b]
    a, b // alt points
    tips
    color
    width
    length
    ...
}

Note - for more points in the line - it becomes a PointList or Spline.
*/

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.dragging.add()
    }

    firstDraw(ctx) {
        ctx.lineCap = 'round'
    }

    draw(ctx){
        this.clear(ctx)
    }
}


stage = MainStage.go(/*{ loop: true }*/)
