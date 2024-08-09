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
        this.point = new Point(100, this.center.y)
        this.clickPoint = this.center

        this.line = new Line(this.point, this.clickPoint, 'green', 2)

        autoMouse.on(this.canvas, 'click', this.onClick.bind(this))
        this.cantenary = new CantenaryCurve(this.point, this.point)
        this.newFPS = new FPS(this)
        this.newFPS.setup()
    }

    draw(ctx) {
        this.clear(ctx)

        /* Follow the mouse */
        this.drawMouse(ctx)
        this.drawCurveLine(ctx)
        this.line.render(ctx)

        this.newFPS.update()
        this.newFPS.draw(ctx)
        /* The pinned point 100,100 */
        this.point.pen.indicator(ctx)
    }

    drawCurveLine(ctx) {
        let mouse = Point.mouse
        let pos = mouse.position
        let ws = mouse.wheelSize(true)
        pos.radius = ws + 10
        let c = this.curve  = new BezierCurve(this.point, pos)
        c.useCache = false;
        c.render(ctx)
    }

    drawMouse(ctx) {

        let mouse = Point.mouse
        let pos = mouse.position
        let color = mouse.isDown(0) ? 'red': '#444'
        this.point.radius = pos.radius = mouse.wheelSize() + 10

        pos.pen.indicator(ctx, { color })
        this.line.b = pos
    }

    rel(percent) {
        return new RelativeNumber(this, percent)
    }

    onClick(canvas, event) {
        console.log('Custom click event', event)
    }
}


class XMainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        let cumX = 0
            , cumOffset = 200
            , globalY = 100
            , offset = ()=> cumX+=cumOffset
            , c = this.compass
            ;

        this.points = this.pointPair()
        // this.points.setMany(20, 'radius');
        this.line = new Line([100, 200], [200, 200], 'green', 2)
        this.curvyLine = new BezierCurve(...this.pointPair())
        this.cantenary = this.setupCantenary(this.pointPair(40))
        this.tick = 0
    }

    pointPair(yOffset=0) {
        let cumX = 0
            , cumOffset = 200
            , globalY = 100
            , offset = ()=> cumX+=cumOffset
            , c = this.compass
            ;

        let ps = new PointList(
            new Point({
                name: "a"
                , rotation: c.right
                , x: offset()
                , y: globalY + yOffset
                , radius: 60
            })
            , new Point({
                name: "b"
                , rotation: c.left // RIGHT_DEG
                , x: offset()
                , y: globalY + 50 + yOffset
                , radius: 70
            })
        )

        return ps;
    }

    setupCantenary(points) {
        let c = new CantenaryCurve(...points)
        // this.cantenary.sine = 30
        c.restLength = 430
        c.bounceRate = .08
        c.reductionRate = .999
        c.swingDegrees = 20
        c.elasticity = .09
        return c

    }

    draw(ctx){
        this.clear(ctx)

        this.line.render(ctx)

        this.drawCantenary(ctx)
        this.curvyLine.points.pen.indicators(ctx, {line: {color: '#999', width: 1}})
        this.curvyLine.render(ctx, {width: 3, color: '#990088'})
        // this.drawPoints(ctx)
        // this.drawRandomLine(ctx)

        // if(this.tick % 2 == 0
        //     && cantenary.sine > .1) {
        //     cantenary.sine *= cantenary.reductionRate
        //     cantenary.length = cantenary._restLength + (Math.sin(this.tick * cantenary.bounceRate) * cantenary.sine)
        // }

        /* Draw a line from the point, projected from the center (by 1)*/
        // let pLine = new Line(this.points[0].project(), this.points[1].project(), 'pink', 1)
        // pLine.draw(ctx)

        // this.drawCurvyLine(ctx)
        this.tick += 1
    }

    drawCantenary(ctx) {

        let cantenary = this.cantenary;

        cantenary.render(ctx)

        let tick = this.tick
        if(tick % 1 == 0) {
            cantenary.update(ctx, tick)
            cantenary.updateSwing(ctx, tick)
        }
    }

    /* Draw all the `this.points` as indicators.
    Currently this is two points.*/
    drawPoints(ctx) {

        for(let p in this.points) {
            let point = this.points[p]
            point.pen?.indicator(ctx, {color: 'green'})
        }

        this.points.draw.pointLine(ctx)
    }

    /* draw a randomly generated line path
    And draw a line from tip to tip */
    drawRandomLine(ctx){

        /* Draw the horizon line - a straight project from A to B*/
        ctx.beginPath();
        randomPoints.draw.horizonLine(ctx)
        quickStroke(ctx, 'red')

        /* Draw each point as a line to its next sibling.*/
        randomPoints.draw.pointLine(ctx)
        quickStroke(ctx, 'teal', 2)
    }

}

stage = MainStage.go(/*{ loop: true }*/)
