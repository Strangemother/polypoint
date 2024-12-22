/*
title: Collision with Locks.
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
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/events.js
    ../point_src/functions/clamp.js
    ../point_src/random.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/relative.js
    ../point_src/automouse.js
    ../point_src/collisionbox.js

*/
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted() {
        this.mouse.point.radius = 20

        this.points = PointList.generate.grid(50, 10, 40, {x: 200, y:200});
        this.points.each.radius = (p)=>p.radius=10+random.int(20)

        this.lockedPoints = new PointList(
            this.points[9],
            this.points[33]
        )

        this.lockedPoints.each.locked = true

        this.dragging.add(...this.points);

        this.collisionbox = new CollisionBox(this.points)
    }

    draw(ctx) {
        this.clear(ctx);
        this.collisionbox.step(this.mouse.point)

        this.mouse.point.pen.indicator(ctx);
        this.points.pen.indicators(ctx);
        this.lockedPoints.pen.fill(ctx, '#880000');

    }

}

stage = MainStage.go()
