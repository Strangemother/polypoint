/*
title: Spring Boundary Point
categories: springs
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/functions/springs.js
    ../point_src/extras.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    dragging
    ../point_src/stage.js
    stroke
    mouse


moved to functions/springs
*/

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.points = new PointList(
            new Point({
                 x: 150, y: 230
                , radius: 10
                , vx: 1, vy: 0
                , mass: 10
            })
            , new Point({
                 x: 350, y: 200
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
            // , new Point({
            //      x: 450, y: 520
            //     , vx: .4, vy: -.1
            //     , radius: 8
            //     , mass: 8
            // })
        )
    }

    draw(ctx){
        this.clear(ctx)

        let mouse = Point.mouse.position
        let ps = this.points;

        let restLength = 100;
        let springConstant = .6;
        let dampingFactor = 0.99; // Adjust this value between 0 and 1

        const lockedPoints = new Set([ps[0]]); // Lock pointA in place


        applySpringForceDistributed(ps[0], ps[1], restLength, springConstant, dampingFactor, lockedPoints);
        applySpringForceDistributed(ps[1], ps[2], restLength, springConstant, dampingFactor, lockedPoints);
        applySpringForceDistributed(ps[2], ps[0], restLength, springConstant, dampingFactor, lockedPoints);

        // this.points.last().rotation += 2
        this.points.pen.indicators(ctx)

    }
}

stage = MainStage.go(/*{ loop: true }*/)
