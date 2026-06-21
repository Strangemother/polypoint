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
---

sigmoid function line

+ flat line
+ split()
+ sigmoid function
+ tip project
+ draw a line

This can draw complex or simple waves.

---

Intersect at the perpendicular for sampling the line.

*/


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        let count = 40
        let multiplier = [300, 200, null, 0]
        let offset = [100, 100, 10, 0]

        this.points = PointList.generate.random(count, multiplier, offset)
        this.points.each.color = ()=>random.color([290, 310], [80,100], [22,30])
        // this.dragging.add(p)
        this.tick = 0
    }

    firstDraw(ctx) {
        ctx.lineCap = 'round'
    }

    randomMove(p=this.point, c=this.center, v=200){
        if(this.tick % random.int(10, 300) == 0) {
            p.x = c.x + random.int(-v, v)
            p.y = c.y + random.int(-v, v)
            p.radius = random.int(.5, 7)
        }

    }

    draw(ctx){
        this.tick++;
        this.clear(ctx)

        this.points.forEach(p=>{
            this.randomMove(p, this.center, 400)
        })
        this.points.pen.fill(ctx)
    }
}

stage = MainStage.go(/*{ loop: true }*/)
