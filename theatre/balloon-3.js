/*
title: Better Balloon
categories: chain
    rope
    constraints
files:
    head
    pointlist
    point
    stage
    stroke
    mouse
    ../point_src/collisionbox.js
    dragging
    ../point_src/random.js
    ../point_src/rope.js
    ../theatre/objects/balloon.js

---

The _other_ balloon example uses one rope with negative gravity.

In this version there are two ropes. One (hidden) rope connecting the balloon
and the pin, and a second (rendered) rope, with the two pinned ends matching
the balloon rope - with _correct_ gravity.

*/

// const distance = 5;
// const gravity2D = {x:0, y:8.9};
// const gravity = 0.35;
// const friction = 0.9;

class MainStage extends Stage {
    canvas='playspace'

    mounted(){

        this.balloon = new Balloon({
            // gravity: .3
            // invMass: -13
             color: '#44BB22'
            , knotColor: '#229900'
            , ropeColor: '#aaa'
            , position: this.center.copy()
        })

        // this.balloon.mounted(this.center.copy())

        this.balloon2 = new Balloon()
        this.balloon2.mounted(this.center.copy().add(50))

        this.balloon3 = new Balloon()
        this.balloon3.mounted(this.center.copy().add(-50))

        this.collisionBox = new CollisionBox([
                            this.balloon.head
                            , this.balloon2.head
                            , this.balloon3.head
                        ])

        this.dragging.add(
            this.balloon.handle
            , this.balloon2.handle
            , this.balloon3.handle
            // , this.points2[0]
            // , lastPoint
        )
    }

    draw(ctx) {
        this.clear(ctx);

        ctx.fillStyle = '#999'
        ctx.font = 'normal 30px lexend deca'
        ctx.textAlign = 'center'
        this.collisionBox.shuffle()

        this.balloon.draw(ctx)
        this.balloon2.draw(ctx)
        this.balloon3.draw(ctx)
    }

}


;stage = MainStage.go();