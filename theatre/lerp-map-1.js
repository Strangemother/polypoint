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
---

An example of _pure lerp mapping_ without any polypoint Lerp tools.
The `StaticLerpMap` hosts its own set of values for all points.

*/

class LerpMap {
    constructor(conf) {
        this.conf = conf
    }

    start() {
        /* A _wake_ with a begin. allowing _Step_ to function */
    }

    step() {
        /*
        iter all points in A, lerping B.
         */
    }

}

class StaticLerpMap extends LerpMap {

    start() {
        /* Copy to the largest. */
        let a = this.conf.start
        let b = this.conf.end
        let m = Math.max(this.conf.start.length, b.length)
        // this.lerps = new Array(m)
        this.lerps = Array.from({length:m}, (u,i) => {
                return {
                    _from: a[i]
                    , _to: b[i]
                    , x: { _from: a[i].x, _to: b[i].x, step: 0 }
                    , y: { _from: a[i].y, _to: b[i].y, step: 0 }
                    , radius: { _from: a[i].radius, _to: b[i].radius, step: 0 }
                }
        })
        // console.log(this.lerps)
        this.seconds = 5
        this.currentTime = 0
    }

    step() {
         let spl = 1 / (60 * this.seconds)
         this.currentTime += spl
         this.lerps.forEach((o, i)=>{
            o.x.step = this.currentTime
            o.y.step = this.currentTime
            o.radius.step = this.currentTime
        })
    }
}
/* A static lerp stores a _Value_ for all vars. */

class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        let count = 30
        this.a = PointList.generate.random(count, [300,300, 10, 0], [100, 100, 1, 1])
        this.b = PointList.generate.random(count, [400,400, 10, 0], [400, 100, 1, 1])
        this.c = PointList.generate.random(count)

        let lm = this.lerpMap = new StaticLerpMap({
            start: this.a
            , end: this.b
        })

        lm.start()
    }

    draw(ctx) {
        this.clear(ctx)
        this.b.pen.fill(ctx, 'purple')
        this.a.pen.fill(ctx, 'green')
        this.lerpMap.step()

        const lerps = this.lerpMap.lerps
        let commonVal = new Value()
        commonVal.doneStop = true
        commonVal.setEasing(quarticEaseInOut)

        // let pa = this.a
        // let pb = this.b

        this.c.forEach((p,i)=>{
            let l = lerps[i]
            // let a = pa[i]
            // let b = pb[i]

            p.x = commonVal.pluck(l.x._from,
                                    l.x._to,
                                    l.x.step
                                    )

            p.y = commonVal.pluck(l.y._from,
                                    l.y._to,
                                    l.y.step
                                    )

            p.radius = commonVal.pluck(l.radius._from,
                                    l.radius._to,
                                    l.radius.step
                                    )
            // p.x = commonVal.pluck(lx.a)
            // lx.step()
        })
        this.c.pen.fill(ctx, '#ddd')


    }

}



;stage = MainStage.go();