/*
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/stage.js
    ../point_src/text/label.js
---

*/

function quantizeNumber(value, quantize=1) {
  const quantizedValue = Math.round(value / quantize) * quantize;
  return quantizedValue;
}



class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.pointA = new Point(200,200)
        this.pointB = new Point(100,100)
        this.dragging.addPoints(this.pointA, this.pointB)
        this.events.wake()

    }

    onMousemove(e) {
        this.pointA.x = e.offsetX
        this.pointA.y = e.offsetY
        this.pointB.copy(this.pointA.quantize(quantizeNumber(this.pointA.radius)))
    }

    onMousedown(e) {
        this.pointB.color = 'green'
    }

    onMouseup(e) {
        this.pointB.color = undefined
    }

    draw(ctx){
        this.clear(ctx)

        this.pointA.pen.indicator(ctx)
        this.pointB.pen.indicator(ctx, {color: this.pointB.color})

    }
}


;stage = MainStage.go();