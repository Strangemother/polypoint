/*
category: constraints
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
                 x: 450, y: 520
                , vx: .4, vy: -.1
                , radius: 8
                , mass: 8
            })
            , new Point({
                 x: 450, y: 520
                , vx: .4, vy: -.1
                , radius: 8
                , mass: 8
            })
            , new Point({
                 x: 450, y: 520
                , vx: .4, vy: -.1
                , radius: 8
                , mass: 8
            })
        )
    }

    draw(ctx){
        this.clear(ctx)

        let mouse = Point.mouse.position
        // constrainDistance(mouse, this.points[0], 50)
        // constrainDistance(this.points[0], this.points[1], 50)
        // constrainDistance(this.points[1], this.points[2], 50)
        // constrainDistance(this.points[2], this.points[3], 50)
        // constrainDistance(this.points[3], this.points[4], 50)
        // constrainDistance(this.points[4], this.points[5], 50)

        this.points[0].leash(mouse, 50)
        this.points[1].leash(this.points[0], 50)
        this.points[2].leash(this.points[1], 50)
        this.points[3].leash(this.points[2], 50)
        this.points[4].leash(this.points[3], 50)
        this.points[5].leash(this.points[4], 50)

        // this.points.last().rotation += 2
        this.points.pen.indicators(ctx)

    }
}

stage = MainStage.go(/*{ loop: true }*/)
