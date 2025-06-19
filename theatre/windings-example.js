/*
categories:
    angles
files:
    head
    stroke
    ../point_src/point-content.js
    pointlist
    point
    mouse
    ../point_src/bisector.js
    ../point_src/random.js
    dragging
    ../point_src/l.js
    ../point_src/protractor.js
    ../point_src/windings.js
    ../point_src/text/beta.js
    stage

---

Calculate _windings_ of a point. Detect the point rotation and diff against
the previous value.

The value is independant of the point and accounts for rotation through the
0 degree, and the _initial_ rotation of the point.

*/

addWidget('diff', {
    fields: {
        diff: { value: 0 }
        , total: { value: 0 }
        , total_mod: { value: 0 }
    }
})


class MainStage extends Stage {
    canvas='playspace'

    // live=false
    live = true
    mounted(){
        console.log('drag-point')
        this.spot = this.center.copy().update({
            radius: 300
            ,rotation: random.int(360)
        })

        this.dragging.addPoints(this.spot)

        this.total = 0
        this.lastDiff = 0
    }

    firstDraw(ctx) {
        ctx.strokeStyle = 'yellow'
        ctx.fillStyle = '#EEE'
        ctx.font = `400 16px inter`;
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
    }

    draw(ctx){
        this.clear(ctx)
        this.updateRadians()

        updateWidgetValues('diff', {
            diff: this.lastDiff.toFixed(2)
            , total: this.total.toFixed(0)
            , total_mod: (this.total % 360).toFixed(0)
        })

        this.drawCircles(ctx)

        ctx.fillStyle = '#EEE'
        this.drawIris(ctx)
    }

    updateRadians() {
        let p = this.spot;
        let w = p.windings
        let total = w.calculate()
        this.lastDiff =  w.lastDiff
        this.total =  total
    }

    drawCircles(ctx) {
        this.spot.pen.fill(ctx, '#333')
        this.spot.pen.indicator(ctx, { color: '#111'})
    }

    drawIris(ctx) {
        /* The dynamic highlighter. */
        this.dragging.drawAll(ctx)
    }

}


;stage = MainStage.go();