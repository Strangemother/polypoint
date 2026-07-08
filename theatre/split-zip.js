/*
---
title: Zipper Split
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
    stage
    ../point_src/extras.js
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/split.js
    ../point_src/curve-extras.js
    ../point_src/functions/zip.js
*/
class MainStage extends Stage {
    canvas='playspace'
    // live=false
    live = true
    mounted(){
        this.point = new Point(300, 400, 100)
        this.count = 20

        this.point1 = new Point(300, 400, 50)
        this.point2 = new Point(300, 400, 120)

        let lpoints = [new Point(100, 100), new Point(500, 100)]
        this.line = new Line(...lpoints)

        let lpoints2 = [new Point(100, 200), new Point(500, 200)]
        this.line2 = new Line(...lpoints2)

        this.dragging.add(this.point
                , ...lpoints
                , ...lpoints2
                , this.point1
                , this.point2

            )

        // this.splits1 = this.line.split(this.count, -90)
        // this.splits2 = this.line2.split(this.count, 90)
    }

    draw(ctx){
        this.clear(ctx)

        // let pos = this.mouse.position
        // pos.pen.circle(ctx)

        // this.point.pen.indicator(ctx)
        // this.point.split(this.count, degToRad(0)).pen.indicators(ctx)

        // this.splits1.pen.indicators(ctx)
        // this.splits2.pen.indicators(ctx, {color:'green'})

        this.line.render(ctx)
        this.line2.render(ctx, {color: 'green'})

        let splits1 = this.line.split(this.count, -90)
        let splits2 = this.line2.split(this.count, 90)

        this.point1.pen.circle(ctx)
        this.point2.pen.circle(ctx)

        let pointSplits1 = this.point1.split(this.count, -90)
        let pointSplits2 = this.point2.split(this.count, 90)

        for(let xx of zip(pointSplits1, pointSplits2)) {
            // (new PointList(...xx)).pen.line(ctx)  // Spread the pair
            xx.forEach(x=>x.radius=100);
            xx[0].pen.line(ctx, xx[1])
            // (new BezierCurve(...xx)).render(ctx)  // Spread the pair
        }

        for(let xx of zip(splits1, splits2)) {
            // (new PointList(...xx)).pen.line(ctx)  // Spread the pair
            xx.forEach(x=>x.radius=100);
            xx[0].pen.line(ctx, xx[1])
            // (new BezierCurve(...xx)).render(ctx)  // Spread the pair
        }

    }
}


;stage = MainStage.go();