/*
title: Quantize Highlight
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

Select a target line, with quantized _snapping_ of the mouse point when
near a line.
*/


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted() {
        this.lines = []
        this.ps = PointList.generate.random(20, [800, 10], [50, 100])
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
        /* Target track the mouse, locking when near a line. */
        let mp = this.mouse.point
        let x = ~~mp.x
        let snapX = mp.x
        // The final target line .
        let tLine = undefined;
        // A stack of lines the mouse point is near to.
        let near = []
        // Discover near lines.
        this.lines.forEach(l => {
            // Gather the X of the line, as an int
            let lx = ~~l.a.x
            // ensure the default color is set
            l.color = '#444'
            // candidate line - if we're near the line
            let snap = 10
            if (lx + snap >= x && lx - snap <= x) {
                near.push(l)
            }
        })

        // Choose the closest line
        let _d = snapX + 10
        near.forEach(l => {
            let _e = Math.abs(x - l.a.x)
            if (_e < _d) {
                snapX = l.a.x
                tLine = l;
                _d = Math.abs(x - l.a.x)
            }
        })

        if (tLine) {
            tLine.color = 'pink'
        }

        // this.ps.pen.circle(ctx)
        this.lines.forEach(l => {
            l.render(ctx)
        })

        mp.x = snapX
        mp.pen.fill(ctx, 'pink', 4)
    }
}

stage = MainStage.go(/*{ loop: true }*/)
