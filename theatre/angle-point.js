
function quantizeNumber(value, quantize=1) {
  const quantizedValue = Math.round(value / quantize) * quantize;
  return quantizedValue;
}


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
        let rot = calculateAngle360(a, this.linePoint, a.rotation)
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
        b.pen.fill(ctx, '#33dd33')
        // this.linePoint.pen.indicator(ctx, {color: this.linePoint.color})

        this.updateText()
        this.label.writeText(ctx)
    }
}


;stage = MainStage.go();