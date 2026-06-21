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


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        let count = this.count = 40
        let multiplier = [300, 200, null, 0]
        let offset = [100, 100, 10, 0]

        // this.points = PointList.generate.random(count, multiplier, offset)

        let lpoints = [new Point(100, 100), new Point(500, 100)]
        this.line = new Line(...lpoints)
        this.dragging.add(...this.line.points)

        this.tick = 0
    }

    firstDraw(ctx) {
        ctx.lineCap = 'round'
        this.castSplit()
    }


    castSplit() {
        /* Generate the inner split and project all tips.
        The next function should be an updateSplit to edit each point to its
        corresponding fuction point. */
        this.points = this.line.splitInner(this.count)
    }

    updateSplit() {

        let speed = 0.09
        let t = this.tick * speed
        let deg = calculateAngle(this.points[0], this.points.last())
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

        this.tips = this.points.map(func)

    }

    draw(ctx){
        this.tick++;
        this.clear(ctx)

        if(this.line.a.wasDirty || this.line.b.wasDirty) {
            console.log('Dirty')
            this.castSplit()
        }

        this.updateSplit()

        let col = 'purple';
        let width = 2
        this.line.render(ctx, {color: '#111', width})

        // this.points.pen.indicator(ctx)
        // this.points.pen.lines(ctx, col, width)
        // this.tips?.pen.line(ctx, col, width)
        this.tips?.pen.quadCurve(ctx, col)
    }
}

stage = MainStage.go(/*{ loop: true }*/)
