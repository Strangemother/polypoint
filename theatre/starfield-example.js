/*
title: Simple Starfield
categories: minimal
    starfield
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

A simple starfield, with recycled points and general _direction_ and _speed_.

*/

class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        let pin = new Point(0, 0, 1, 0)
        let pin2 = new Point(0, 0, .1, 0)
        this.points = PointList.generate.random(100, [1200, 800], pin)
        this.pins = PointList.generate.random(20, [1200, 800], pin2)

        this.reactor = new VelocityReactor()
        this.reactor.points = this.points

        // the direction of travel, applied to each points velocity.
        let direction = new Point(3, -.35)

        // this.reactor.randomize()

        this.points.forEach(p=>{
            // circle plot area
            // p.xy = random.within(pin, 600)

            p.velocity.set(direction.multiply(p.radius * -.05))

            let light = 80 * (p.radius * .25)
            p.color = `hsl(200, 70%, ${light}%)`
            p.radius *= 3

            // turn to direction of travel
            faceVelocity(p)
        })
    }

    draw(ctx){
        this.clear(ctx)
        this.reactor.step()
        this.points.forEach(p=>this.screenWrap.perform(p))
        this.pins.pen.fill(ctx, '#666')
        this.points.pen.lines(ctx)
        // this.points.pen.indicator(ctx)
        // this.points.pen.fill(ctx, 'green')
    }
}


stage = MainStage.go(/*{ loop: true }*/)

