/*
title: Bubble Box Example
categories: minimal
    velocity
files:
    head
    point
    pointlist
    stroke
    stage
    mouse
    dragging
    ../point_src/random.js
    ../point_src/screenwrap.js
    ../point_src/velocity.js
---

The minimal requirements include the _head_, _stage_, and the _point_.
*/

class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        let pin = this.center.copy().update({radius: .1})
        this.points = PointList.generate.random(1000, 400, pin)
        // this.points = PointList.generate.random(300, 400, pin)

        this.reactor = new VelocityReactor()
        this.reactor.points = this.points
        let direction = new Point(-1, 1)
        this.reactor.randomize()
        this.points.forEach(p=>{
            // speed relative to size.
            p.xy = random.within(pin, 600)
            // turn to direction of travel
            faceVelocity(p)
            let v = p.radius * 12
            let s = 100 - v//(p.velocity.length() * 100)
            p.color = `hsl(200, ${s}%, ${v}%)`
        })
        // this.screenWrap.setDimensions({
        //     top: 100
        //     , left: 100
        //     , bottom: 500
        //     , right: 500
        // })
        // this.dragging.add(this.points)
    }

    draw(ctx){
        this.clear(ctx)
        this.reactor.step()
        // this.points.forEach(p=>this.screenWrap.perform(p))
        this.screenWrap.performMany(this.points)
        // this.points.pen.indicator(ctx)
        this.points.pen.fill(ctx,)
    }
}


stage = MainStage.go(/*{ loop: true }*/)

