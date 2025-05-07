/*
title: Grid Panning
category: grid plane
files:
    head
    point
    pointlist
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/gridplane.js
    stage
    mouse
    dragging
    stroke
 */

// var gravity = {x: 0, y:-0.05}; // Gravity constant for helium balloon.
var gravity = {x: 0, y:1}; // Gravity constant


class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        console.log('mounted')
        // this.mouse.position.vy = this.mouse.position.vx = 0

        // new Point({ x: 200, y: 200, radius: 140, vx: 0, vy: 0})
        this.point = this.center.copy().update({radius: 50})
        //new Point({ x: 300, y: 100, vx: 0, vy: 0})
        this.pin = this.center.copy().update({radius: 10})
        this.dragging.add(this.pin, this.point)
        this.plane = new GridPlane(this.dimensions)
        this.plane.mounted(this.pin, this.point)
    }

    onContextmenu(e) {
        e.preventDefault()
        e.stopImmediatePropagation()
        return false;
    }

    onMousedown(ev) {
        // console.log('down')
        if(ev.button == 2) {
            this.plane.trackDown(Point.from(ev))
        }
    }

    onMouseup(ev) {
        // console.log('Up')
        if(ev.button == 2) {
            this.plane.trackUp(Point.from(ev))
        }
    }

    draw(ctx) {
        this.clear(ctx);
        let mp = this.mouse.point;
        let b = this.plane.panPlane(mp)
        this.panOffset = b
        this.plane.drawLines(ctx, ~~this.point.radius, b)

        let other = this.point
        let pin = this.pin
        other.pen.circle(ctx, {color:'red'})
        pin.pen.indicator(ctx)
    }

}

const stage = MainStage.go()
