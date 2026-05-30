/*
---
title: Locked Joint
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/pointlist.js
    ../point_src/point-content.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/stage.js
    ../point_src/constrain-distance.js
---

Same as locked-joint but when you move the knee joint, the hip rotates.
Assigning a `resist` of `0` (default: `1`), allows the parent point to
be rotated around its center.

If the resist value was `.5`, it would rotate
50% of the pull distance of the target knee, and the knee reciprocates with 50%
damping on its position.
 */
class MainStage extends Stage {
    canvas='playspace'

    mounted(){

        let a = this.a = new Point({x:200,y:200, radius: 50,
                            rotation: 10,
                            cone: 50
                        })
        let b = this.b = new Point({x:400,y:200, radius: 30,
                rotation: 0,
                /* degrees  either side of rotation point.
                resulting in 10 arc degress allowed movement.*/
                cone: 10})
        // let c = this.c = new Point({x:600,y:200, radius: 20})

        this.dragging.add(a, b)

    }

    draw(ctx){
        this.clear(ctx)

        // this.a.rotation += 1

        this.a.constraint.cone(this.b, this.a.cone, { resist: 0})
        this.b.constraint.cone(this.c, this.b.cone)

        this.b.constraint.track(this.a, 200)
        // this.c.constraint.track(this.b, 100)

        this.a.pen.indicator(ctx, {color:'#ddd'})
        this.b.pen.indicator(ctx, {color:'green'})
        this.c.pen.indicator(ctx)
    }
}


;stage = MainStage.go();