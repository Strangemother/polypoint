/*
---
title: Split V2 Options
categories: split
    curve
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/extras.js
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/functions/clamp.js
    ../point_src/split-v2.js
    ../point_src/curve-extras.js

---

The unified `split(count, options)` from `split-v2.js`. Each row is one
option set; drag the end points to bend the curves and watch how `even`
and `every` keep their spacing while the default `t` split bunches up.

    // white  - t spacing, ends included
    curve.split(count)                     
    // green  - equal arc-length spacing
    curve.split(count, { even: true })     
    // orange - a point every N units
    curve.split({ every: distance })       
    // blue - lerp radius/rotation
    curve.split(count, { inner: true, hinted: true })  
    // red    - face the mouse
    curve.split(count, { lookAt: mouse })  
    line.split(count) / line.split({ every })

Use the sliders to change `count` and `every`.
*/
class MainStage extends Stage {
    canvas = 'playspace'
    live = true

    count = 12
    every = 30

    mounted(){
        let x0 = 120
        let x1 = 560
        let rowHeight = 130
        let bend = 180

        /* End points rotated to give each curve a visible S bend. */
        this.rows = [
              { label: 'split(count)',                          color: '#ddd',   opts: undefined }
            , { label: 'split(count, { even: true })',          color: '#7c7',   opts: { even: true } }
            , { label: 'split({ every })',                      color: 'orange', opts: 'every' }
            , { label: 'split(count, { inner, hinted })',       color: '#6bf',   opts: { inner: true, hinted: true } }
            , { label: 'split(count, { lookAt: mouse })',       color: '#f66',   opts: 'lookAt' }
        ]

        let draggables = []
        this.rows.forEach((row, i) => {
            let y = 110 + i * rowHeight
            let a = new Point(x0, y, bend, -50)
            let b = new Point(x1, y, bend, 130)
            if(row.opts && row.opts.hinted) {
                a.radius = 4
                b.radius = 40
                a.rotation = -30
                b.rotation = 150
            }
            row.curve = new BezierCurve(a, b)
            draggables.push(a, b)
        })

        let ly = 110 + this.rows.length * rowHeight
        this.lineA = new Line(new Point(x0, ly), new Point(x1, ly))
        this.lineB = new Line(new Point(x0, ly + 60), new Point(x1, ly + 60))
        draggables.push(...this.lineA.points, ...this.lineB.points)

        this.dragging.add(...draggables)

        addControl('count', {
            field: 'range'
            , label: 'count'
            , min: 1
            , max: 60
            , step: 1
            , value: this.count
            , stage: this
            , onchange(ev) {
                this.stage.count = parseInt(ev.currentTarget.value)
            }
        })

        addControl('every', {
            field: 'range'
            , label: 'every (units)'
            , min: 4
            , max: 120
            , step: 1
            , value: this.every
            , stage: this
            , onchange(ev) {
                this.stage.every = parseInt(ev.currentTarget.value)
            }
        })
    }

    firstDraw(ctx) {
        ctx.font = 'normal .9em monospace'
    }

    draw(ctx){
        this.clear(ctx)
        let mouse = this.mouse.point
        mouse.pen.circle(ctx, undefined, '#555')

        for (let row of this.rows) {
            let curve = row.curve
            let points = this.splitRow(row, mouse)

            curve.render(ctx, { color: '#444' })
            points.pen.indicators(ctx, { color: row.color })
            curve.a.pen.indicator(ctx, { color: '#888' })
            curve.b.pen.indicator(ctx, { color: '#888' })

            ctx.fillStyle = row.color
            let note = row.opts == 'every'
                ? `${row.label}   every=${this.every}  length=${~~curve.arcLength()}  n=${points.length}`
                : `${row.label}   n=${points.length}`
            ctx.fillText(note, curve.a.x, curve.a.y - 70)
        }

        this.drawLines(ctx)
    }

    splitRow(row, mouse) {
        let curve = row.curve
        if(row.opts == 'every') {
            return curve.split({ every: this.every })
        }
        if(row.opts == 'lookAt') {
            return curve.split(this.count, { lookAt: mouse })
        }
        return curve.split(this.count, row.opts)
    }

    drawLines(ctx) {
        let a = this.lineA
        let b = this.lineB

        a.render(ctx, { color: '#444' })
        a.split(this.count, 90).pen.indicators(ctx, { color: '#ddd' })
        ctx.fillStyle = '#ddd'
        ctx.fillText(`line.split(count, 90)   n=${this.count}`, a.a.x, a.a.y - 24)

        b.render(ctx, { color: '#444' })
        let every = b.split({ every: this.every, angle: 90 })
        every.pen.indicators(ctx, { color: 'orange' })
        ctx.fillStyle = 'orange'
        ctx.fillText(`line.split({ every, angle: 90 })   n=${every.length}`, b.a.x, b.a.y - 24)
    }
}


;stage = MainStage.go();
