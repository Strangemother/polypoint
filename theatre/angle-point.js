/*
---
title: Calculate Angles
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
    ../point_src/mirror.js
    ../point_src/stage.js
    ../point_src/text/label.js
    ../point_src/text/alpha.js
 */

class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.indicatorPoint = new Point({x:200,y:200, radius: 100})
        this.linePoint = new Point(100,100)
        this.targetPoint = this.indicatorPoint.project()

        this.dragging.addPoints(this.indicatorPoint, this.linePoint, this.targetPoint)


        let h = new Label(this.ctx, {
            fontSize: 50
            , textAlign: "center"
            // , fontName: '"lexend deca"'
        })

        // h.fillStyle = 'orange'
        h.position = new Point(300, 200)
        this.label = h;
    }

    updateText() {
        let a = this.indicatorPoint;
        let b = this.linePoint;
        let rot = calculateAngle360(a, b, a.rotation)
        // let rot = invertClockRotation(calculateAngle180(a, b, a.rotation))
        // let rot = calculateAngle180(a, b, a.rotation)
        // let rot = calculateInverseAngle180(a, b, a.rotation)
        this.label.text = rot.toFixed(0)
    }

    onMouseup(e) {
        this.linePoint.color = undefined
    }

    draw(ctx){
        this.clear(ctx)

        let a = this.indicatorPoint;
        let b = this.linePoint;
        // a.rotation -= .1;
        a.pen.indicator(ctx)
        // a.pen.indicator(ctx)
        a.pen.line(ctx, b)
        a.lookAt(this.targetPoint)

        this.targetPoint.pen.fill(ctx, '#33dd33')
        b.pen.fill(ctx, '#99ddff')
        // this.linePoint.pen.indicator(ctx, {color: this.linePoint.color})

        this.updateText()
        this.label.writeText(ctx)
    }
}


;stage = MainStage.go();