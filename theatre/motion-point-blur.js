/*
title: Motion Blur Class
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
        let p = this.point = this.center.copy()
        p.color = 'purple'
        this.dragging.add(p)
        this.tick = 0
    }

    firstDraw(ctx) {
        ctx.lineCap = 'round'
    }

    randomMove(p=this.point, c=this.center, v=200){
        if(this.tick % random.int(20, 50) == 0) {
            p.x = c.x + random.int(-v, v)
            p.y = c.y + random.int(-v, v)
            p.radius = random.int(1, 20)
        }
    }

    draw(ctx){
        this.tick++;
        this.clear(ctx)
        this.randomMove()

        this.point.motion.linear(ctx)
    }
}

stage = MainStage.go(/*{ loop: true }*/)
