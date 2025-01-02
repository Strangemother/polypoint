/*
title: A Grid.
src_dir: ../point_src/
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/stage.js
    ../point_src/point.js
    ../point_src/distances.js
    pointlist
    ../point_src/events.js
    ../point_src/functions/clamp.js
    ../point_src/dragging.js
    stroke
    mouse
 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.points = PointList.generate.grid(100, 10, 50)
        this.dragging.add(...this.points)
    }

    draw(ctx){
        this.clear(ctx)
        this.points.pen.indicators(ctx)
    }
}

stage = MainStage.go()
