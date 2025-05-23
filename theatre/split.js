/*
---
title: Split
categories: split
    curve
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
*/
class MainStage extends Stage {
    canvas='playspace'
    // live=false
    live = true
    mounted(){
        this.point = new Point(300, 400, 100)
        this.count = 20

        let lpoints = [new Point(100, 100), new Point(500, 100)]
        this.line = new Line(...lpoints)


        let lpoints2 = [new Point(100, 200), new Point(500, 200)]
        this.line2 = new Line(...lpoints2)

        let lpoints3 = [new Point(100, 700, 200), new Point(500, 700, 200)]
        this.curve = new BezierCurve(...lpoints3)

        let lpoints4 = [new Point(100, 800, 200), new Point(500, 800, 200)]
        this.curve2 = new BezierCurve(...lpoints4)

        this.dragging.add(this.point, ...lpoints, ...lpoints2, ...lpoints3, ...lpoints4)
    }

    draw(ctx){
        this.clear(ctx)

        let pos = this.mouse.position
        pos.pen.circle(ctx)

        this.point.pen.indicator(ctx)
        this.point.split(this.count, degToRad(0)).pen.indicators(ctx)

        this.line.render(ctx)
        this.line.split(this.count, 90).pen.indicators(ctx)

        this.line2.splitInner(this.count, 90).pen.indicators(ctx, {color:'green'})
        this.line2.render(ctx, {color: 'green'})

        this.curve.render(ctx, {color: 'green'})
        this.curve.splitInner(this.count, degToRad(0)).pen.indicators(ctx)

        this.curve2.render(ctx, {color: 'red'})
        this.curve2.split(this.count,  0, ctx).pen.indicators(ctx)
        // let l = this.curve.splitHinted(this.count).pen.indicators(ctx, {color:'red'})

        // let [p0, p3] = this.curve2.points
        // let midX = (p0.x + p3.x) * .5
        // let midY = (p0.y + p3.y) * .5
        // let mid = new Point(midX, midY)

        // mid.pen.indicator(ctx, {color:'yellow'})
    }
}


;stage = MainStage.go();