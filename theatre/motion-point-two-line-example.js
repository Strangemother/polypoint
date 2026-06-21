/*
title: Motion Blur
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
        let c = this.center;
        this.point = new Point({x: c.x, y: c.y,
                radius: 20,
                rotation: 45,
                color: 'purple'
            });
        this.dragging.add(this.point)
        this.tick = 0
        this._last1 = this.point.copy()
        this._last0 = this.point.copy().subtract(20)
    }

    firstDraw(ctx) {
        ctx.lineCap = 'round'
        // ctx.strokeStyle = 'red'
    }

    randomMove(){
        if(this.tick % random.int(20, 40) == 0) {
            // this.point.x = random.int(300, 700)
            // this.point.y = random.int(300, 700)


            // let p = this.point;
            // let v = p.radius * 2
            // p.x += random.int(-v, v)
            // p.y += random.int(-v, v)

            let p = this.point;
            let c = this.center
            let v = 100
            p.x = c.x + random.int(-v, v)
            p.y = c.y + random.int(-v, v)
        }
    }

    drawLerpLine(ctx) {
        let speed = 1
        if(this.tick % 1 == 0) {
            let current = this.point.copy()
            if(current.distanceTo(this._last1) > .5) {
            }
                // this._last1 = this._last0
                // this._last0 = current
                this._last1 = this._last1.lerp(this._last0, speed * .14)
                this._last0 = this._last0.lerp(current, speed * .34)
                // ctx.lineCap = 'round'
        }

        let p = this.point
        this._last1.pen.line(ctx, this._last0, '#110000', p.radius * 1.7)
        this.point.pen.line(ctx, this._last0, p.color, p.radius * 2)
        // this._last1.pen.fill(ctx, 'red')
    }

    draw(ctx){
        this.tick++;
        this.clear(ctx)
        let p = this.point
        // ctx.lineCap = 'butt'
        this.randomMove()
        this.drawLerpLine(ctx)
        this.point.pen.fill(ctx, p.color)
    }
}

stage = MainStage.go(/*{ loop: true }*/)
