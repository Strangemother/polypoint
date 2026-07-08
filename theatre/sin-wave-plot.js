/*
title: Sine Wave Point Animation
categories: minimal
files:
    head
    point
    pointlist
    stage
    stroke
---

The minimal requirements include the _head_, _stage_, and the _point_.
*/
class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        // this.point = new Point(30, 40, 100)
        this.points = PointList.generate.list(100, 5, 100)
        this.tick = 0

        /* stage.phase = Math.PI2  == 0 */
        this.phase = 1
        this.speed = .02
        this.size = 90
        this.min = 0

        this.phase = Math.PI /109
        this.speed = .01
    }

    draw(ctx){
        this.clear(ctx)
        this.tick += 1
        // this.point.pen.line(ctx, undefined, 'red')
        this.points.each.radius = (p, i)=> (Math.cos((i * this.phase)+ (this.tick * this.speed) ) * this.size) + this.min

        this.points.forEach((p)=>{
            p.pen.line(ctx, undefined, 'red')
        })
    }
}


stage = MainStage.go(/*{ loop: true }*/)

