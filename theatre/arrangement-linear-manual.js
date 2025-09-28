/*
title: Linear Arrangement
categories: arrange
files:
    head
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    stage
    point
    pointlist
    ../point_src/distances.js
    ../point_src/events.js
    ../point_src/functions/clamp.js
    ../point_src/random.js
    ../point_src/dragging.js
    stroke
    ../point_src/relative.js
    ../point_src/automouse.js
    ../point_src/collisionbox.js

*/
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted() {
        let spread = 80
        this.pointA = PointList.generate.list(3, spread, [100,100 + spread]);
        this.pointB = PointList.generate.list(5, spread, [250,100]);
        this.pointC = PointList.generate.list(3, spread, [400,100 + spread]);
        this.pointA.each.radius = this.pointB.each.radius = this.pointC.each.radius = 15
        // this.dragging.add(...this.pointA);
    }

    draw(ctx) {
        this.clear(ctx);
        this.pointA.pen.circle(ctx, undefined, 'purple', 2);
        this.pointB.pen.circle(ctx, undefined, 'purple', 2);
        this.pointC.pen.circle(ctx, undefined, 'purple', 2);
    }

}

stage = MainStage.go()
