/*
title: Stage Stretch Scaling
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/stage.js

---

A stage will adapt to its global size.

    #playspace {
        height: 100%;
        width: 100%;
        border: solid 1px;
    }

When resizing the page, the `canvas` element dimensions will change.
The Stage will adapt after the resize event.
 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.center.radius = 50
    }

    draw(ctx){
        this.clear(ctx)

        let c = this.center
        // c.lookAt(Point.mouse.position)
        c.pen.indicator(ctx, {color:'green'})
    }
}

stage = MainStage.go()
