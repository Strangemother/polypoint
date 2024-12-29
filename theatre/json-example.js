/*
title: Follow
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/extras.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/point.js
    ../point_src/stage.js
    mouse
    dragging
    ../point_src/constrain-distance-locked.js
    ../point_src/constrain-distance.js
    stroke
---

 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.points = new PointList(
            new Point({
                 x: 250, y: 150
                , radius: 10
                , vx: 1, vy: 0
                , mass: 2
            })
            , new Point({
                 x: 400, y: 320
                , vx: -1, vy: 0
                , radius: 20
                , mass: 10
            })
            , new Point({
                 x: 200, y: 320
                , vx: .4, vy: -.1
                , radius: 10
                , mass: 8
            })
            , new Point({
                 x: 110, y: 220
                , vx: .4, vy: -.1
                , radius: 8
                , mass: 8
            })
            , new Point({
                 x: 230, y: 120
                , vx: .4, vy: -.1
                , radius: 22
                , mass: 8
            })
            , new Point({
                 x: 450, y: 520
                , vx: .4, vy: -.1
                , radius: 8
                , mass: 8
            })
        )

        this.dragging.add(...this.points)
    }

    draw(ctx){
        this.clear(ctx)
        this.points.pen.indicators(ctx)
    }
}

stage = MainStage.go(/*{ loop: true }*/)
