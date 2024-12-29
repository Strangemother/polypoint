/*
---
title: Angle Values
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/protractor.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/stage.js
    ../point_src/angle.js
    ../point_src/text/label.js
 */

aa = new Angle(20, 'tau')
ab = new Angle(20).tau

class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.a = new Point({x:200, y:200, radius: 100, rotation: 0})
        this.b = new Point({x:200, y:200, radius: 100, rotation: 270})
        this.dragging.addPoints(this.a, this.b)

        let h = new Label(this.ctx, {
            fontSize: 50
            , textAlign: "center"
            // , fontName: '"lexend deca"'
        })

        // h.fillStyle = 'orange'
        h.position = new Point(300, 200)
        this.label = h;
        this.angle = new Angle(0, 'deg')
    }

    draw(ctx){
        this.clear(ctx)
        let a = this.a;
        let b = this.b;
        a.rotation += .3
        b.rotation += .5

        // let rads = ((b.radians - a.radians) + Math.PI2) % Math.PI2
        let rads = calculateAngleDiff(b,a)
        this.angle.value = rads
        let rot = this.angle.deg // radiansToDegrees(rads)
        // let rot = calculateInverseAngle180(a, b, a.rotation)

        a.pen.indicator(ctx)
        b.pen.indicator(ctx)

        let size = 20

        // a.pen.rect(ctx, 10, 10, 'red')
        const acute90 = function(t, l, col='red', val=90){

            let step = t.project(l)
            step.rotation += val
            let stepB = step.project(l)
            stepB.rotation += val
            let stepC = stepB.project(l)
            step.pen.line(ctx, stepB, col, 2)
            stepB.pen.line(ctx, stepC, col, 2)
            return stepB
        }

        const continue90 = function(t, l, col='red', val=90){

            let step = t.project(l)
            // step.rotation += 90
            let stepB = step.project(l)
            stepB.rotation += val
            let stepC = stepB.project(l)
            step.pen.line(ctx, stepB, col, 2)
            stepB.pen.line(ctx, stepC, col, 2)
            return stepB
        }

        let primaryColor = '#CCC'
        let secondaryColor = '#444'

        if(~~rot % 90 == 0) {
            let r = a
            let f = acute90
            let count = (rot / 90) - 1
            for (var i = 0; i < count; i++) {
                count[i]
                r = f(r, size, primaryColor)
                f = continue90
            }

            // let r2 = b
            // let step = r2.project(l)
            // step.pen.line(ctx, stepB, col, 2)
            b.pen.arc(ctx, a, secondaryColor, size - 5, 2, 0)

        } else {
            a.pen.arc(ctx, b, primaryColor, size, 2, 0)
            b.pen.arc(ctx, a, secondaryColor, size - 5, 2, 0)
        }

        this.label.text = rot.toFixed(0)
        this.label.writeText(ctx)
        // this.targetPoint.pen.fill(ctx, '#33dd33')
    }
}


;stage = MainStage.go();