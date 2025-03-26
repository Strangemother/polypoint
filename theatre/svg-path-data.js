/*
title: SVG Path Data
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/extras.js
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/functions/clamp.js
    ../point_src/dragging.js
    ../point_src/image.js

---

Load vector commands (SVG commands) as a path using `PathData`.

The instance has a data and a point, used for position, scale, and rotation.

    const path = new PathData("M395.065.638c-.445...")

    path.position.rotation += 1
    path.draw(ctx)
    path.position.pen.circle(ctx)

*/

let path = `M395.065.638c-.445-.068-2.723-.343-3.789.907a2.37,2.37,0,0,0-.344,
            2.4.49.49,0,0,1-.032.436,3.829,3.829,0,0,1-2.1,
            1.154c-.027.006-.046.024-.072.032a9.326,9.326,0,0,0-6.309-2.092,
            10.548,10.548,0,0,0-7.077,3.135l-8.115,8.115c-4,4-4.2,10.293-.457,
            14.036a9.252,9.252,0,0,0,6.6,2.679A10.55,10.55,0,0,0,380.8,
            28.3l8.114-8.114a10.061,10.061,0,0,0,1.32-13.018,4.693,4.693,
            0,0,0,2.4-1.8,2.482,2.482,0,0,0,
            .2-2.039c-.086-.268-.082-.441-.042-.488a3.093,3.093,0,0,1,1.968-.229,
            1,1,0,1,0,.3-1.977ZM382.486,5.469c.1,0,.2,0,.294,0a7.257,7.257,0,0,
            1,4.808,1.763l-3.531,3.531a1.473,1.473,0,0,
            0-1.685.235l-.976.975-4.281-4.281A8.508,8.508,0,0,1,
            382.486,5.469Zm-.53,8.84a.462.462,0,0,1-.634,0l-.11-.109a.45.45,
            0,0,1,0-.634l1.867-1.866a.46.46,0,0,1,.632,0l.111.111a.448.448,
            0,0,1,0,.633Zm-2.568,12.576c-3.218,3.217-8.247,
            3.419-11.209.457s-2.759-7.992.457-11.208l7.756-7.755,4.3,
            4.3-.184.184a1.451,1.451,0,0,0,0,2.048l.11.109h0a1.452,1.452,0,0,
            0,2.048,0l.183-.184,4.3,4.3Zm8.446-8.479-4.28-4.281.975-.975a1.442,
            1.442,0,0,0,.424-1.024,1.414,1.414,0,0,
            0-.185-.666l3.525-3.525A7.951,7.951,0,0,1,387.834,18.406Z`

class MainStage extends Stage {
    canvas='playspace'
    // live=false
    live = true
    mounted(){
        this.path = new PathData(path)
        this.dragging.add(this.path.position)
    }

    draw(ctx){
        this.clear(ctx)
        this.path.position.rotation += 1
        this.path.position.pen.circle(ctx)
        this.path.draw(ctx)
    }
}


;stage = MainStage.go();