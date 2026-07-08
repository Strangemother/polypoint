/*
title: Sigmoid Line
categories: line
    sigmoid
files:
    head
    point
    pointlist
    stage
    mouse
    dragging
    stroke
    ../point_src/split.js
    ../point_src/random.js
    ../point_src/curve-extras.js
    ../point_src/math.js
---

sigmoid function line.

+ flat line
+ split()
+ sigmoid function
+ tip project
+ draw a line

This can draw complex or simple waves.

---

Intersect at the perpendicular for sampling the line.

*/

class SigmoidLine extends Line {
    tick = 0
    count = 10
    castSplit() {
        /* Generate the inner split and project all tips.
        The next function should be an updateSplit to edit each point to its
        corresponding fuction point. */
        this._splitPoints = this.splitInner(this.count)
    }

    getDegrees() {
        return calculateAngle(this._splitPoints[0], this._splitPoints.last())
    }

    updateSplit() {

        let speed = 0.1
        let t = this.tick * speed
        let deg = this.getDegrees()
        let off1 = 1 // left offset. notice tip 0
        let cos1 = 12

        const func = (e,i,a) => {
            let res = Math.cos(off1 + t + i) * cos1
            e.rotation = deg + (res < 0? 90: -90)
            e.radius = Math.abs(res)
            return e.getTip()
        }

        this.tips = this._splitPoints.map(func)
    }

    step(){
        this.tick++;
        if(this.a.wasDirty || this.b.wasDirty) {
            console.log('Dirty')
            this.castSplit()
        }

        this.updateSplit()
    }

    render(ctx, conf={}) {
        super.render(ctx, conf)
        // this.start(ctx, conf)
        // this.draw(ctx, conf)
        // this.close(ctx)
        this.tips?.pen.quadCurve(ctx, 'purple')
    }
}


class CustomSigmoidLine extends SigmoidLine {

    updateSplit() {

        let speed = 0.09
        let t = this.tick * speed
        let deg = this.getDegrees()
        let p1 = 0
        let amp2 = 1.12
        let off1 = 0 // left offset. notice tip 0
        let cos1 = 12
        let cos2 = 5

        const func = (e,i,a) => {
            let res = ( Math.cos(off1 + t + i) * cos1
                        -(p1 + Math.cos(t - i * amp2) * cos2)
                      ) + p1

            e.rotation = deg + (res < 0? 90: -90)
            e.radius = Math.abs(res)
            return e.getTip()
        }

        this.tips = this._splitPoints.map(func)
    }
}


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){


        this.line = new SigmoidLine(
                new Point(100, 100),
                new Point(500, 100)
            )
        this.line.count = 100

        this.my_line = new CustomSigmoidLine(
                new Point(100, 300),
                new Point(500, 300)
            )
        this.my_line.count = 100

        this.dragging.add(...this.line.points, ...this.my_line.points)
    }

    firstDraw(ctx) {
        ctx.lineCap = 'round'
    }

    draw(ctx){
        this.clear(ctx)

        this.line.step()
        this.line.render(ctx, {color: '#111', width: 2})
        this.my_line.step()
        this.my_line.render(ctx, {color: '#111', width: 2})
    }
}

stage = MainStage.go(/*{ loop: true }*/)
