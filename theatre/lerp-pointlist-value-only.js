/*
title: PointList Interpolation Values
categories: lerp
files:
    head
    pointlist
    point
    stage
    mouse
    ../point_src/random.js
    ../point_src/easing.js
    ../point_src/iter/lerp.js
---

Lerp points C without affecting points A or B, using a single `Value()` instance.
*/

class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        let count = 50
        // this.a = PointList.generate.grid(count, 10, 20,  new Point(200, 200))
        this.a = PointList.generate.random(count, [200,350, 10, 0], [60, 150, 1, 1])
        this.b = PointList.generate.radius(count, 140, new Point(500, 300))
        // this.b = PointList.generate.random(count, [400,400, 10, 0], [300, 100, 1, 1])
        this.c = PointList.generate.random(count)
        this.currentTime = 0
        this.seconds = 4

        let commonVal = this.commonVal = new Value()
        commonVal.doneStop = true
        commonVal.setEasing(quarticEaseInOut)
    }

    draw(ctx) {
        this.clear(ctx)

        this.a.pen.fill(ctx, 'green')
        this.b.pen.fill(ctx, '#333')

        let spl = 1 / (60 * this.seconds)
        let lerpKeys = ['x', 'y', 'radius']
        let commonVal = this.commonVal
        let lerps = this.lerps
        let pa = this.a
        let pb = this.b

        let l = this.currentTime += spl

        this.c.forEach((p,i)=> {
            let a = pa[i]
            let b = pb[i]

            lerpKeys.forEach(k=>{
                p[k] = commonVal.pluck(a[k], b[k], l)
            })
        })

        this.c.pen.fill(ctx, 'purple')
    }
}

;stage = MainStage.go();