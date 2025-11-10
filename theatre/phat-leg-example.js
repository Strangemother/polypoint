/*
title: Thick Line Leg Example
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
        this.points = PointList.generate.list(100, point(5,5), [200, 100])
        this.tick = 0

        /* stage.phase = Math.PI2  == 0 */
        /* stage.phase = Math.PI / (stage.points.length * .5 )
        */
        this.phase = Math.PI /10
        this.speed = .01
        this.size = 50
        this.centerShift = 60

        // this.phase = Math.PI /109
        // this.speed = .01
    }

    draw(ctx){
        this.clear(ctx)
        this.tick += 1
        // this.point.pen.line(ctx, undefined, 'red')
        this.points.each.radius = (p, i)=> (Math.cos((i * this.phase)+ (this.tick * this.speed) ) * this.size) + this.centerShift

        this.points.forEach((p)=>{
            p.pen.line(ctx, undefined, 'red')
        })
    }
}


stage = MainStage.go(/*{ loop: true }*/)

