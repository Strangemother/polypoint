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
