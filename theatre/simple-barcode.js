/*
title: Quantize
categories: quantize
files:
    head
    point
    pointlist
    stage
    mouse
    dragging
    ../point_src/line.js
    ../point_src/random.js
---

*/


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted() {
        this.lines = []
        this.ps = PointList.generate.random(6, [800, 10], [50, 100])
        this.ps.forEach(p => {
            let l = new Line(
                [p.x, 0]
                , [p.x, this.dimensions.height]
            )
            this.lines.push(l)
        })
    }

    firstDraw(ctx) {
        // ctx.lineCap = 'round'
        ctx.strokeStyle = '#333'

    }

    draw(ctx){
        this.clear(ctx)
        let mp = this.mouse.point
        let x = ~~mp.x
        this.lines.forEach(l => {
            let lx = ~~l.a.x
            let col = '#444'
            if (lx >= x) {
                col = 'pink'
            }
            l.color = col
            l.render(ctx)
        })
        // this.ps.pen.circle(ctx)
        mp.pen.fill(ctx, 'pink', 4)
    }
}

stage = MainStage.go(/*{ loop: true }*/)
