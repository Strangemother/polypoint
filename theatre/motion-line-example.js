/*
title: Example
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
        this._last = this.point.copy().subtract(20)
        this.dragging.add(this.point)
        this.tick = 0
    }

    firstDraw(ctx) {
        // ctx.lineCap = 'round'
        ctx.strokeStyle = 'red'
    }

    draw(ctx){
        this.tick++;
        this.clear(ctx)
        let p = this.point
        // this.point.draw.quadCurve(ctx, this._last)
        // ctx.stroke()
        // this.point.pen.quadCurve(ctx, this._last, p.color)
        this.point.pen.line(ctx, this._last, p.color, p.radius)
        this._last = this._last.lerp(p, .5)
        // this._last = p.copy()
        this.point.pen.circle(ctx, p.radius, p.color);

        ctx.lineCap = 'butt'
        if(this.tick % random.int(10,65) == 0) {
            ctx.lineCap = 'round'
            this.point.x = random.int(100, 500)
            this.point.y = random.int(100, 500)
        }
    }
}

stage = MainStage.go(/*{ loop: true }*/)
