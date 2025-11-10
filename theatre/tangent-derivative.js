/*
---
title: Tangent Derivative Calculation
categories: tangents
files:
    ../point_src/math.js
    head
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    pointlist
    ../point_src/point.js
    mouse
    ../point_src/stage.js
    ../point_src/extras.js
    ../point_src/random.js
    dragging
    stroke
    ../point_src/split.js
    ../point_src/curve-extras.js
    ../point_src/iter/alpha.js
    ../point_src/text/beta.js
    ../point_src/velocity.js
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


        this.tl = new Point(100, 100)
        this.spot = new Point(100, 200)
        let v = this.spot.velocity
        v.x = 1
        v.y = 1
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

        let {dx,dy} = this.getDerivative(l, offset)
        let theta = Math.atan2(dy, dx)
        let spot = this.plotPoint(l, offset, theta)

        spot.pen.fill(ctx, 'purple')
        let p = new Point(200, 300, 40)
        p.xy = spot.project(30).xy
        p.radians = theta

        let wt = `${dx.toFixed(2)}, ${dy.toFixed(2)}, ${theta.toFixed(1)}`
        this.tl.text.string(ctx, wt)
        p.pen.indicator(ctx)
        // this.curve.splitInner(this.count, degToRad(0)).pen.indicators(ctx)
        // this.curve.splitHinted(this.count).pen.indicators(ctx, {color:'red'})
    }

    getDerivative(curve, offset){
        // let { dx, dy } = get_bezier_derivative(l.a, ...l.getControlPoints(), l.b, offset)
        return get_bezier_derivative(
                curve.a
                , ...curve.getControlPoints()
                , curve.b
                , offset
            )
    }

    plotPoint(curve, offset, theta){
        let bp = get_bezier_point(
                curve.a
                , ...curve.getControlPoints()
                , curve.b
                , offset)
        this.spot.copy(bp)
        return this.spot
    }
}


;stage = MainStage.go();