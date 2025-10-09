/*

title: Plotter
files:
    head
    point
    stage
    dragging
    pointlist
    mouse
    stroke
    fps
    ../point_src/functions/signedNorm.js
    ../theatre/objects/vectorpoint.js
    ../theatre/objects/spinplotter.js
    ../point_src/screenwrap.js
    ../point_src/velocity.js
---

Plotting captures the XY RAD ROT of a point upon request, and stashes it in a
pointlist. This is useful for timestep captures such as spline walks.

*/

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

class StarsStage extends Stage {
    canvas = 'playspace'
    mounted() {
        let pin = new Point(0, 0, 1, 0)
        let pin2 = new Point(0, 0, .1, 0)
        this.points = PointList.generate.random(50, [1200, 800], pin)
        this.pins = PointList.generate.random(20, [1200, 800], pin2)

        this.reactor = new VelocityReactor()
        this.reactor.points = this.points

        // the direction of travel, applied to each points velocity.
        let direction = new Point(-3, 0)

        // this.reactor.randomize()

        this.points.forEach(p=>{
            // circle plot area
            // p.xy = random.within(pin, 600)

            p.velocity.set(direction.multiply(p.radius * -.05))

            let light = 30 * (p.radius * .25)
            p.color = `hsl(0, 40%, ${light}%)`
            p.radius *= 3

            // turn to direction of travel
            faceVelocity(p)
        })
    }

    draw(ctx){
        this.clear(ctx)
        this.reactor.step()
        this.points.forEach(p=>this.screenWrap.perform(p))
        // this.pins.pen.fill(ctx, '#666')
        this.points.pen.lines(ctx)
        // this.points.pen.indicator(ctx)
        // this.points.pen.fill(ctx, 'green')
    }
}


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){

        let slideSpeed = [2,0];

        this.spinPlotter3 = new SpinPlotter({
            x: this.center.x
            , y: this.center.y
            , radius: 100
            , maxPlotCount: 150
            , slideSpeed
            , plotModulo: 4
            , spinSpeed: -2
            , direction: 'both'
            // , direction: 'sin'
            , plotColor: '#77AA33'
        })

        this.dragging.add(this.spinPlotter3)
    }


    draw(ctx){
        this.fps.print(ctx)
        this.spinPlotter3.render(ctx)


    }
}

stage = StarsStage.go(/*{ loop: true }*/)
stage2 = MainStage.go()