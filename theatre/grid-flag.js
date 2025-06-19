/*
title: Grid Flag
categories: minimal
    grid
files:
    ../theatre/unpack.js
    head
    point
    pointlist
    stage
    stroke
    dragging
    mouse
---

The minimal requirements include the _head_, _stage_, and the _point_.
*/

class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        this.point = new Point(30, 40, 100)
        // this.points = PointList.generate.grid(500, 20, 15, point(100, 100))
        this.points = PointList.generate.grid({
            count:500
            , rowCount:20
            , spread:15
            , position:point(100, 100)
        })

        this.tick = 0
        this.speed = .02
        this.phase = this.point.radians = .3
        this.growth = 3
        this.min = 5
        this.dragging.add(this.point)
    }

    draw(ctx){
        this.clear(ctx)
        this.tick += 1
        this.phase = this.point.radians
        this.points.pen.fill(ctx, )
        this.point.pen.indicator(ctx)
        this.points.each.radius = (p, i) => this.min + (Math.cos(i * this.phase + this.tick * this.speed) * this.growth)
        this.points.each.color = (p,i)=> `hsl(${190+Math.sin(i * this.speed * this.phase) * 40} 80% 50%)`
    }
}


stage = MainStage.go(/*{ loop: true }*/)

