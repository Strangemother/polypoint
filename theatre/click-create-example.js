/*
title: Click-Drag Point Creation
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/point.js
    ../point_src/stage.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/functions/clamp.js
    // ../others/curve_src/curve.js
    ../point_src/extras.js
    ../point_src/text/alpha.js
    ../point_src/text/fps.js
    ../point_src/curve-extras.js
---

 */
var superV = 0

class RelativeNumber {
    constructor(parent, offset) {
        this.offset = offset
    }

    compute() {
        this.value = this.offset
    }
}


class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        this.point = (new Point(100, this.center.y)).quantize(100)
        this.clickPoint = this.center.copy();
        this.points = new PointList(this.point, this.clickPoint)


        this.line = new Line(this.point, this.clickPoint, 'green', 2)

        let drag = this.drag = new Dragging
        drag.initDragging(this)
        drag.addPoints(this.point, this.clickPoint)
        drag.onClick = this.dragOnClick.bind(this)
        autoMouse.on(this.canvas, 'mouseup', this.mouseOnClick.bind(this))
    }

    draw(ctx) {
        this.clear(ctx)

        // this.point.pen.indicator(ctx, {color:'#333'})
        this.points.pen.indicators(ctx, {color: '#999'})
        /* Follow the mouse */
        this.drawMouse(ctx)

        this.line.render(ctx)

        /* The pinned point 100,100 */

        let p = this.drag.getPoint();
        if(p) {
            p.pen.circle(ctx)
        }
    }

    drawMouse(ctx) {
        let mouse = Point.mouse
        let pos = mouse.position
        // let color = mouse.isDown(0) ? 'red': '#444'
        this.point.radius = pos.radius = mouse.wheelSize()//(v)=>v*v) + 10
        // pos.pen.indicator(ctx, { color })
        // this.line.b = pos
    }

    rel(percent) {
        return new RelativeNumber(this, percent)
    }

    mouseOnClick(canvas, event) {
        // console.log('Custom click event', event)
        if(!this.drag.isDragging) {
            // let np = new Point({x:event.x,y:event.y, radius: this.mouse.wheelSize(true)})
            // this.points.push(np)
            // this.drag.add(np)
        }
    }

    dragOnClick(event) {
        // console.log('Custom click event', event)
        // if(!this.drag.isDragging) {
            let np = new Point({x:event.x,y:event.y, radius: this.mouse.wheelSize(true)})
            this.points.push(np)
            this.drag.add(np)
        // }
    }
}


stage = MainStage.go(/*{ loop: true }*/)
