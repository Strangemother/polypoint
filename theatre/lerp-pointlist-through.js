/*
title: PointList Lerper method
categories: lerp
files:
    head
    pointlist
    point
    stage
    mouse
    stroke
    ../point_src/random.js
    ../point_src/easing.js
    ../point_src/iter/lerp.js
    ../theatre/apple-motion-algo.js
---

In this example, we use the `PointList.lerper.through(a, b)` to lerp all the points

    points.lerper.through(
        startPositions
        , endPositions
        , {seconds: 5}
    )
*/

class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        let count = 50
        this.a = PointList.generate.random(count, [200,350, 20, 200], [60, 150, 1, 1])
        this.b = PointList.generate.radius({count: count, offset: {radius:3}}, 140, new Point(500, 300))
        this.c = PointList.generate.random(count)
    }

    draw(ctx) {
        this.clear(ctx)

        this.a.pen.indicator(ctx, 'green')
        this.b.pen.indicator(ctx, {color:'#333'})

        this.c.lerper.through(this.a, this.b, {
            seconds: 3
            , easing: quadEaseOut
        })

        this.c.pen.indicator(ctx, {color:'purple'})
    }
}


;stage = MainStage.go();