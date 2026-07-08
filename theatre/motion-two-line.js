/*
title: Dual Line Motion Tracking
categories: basic
    dragging
files:
    head
    point
    pointlist
    stage
    mouse
    dragging
    ../point_src/random.js
    ../point_src/arc.js
---

*/


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.point = new Point({x: 250, y: 150 ,
                radius: 5, rotation: 45,
                color: 'green'
            });
        this.dragging.add(this.point)
        this.tick = 0
        this._last1 = this.point.copy()
        this._last0 = this.point.copy().subtract(20)
    }

    firstDraw(ctx) {
        // ctx.lineCap = 'round'
        ctx.strokeStyle = 'red'
    }

    draw(ctx){
        this.tick++;
        this.clear(ctx)
        let p = this.point
        this.point.pen.circle(ctx, p.radius, p.color)
        ctx.lineCap = 'butt'

        if(this.tick % 20 == 0) {
            this._last1 = this._last0
            this._last0 = this.point.copy()

            ctx.lineCap = 'round'
            this.point.x = random.int(100, 500)
            this.point.y = random.int(100, 500)

        }


        // let cap = this._last0.arc.to(this.point, this._last1)

        // if(cap) {
        //     ctx.beginPath();
        //     ctx.strokeStyle = 'green'
        //     ctx.arc(cap.cx, cap.cy, cap.radius, cap.startRadians, cap.toRadians, 1);
        //     ctx.stroke();
        // }

        // this._last0.pen.fill(ctx, 'red')
        this.point.pen.line(ctx, this._last0, '#DD0000', p.width)
        // this._last1.pen.fill(ctx, 'red')
        this._last1.pen.line(ctx, this._last0, '#550000', p.width)

    }
}

stage = MainStage.go(/*{ loop: true }*/)
