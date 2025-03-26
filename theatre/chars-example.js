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

class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        // this.dragging.add()
    }

    draw(ctx){
        this.clear(ctx)
    }
}


;stage = MainStage.go();