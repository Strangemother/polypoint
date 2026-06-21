/*
title: Motion Blur Class Instance
categories: blur
files:
    head
    point
    pointlist
    stage
    mouse
    dragging
    ../point_src/random.js
    ../point_src/arc.js
    ../point_src/motion.js

---

*/


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        let c = this.center;
        this.point = new Point({x: c.x, y: c.y,
                radius: 20,
                rotation: 45,
                color: 'purple'
            });
        this.dragging.add(this.point)
        this.tick = 0
        this.ml = new MotionBlur(this.point);
    }

    firstDraw(ctx) {
        ctx.lineCap = 'round'
    }

    randomMove(){
        if(this.tick % random.int(20, 40) == 0) {
            let p = this.point
            let c = this.center
            let v = 200
            p.x = c.x + random.int(-v, v)
            p.y = c.y + random.int(-v, v)
            p.radius = random.int(1, 20)
        }
    }

    draw(ctx){
        this.tick++;
        this.clear(ctx)
        let p = this.point
        this.randomMove()
        this.ml.linear(ctx)

        this.point.pen.fill(ctx, p.color)
    }
}


stage = MainStage.go(/*{ loop: true }*/)
