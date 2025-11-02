/*
title: Flame
files:
    head
    stroke
    ../point_src/point-content.js
    pointlist
    point
    ../point_src/bisector.js
    ../point_src/functions/clamp.js
    dragging
    mouse
    ../point_src/random.js
    stage
    ../point_src/curve-extras.js
---

A simple _flame_ or teardrop shape, using two origin points for each example.

The shape of the flame is dependant upon the position, radius, and rotation of
the origin points. The result is four points producing two curves.
*/


class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        console.log('mounted')
        this.regen()
    }
    regen() {
        this._t = 0
        let ps = this.points = new PointList(
            new Point(120, 300, 50),
            new Point(120, 100, 50),

            new Point(250, 300, 80),
            new Point(250, 100, 70),

            new Point(400, 300, 40),
            new Point(400, 100, 50),
        )

        this.curvesA = this.generateFlame(
            ps[0],
            ps[1]
        )

        this.curvesB = this.generateFlame(
            ps[2],
            ps[3],
            1,
        )

        this.curvesC = this.generateFlame(
            ps[4],
            ps[5],
            60,
        )

        this.curves = [
            this.curvesA[1],
            this.curvesB[1],
            this.curvesC[1],
        ]

        this.plots = [
            this.curvesA[0],
            this.curvesB[0],
            this.curvesC[0],
        ]

    }

    generateFlame(a, b, tilt){
        let plots = this.plotFlame(a, b, tilt)
        let curves = this.createCurves(plots)
        return [plots, curves]
    }

    plotFlame(basePoint, tipPoint, tilt=30) {

        /* The base point is the _foot_ of the flame.*/
        let bRight = basePoint.copy()
        bRight.radians = 0
        let bLeft = bRight.copy()
        bLeft.rotation += 180

        /* the tip generates a sharp tip - to a more rounded tip. */
        let ta = tipPoint.copy()
        ta.rotation = this.compass.down + tilt + (random.int(-20, 20))
        let tb = ta.copy()
        tb.rotation -= tilt * 2

        return new PointList(ta, tb, bLeft, bRight)
    }

    createCurves(plots) {
        let curveA = new BezierCurve(plots[0], plots[2])
        let curveB = new BezierCurve(plots[1], plots[3])
        curveA.doTips = false;
        curveB.doTips = false;
        return [curveA, curveB]
    }

    draw(ctx) {
        this.clear(ctx);
        // let pin = this.basePoint
        // let tip = this.tipPoint
        // pin.pen.indicator(ctx, {color:'red'})
        // tip.pen.indicator(ctx, {color:'red'})
        // this.flamePS.pen.indicator(ctx)

        // this.curveA.render(ctx, {color: 'green'})
        // this.curvesA.forEach(c=>c.render(ctx, {color: 'orange'}))
        this.plots.forEach((plots)=>{
            // plots.forEach(c=>c.render(ctx, {color: 'orange'}))
            plots.pen.indicator(ctx, {line: {width: 1}, color: '#222'})
        })

        this.curves.forEach((curves)=>{
            curves.forEach(c=>c.render(ctx, {color: 'orange'}))
        })


        // this.points.pen.fill(ctx, '#BBB', 2)
        // this.points.pen.indicators(ctx,)
        this._t++;
        (this._t % random.int(5,17) == 0) && this.regen()
        // if(this._t % 2 == 0) {
        //     let x = random.int(120, 125)
        //     this.curves[0] = this.generateFlame(
        //         new Point(x, random.int(300, 303), random.int(40, 55)),
        //         new Point(x, random.int(100, 103), random.int(100, 103))
        //     )
        // }
    }
}

const stage = MainStage.go()
