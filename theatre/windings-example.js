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



function calculateAngleDiffWrapped(primaryPoint, secondaryPoint) {
    let rads = radiansDiff2(primaryPoint.radians, secondaryPoint.radians);
    return radiansToDegrees(rads);
}

function radiansDiff2(primaryRads, secondaryRads) {
    let diff = (primaryRads - secondaryRads + Math.PI) % (Math.PI * 2) - Math.PI;
    if (diff < -Math.PI) diff += Math.PI * 2;
    return diff;
}


class MainStage extends Stage {
    canvas='playspace'

    // live=false
    live = true
    mounted(){
        console.log('drag-point')
        this.spot = this.center.copy()
        this.spot.radius = 300
        this.spot.rotation = random.int(360)
        this.dragging.addPoints(this.spot)
        this.total = 0
        this.last_rot = 0
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
        // this.fps.drawFPS(ctx)
        this.updateRadians()
        this.drawCircles(ctx)

        ctx.fillStyle = '#EEE'
        this.drawIris(ctx)
    }

    updateRadians() {
        let last_radians = this.last_radians
        if(last_radians == undefined) {
            last_radians = this.spot.radians
        };

        let rotW = calculateAngleDiffWrapped({radians:last_radians}, this.spot)
        let rot = calculateAngleDiff({radians:last_radians}, this.spot)
        if(rot != this.last_rot) {
            console.log(rot, rotW)
            let diff = (this.last_rot - rot)
            if (diff < -180 || diff > 180) {
                // skip it.
                diff = ((this.last_rot - 360) % 360 ) + rot
            } else {
                this.total += diff;
                // console.log(diff)
                updateWidgetValues('diff', {
                    diff: diff.toFixed(2)
                    , total: this.total.toFixed(0)
                    , total_mod: (this.total % 360).toFixed(0)
                })
            }
        }
        this.last_rot = rot
        this.last_radians = last_radians
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