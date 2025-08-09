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

In this example, we use the `PointList.lerper.through(a, b)`, but edit one of
the elements.

Importantly the settings for the lerper must be static, else updates to the
_current time_ of a unique node is forgotten.
*/

class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        let count = 50
        this.a = PointList.generate.random(count, [200,350, 20, 200], [60, 150, 1, 1])
        this.b = PointList.generate.radius({count: count, offset: {radius:3}}, 140, new Point(500, 300))
        this.c = PointList.generate.random(count)

        addButton('button', {
            label: 'reset'
            , onclick() {
                console.log('click')
                stage.c.lerper.currentTime = 0
            }
        })

        this.persistentLerperSettings = {
            seconds: 3
            , easing: quadEaseOut
            , 10: {
                // easing: exponentialEaseInOut
                // easing: { x: exponentialEaseInOut, y: bounceEaseOut }
                // easingX: exponentialEaseInOut
                easing: (t)=>stepMotion(t, .1, 0.8, 4, 3)
                // , seconds: .7
                 , delay: 2.6
                 // , currentTime: -(2.6/.7)
            }
        }
    }


    resetTime() {
        /*Relay the time to 0*/
        this.currentTime = 0
    }


    draw(ctx) {
        this.clear(ctx)

        this.a.pen.indicator(ctx, 'green')
        this.b.pen.indicator(ctx, {color:'#333'})

        this.c.lerper.through(this.a, this.b, this.persistentLerperSettings)
        this.c.pen.indicator(ctx, {color:'purple'})
        this.c[10].pen.fill(ctx, {color:'purple'})
    }
}


;stage = MainStage.go();