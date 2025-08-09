/*
title: Lerp Mapping.
categories: lerp
files:
    head
    pointlist
    point
    stage
    stroke
    mouse
    dragging
    ../point_src/random.js
    ../point_src/easing.js
    ../point_src/iter/lerp.js
    ../theatre/apple-motion-algo.js
---

An example of _pure lerp mapping_ without any polypoint Lerp tools.
The `StaticLerpMap` hosts its own set of values for all points.

The stepMotion function:

```js
(t)=>stepMotion(t, .01, 0.5, .6, 8)
```
+ **t**: time delta: 0-1
+ anticipation: `.1`
+ midpoint: `.5`
+ oscilation: `.1`
+ damping: `.1`
*/


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        let count = 30
        this.point = new Point(200, 200)
        this.a = new Point(100, 100)
        this.b = new Point(500, 500)
        let commonVal = this.commonVal = new Value()
        commonVal.doneStop = true
        this.currentTime = 0
        this.seconds = 1
        commonVal.setEasing((t)=>stepMotion(t, .01, 0.5, .6, 8))
    }
    onclick(e) {
        console.log(arguments)
        this.a = this.point.copy()
        this.b = Point.from(e)
        this.currentTime = 0
    }
    draw(ctx) {
        this.clear(ctx)

        let spl = 1 / (60 * this.seconds)
        this.point.pen.fill(ctx, 'green')

        let p = this.point;
        let k = 'x'
        let a = this.a;
        let b = this.b;
        let l = this.currentTime += spl
        p.x = this.commonVal.pluck(a.x, b.x, l)
        p.y = this.commonVal.pluck(a.y, b.y, l)

        this.a.pen.fill(ctx, '#880000')


    }

}



;stage = MainStage.go();