/*
---
title: Split
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/extras.js
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/split.js
    ../point_src/curve-extras.js
    ../point_src/iter/alpha.js
    ../point_src/iter/beta.js

*/
class MainStage extends Stage {
    canvas='playspace'
    // live=false
    live = true
    mounted(){
        this.point = new Point(300, 400, 100)
        this.count = 20
        this.offset = undefined
        let lpoints3 = [new Point(100, 300, 400, 50), new Point(500, 300, 200, 250)]
        this.curve = new BezierCurve(...lpoints3)
        this.dragging.add(this.point, ...lpoints3)

        // this.lerper = new Iterator(0, .1, 1)
        this.tick = 0

        addControl('tangent', {
            type: 'range'
            , field:  'input'
            , stage: this
            , onchange(ev) {
                /*slider changed. */
                // debugger;
                let sval = ev.currentTarget.value
                this.stage.offset = parseFloat(sval) * .01
            }
        })
    }

    draw(ctx){
        this.clear(ctx)

        let pos = this.mouse.position
        pos.pen.circle(ctx)

        // let v = this.lerper.step(1)
        let offset = this.offset

        if(offset == undefined) {
            offset = Math.sin((this.tick++ * .005) % Math.PI)
        }

        let l = this.curve
        let ps = l.points
        ps.pen.indicators(ctx, {color:'#333'})
        l.render(ctx, {color: 'green'})
        l.getControlPoints().forEach(p=>p.pen.fill(ctx, 'darkred'))

        let bp = get_bezier_point(l.a, ...l.getControlPoints(), l.b, offset)

        let spot = Point.from(bp)
        spot.pen.fill(ctx, 'purple')

        let { dx, dy } = get_bezier_derivative(l.a, ...l.getControlPoints(), l.b, offset)
        let p = new Point(200, 300, 40)
        p.xy = spot.project(30).xy

        let theta = Math.atan2(dy, dx)
        p.radians = theta

        p.pen.indicator(ctx)

        // this.curve.splitInner(this.count, degToRad(0)).pen.indicators(ctx)
        // this.curve.splitHinted(this.count).pen.indicators(ctx, {color:'red'})

    }
}


;stage = MainStage.go();