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
        let count = this.count = 22
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
    }



    updateSplit() {

        let t = this.tick * .06
        let deg = calculateAngle(...this.line.points)
        let p1 = 30
        let amp = 4
        let cos1 = 12
        let cos2 = 10
        const func = (e,i,a) => {
            let res = (
                    Math.cos(3 + t + i) * cos1
                    -(p1 + Math.cos(t - i * amp) * cos2)
                ) + p1
            e.rotation = deg + ((res < 0) ? 90: -90)
            e.radius = Math.abs(res)
        }

        this.points = this.line.splitInner(this.count)
        let pl = this.points.map((e,i,a) => {
            func(e,i,a)
            return e.project()
        })

        this.tips = pl;
    }

    draw(ctx){
        this.tick++;
        this.clear(ctx)

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
