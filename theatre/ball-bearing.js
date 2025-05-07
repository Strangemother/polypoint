/*
title: Ball Bearing
categories: ball
    constraint
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/stage.js
    ../point_src/point.js
    ../point_src/distances.js
    ../point_src/pointlist.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/functions/rel.js
    dragging
    ../point_src/constrain-distance.js


Simulate collisions using a _string_. Here we replicate one of those
little balls inside a circle
*/

// var gravity = {x: 0, y:-0.05}; // Gravity constant for helium balloon.
var gravity = {x: 0, y:1}; // Gravity constant

class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        console.log('mounted')
        // this.mouse.position.vy = this.mouse.position.vx = 0

        this.pin = new Point({ x: 200, y: 200, radius: 140, vx: 0, vy: 0})
        this.point = new Point({ x: 300, y: 100, vx: 0, vy: 0})
        this.dragging.add(this.pin, this.point)
    }

    draw(ctx) {
        this.clear(ctx);

        let pin = this.pin
        let other = this.point
        let settings = {
            gravity
            , forceMultiplier: .9
            , dotDamping: .17
            , damping: .98
            , distance: pin.radius - other.radius - 2
        }

        settings = {
            gravity
            , forceMultiplier: 1
            // , dotDamping: .17
            // , damping: .98
            , distance: pin.radius - other.radius - 2
        }

        pin.constraint.string(other, settings)
        pin.pen.circle(ctx, {color:'red'})
        other.pen.indicator(ctx)

    }
}

const stage = MainStage.go()
