/*
title: Point Click Detection
category: mouse
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/functions/clamp.js
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/stage.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/relative.js
    ../point_src/velocity.js
    ../point_src/emitter.js
    ../point_src/text/beta.js

---

*/
class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        let p = this.point = new Point(100, 100, 20)

        p.onMousedown = (e)=>{
            p.color = random.color(360, [30, 100], [60,100])
        }

        this.dragging.add(p)
    }

    draw(ctx){
        this.clear(ctx)
        this.point.pen.fill(ctx, this.point.color ?? '#88000')
    }
}


stage = MainStage.go(/*{ loop: true }*/)

