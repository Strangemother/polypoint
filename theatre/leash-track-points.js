/*
title: One-way Leash
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
---

A point can "track" or "leash" to another point. In this setup it works in
one-direction. Where the _locked point_ can pull the secondary point, but will
stay locked when pulled.

+ `leash()` ensures the secondary point is _within_ a set distance.
+ `track()` locks the secondary point at a target distance.

*/

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.points = new PointList(
            new Point(250, 150, 10)
            , new Point(400, 320, 7)
            , new Point(450, 520,  10)
            , new Point(490, 490,  7)
        )

        this.dragging.add(...this.points)
    }

    draw(ctx){
        this.clear(ctx)

        let mouse = Point.mouse.position

        // point[3] _tracks_ point[2]
        this.points[3].track(this.points[2], 200)
        // point[1] _leashes to_ point[0]
        this.points[1].leash(this.points[0], 200)

        this.points[1].pen.indicator(ctx)
        this.points[3].pen.indicator(ctx)

        this.points[0].pen.fill(ctx, '#33aadd')
        this.points[2].pen.fill(ctx, '#33aadd')

    }
}

stage = MainStage.go(/*{ loop: true }*/)
