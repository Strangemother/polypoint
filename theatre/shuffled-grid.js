/*
title: Most Minimal Example
categories: minimal
files:
    head
    point
    pointlist
    ../point_src/events.js
    mouse
    stage
    dragging
    stroke
    ../point_src/random.js
    ../point_src/rectangle.js
---

The minimal requirements include the _head_, _stage_, and the _point_.
*/

addButton('Plot', {
    onclick(){
        stage.plot()
    }
})

addButton('shuffle', {
    onclick(){
        stage.shuffle()
    }
})

class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        this.plot()
    }

    plot(){
        this.points = PointList.generate.grid(48, 8, 100)
        this.points.each.radius = ()=> random.int(5,15)
        // random.shuffle(this.points, 2)
        this.dragging.set(...this.points)
    }

    shuffle(){
        random.shuffle(this.points, 2)
    }

    draw(ctx){
        this.clear(ctx)

        this.points.pen.fill(ctx, {color:'purple'})

    }
}

// Polypoint.head.deferredProp('PointList', )

stage = MainStage.go(/*{ loop: true }*/)

