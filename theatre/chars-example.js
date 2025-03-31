/*
title: Char Example
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