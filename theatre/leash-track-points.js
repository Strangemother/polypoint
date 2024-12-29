/*
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/extras.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/stage.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    dragging
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/constrain-distance.js
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
                , radius: 10
                , mass: 10
            })
            , new Point({
                 x: 450, y: 520
                , vx: .4, vy: -.1
                , radius: 8
                , mass: 8
            })
            , new Point({
                 x: 490, y: 490
                , vx: .4, vy: -.1
                , radius: 8
                , mass: 8
            })
            // , new Point({
            //      x: 450, y: 520
            //     , vx: .4, vy: -.1
            //     , radius: 8
            //     , mass: 8
            // })
            // , new Point({
            //      x: 450, y: 520
            //     , vx: .4, vy: -.1
            //     , radius: 8
            //     , mass: 8
            // })
        )

        this.dragging.add(...this.points)
    }

    draw(ctx){
        this.clear(ctx)

        let mouse = Point.mouse.position

        this.points[3].track(this.points[2], 200)
        this.points[1].leash(this.points[0], 200)

        this.points[1].pen.indicator(ctx)
        this.points[3].pen.indicator(ctx)

        this.points[2].pen.fill(ctx, '#33aadd')
        this.points[0].pen.fill(ctx, '#33aadd')

    }
}

stage = MainStage.go(/*{ loop: true }*/)
