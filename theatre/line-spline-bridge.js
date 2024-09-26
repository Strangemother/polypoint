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
        this.clickPoint = this.center

        this.line = new Line(this.point, this.clickPoint, 'green', 2)

        autoMouse.on(this.canvas, 'click', this.onClick.bind(this))
        this.cantenary = new CantenaryCurve(this.point, this.point)
        this.newFPS = new FPS(this)
        this.newFPS.setup()


        let drag = this.drag = new Dragging
        drag.initDragging(this)
        // drag.onDragMove = this.onDragMove.bind(this)
        // drag.onDragEnd = this.onDragEnd.bind(this)
        drag.addPoints(this.point, this.clickPoint, this.newFPS.position)
    }

    draw(ctx) {
        this.clear(ctx)

        this.point.pen.indicator(ctx, {color:'#333'})
        this.clickPoint.pen.indicator(ctx, {color:'#333'})

        /* Follow the mouse */
        this.drawMouse(ctx)
        this.drawCurveLine(ctx)
        this.line.render(ctx)

        this.newFPS.update()
        this.newFPS.draw(ctx)
        /* The pinned point 100,100 */

        let p = this.drag.getPoint();
        if(p) {
            p.pen.circle(ctx)
        }
    }

    drawCurveLine(ctx) {
        let mouse = Point.mouse
        // let pos = mouse.position.quantize(20)
        let ws = mouse.wheelSize((v)=>v*v)
        this.point.radius = ws + 10
        this.clickPoint.radius = ws + 10
        let c = this.curve  = new BezierCurve(this.point, this.clickPoint)
        c.useCache = false;
        c.render(ctx)
    }

    drawMouse(ctx) {
        let mouse = Point.mouse
        let pos = mouse.position
        // let color = mouse.isDown(0) ? 'red': '#444'
        this.point.radius = pos.radius = mouse.wheelSize((v)=>v*v) + 10
        // pos.pen.indicator(ctx, { color })
        // this.line.b = pos
    }

    rel(percent) {
        return new RelativeNumber(this, percent)
    }

    onClick(canvas, event) {
        // console.log('Custom click event', event)
    }
}


stage = MainStage.go(/*{ loop: true }*/)
