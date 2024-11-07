
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        let cumX = 0
            , cumOffset = 120
            , globalY = 100
            , offset = ()=> cumX+=cumOffset
            , c = this.compass
            ;

        this.points = new PointList(
            new Point({
                name: "a"
                , rotation: c.right
                , x: offset(), y: globalY
            })
            , new Point({
                name: "b"
                , rotation: c.left // RIGHT_DEG
                , x: offset(), y: globalY + 50
            })
        )

        this.points.setMany(20, 'radius');

        this.line = new Line([100, 200], [200, 200], 'green', 2)
        this.curvyLine = new BezierCurve(...this.points)
        this.cantenary = new CantenaryCurve(...this.points)
        // this.cantenary.sine = 30
        this.cantenary.restLength = 140

        this.tick = 0
    }


    draw(ctx){
        this.clear(ctx)

        // this.curvyLine.render(ctx)
        this.line.render(ctx)

        this.drawCantenary(ctx)
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

        let tail = new Point(cantenary.b)
        let tailNode = this.drawArrowTip(ctx, tail)

        // tailNode.pen.indicator(ctx, {color: 'green'})

        let tip = new Point(cantenary.a)
        let tipNode = this.drawArrowTail(ctx, tip)

        if(this.tick % 1 == 0) {
            cantenary.update(this.tick)
        }
    }

    drawArrowTail(ctx, point) {

        /* First we grab the cached _curve_ of this line instance. */
        let cantenary = this.cantenary;
        let ccp = cantenary.getControlPoints()
        let curves = ccp['curves']

        /* The position of the tip, picking nodes along the linw*/
        let first;
        if(curves == undefined) {
            first = ccp.lines[0]
        } else {
            first = curves[0]
        }

        let tail = new Point(point)
        tail = tail.copy()

        /* Look at the target point. */
        tail.lookAt(new Point(first))

        tail.radius = 9


        ctx.beginPath()
        // ctx.save()

        let offsetX = 0
            , offsetY = 0 // tail.radius
        let tip = (new Point(offsetX, offsetY))

        // ctx.rotate(degToRad(tail.rotation))// + this.tick))
        // ctx.translate(tail.x, tail.y) // Becomes the draw point.

        /* Draw tip */
        // tip.draw.lineTo(ctx, tail)
        // tail = tail.project()
        tail.rotation += 90

        let lineA = tail.project()
        tail.rotation += 180
        let lineB = tail.project()


        /* Pop the stack, de-rotating the page.*/
        // ctx.restore()

        // Make a fancy Fill thing.
        // ctx.fillStyle = 'yellow'
        // ctx.fill()
        ctx.stroke()
        ctx.closePath()
        lineA.pen.line(ctx, lineB, 'white', 2)
        // tail.pen.indicator(ctx, {color: 'green'})

        // lineA.pen.indicator(ctx, {color: 'white'})
        // lineB.pen.indicator(ctx, {color: 'white'})

        return tail
    }

    drawArrowTailA(ctx, point) {

        /* First we grab the cached _curve_ of this line instance. */
        let cantenary = this.cantenary;
        let ccp = cantenary.getControlPoints()
        let curves = ccp['curves']

        /* The position of the tip, picking nodes along the linw*/
        let first = curves[0]

        let tail = new Point(first)
        tail = tail.copy()

        /* Look at the target point. */
        tail.lookAt(new Point(point))

        tail.radius = 9


        ctx.beginPath()
        ctx.save()

        let offsetX = 0
            , offsetY = 0 // tail.radius
        let tip = (new Point(offsetX, offsetY))

        // ctx.rotate(degToRad(tail.rotation))// + this.tick))
        // ctx.translate(tail.x, tail.y) // Becomes the draw point.

        /* Draw tip */
        // tip.draw.lineTo(ctx, tail)
        // tail = tail.project()
        tail.rotation += 90

        let lineA = tail.project()
        tail.rotation += 180
        let lineB = tail.project()

        lineA.pen.line(ctx, lineB, 'white', 2)

        /* Pop the stack, de-rotating the page.*/
        ctx.restore()

        // Make a fancy Fill thing.
        // ctx.fillStyle = 'yellow'
        // ctx.fill()
        ctx.stroke()
        ctx.closePath()
        // tail.pen.indicator(ctx, {color: 'green'})

        // lineA.pen.indicator(ctx, {color: 'white'})
        // lineB.pen.indicator(ctx, {color: 'white'})

        return tail
    }

    drawArrowTip(ctx, point) {

        /* First we grab the cached _curve_ of this line instance. */
        let cantenary = this.cantenary;
        let ccp = cantenary.getControlPoints()
        let curves = ccp['curves']
        /* For the tail, we take the last-1 [and last] to render a
        point at this position. */
        let penUltP, lastP
        if(curves == undefined) {
            penUltP = ccp.lines[0]
        } else {
            [penUltP, lastP] = curves.slice(-2)
        }

        /*Ensure the given point is a point instance. */
        let tail = new Point(point)
        /* it's likely the original point, therefore we ensure it's new. */
        tail = tail.copy();
        /* Rotate this _end point_ to look directly at,
        then perform a 180, allowing Polypoint to offset the calculation */
        let focul = ccp.start
        if(curves) {
            focul = penUltP
        }

        tail.lookAt(new Point(focul))
        tail.rotation += 180

        tail.radius = 7

        ctx.beginPath()
        ctx.save()

        let offsetX = -tail.radius
            , offsetY = 0 // tail.radius
        let tip = (new Point(offsetX, offsetY))

        ctx.translate(tail.x, tail.y) // Becomes the draw point.
        ctx.rotate(degToRad(tail.rotation))// + this.tick))

        /* Draw tip */
        tip.draw.ngon(ctx, 3, tail.radius)
        /* Pop the stack, de-rotating the page.*/
        ctx.restore()


        // Make a fancy Fill thing.
        ctx.fillStyle = '#880000'
        ctx.fill()

        return tail
    }

    drawArrowTipA(ctx, point) {

        /* First we grab the cached _curve_ of this line instance. */
        let cantenary = this.cantenary;
        let ccp = cantenary.getControlPoints()
        let curves = ccp['curves']
        /* For the tail, we take the last-1 [and last] to render a
        point at this position. */
        let [penUltP, lastP] = curves.slice(-2)

        /*Ensure the given point is a point instance. */
        let tail = new Point(point)
        /* it's likely the original point, therefore we ensure it's new. */
        tail = tail.copy();
        /* Rotate this _end point_ to look directly at,
        then perform a 180, allowing Polypoint to offset the calculation */
        tail.lookAt(new Point(penUltP))
        tail.rotation += 180

        tail.radius = 30

        /* Ensure we pick-up the pen and start a new line.*/
        ctx.beginPath()
        /* Step into a stacked context for the incoming rotate */
        ctx.save()

        /* To spin around an anchor, we assume the top left is the pen point,
        The `tip`, is draw relative to this rotation point.  If 0,0, this is likely the center.

        There to have a top-left anchor, and spinning around the this corner,
        we can offset the entire drawing, such that this _origin_ top-left
        is relatively positioned.

        To compute an 'anchor' of an object, we have a point, offset relative to the
        center of the object.
        */
        let offsetX = 10
            , offsetY = 10
        /* Generate a new point at position (e.g. 0,0 for no offset) */
        let tip = (new Point(offsetX, offsetY))
        /*
            Then move the context to the same position  as the tail (origin) point.
            And Rotate around this point (like rotating the page).
        */
        ctx.translate(tail.x, tail.y) // Becomes the draw point.
        ctx.rotate(degToRad(tail.rotation + this.tick))
        /* Draw at the psuedo zero of our pen, (the translated/rotate page) */
        tip.draw.ngon(ctx, 3, 10)
        /* Pop the stack, de-rotating the page.*/
        ctx.restore()


        // Make a fancy Fill thing.
        ctx.fillStyle = '#EEEEEE55'
        ctx.fill()

        return tail
    }

    drawCurvyLineRaw(ctx) {
        let a = this.points[0]
        let b = this.points[1]
        let offset = this.offset == undefined? 0: this.offset


        let midDistance = a.distanceTo(b)*.5

        /*A bezier requires two control points */
        let ca = a.project(midDistance + offset)
        let cb = b.project(midDistance + offset)

        /* Draw the control points */
        // ca.pen.indicator(ctx, {color:'orange'})
        // cb.pen.indicator(ctx, {color:'orange'})

        /* Ensure to _begin_ (Pick up the pen, ending the last draws. */
        ctx.beginPath()
        /* Ensure we draw from the _Start_ position */
        let ap = a
        ctx.moveTo(ap.x, ap.y)

        // ctx.quadraticCurveTo(ca.x, ca.y, b.x, b.y)

        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/bezierCurveTo
        let bp = b
        ctx.bezierCurveTo(ca.x, ca.y, cb.x, cb.y, bp.x, bp.y)

        quickStroke(ctx, 'pink', 2)

        ctx.stroke()
        ctx.closePath()
    }

    drawCurvyLineTip(ctx) {
        let a = this.points[0]
        let b = this.points[1]
        let offset = 20


        let midDistance = a.distanceTo(b)*.5

        /*A bezier requires two control points */
        let ca = a.project(midDistance + offset)
        let cb = b.project(midDistance + offset)

        /* Draw the control points */
        ca.pen.indicator(ctx, {color:'orange'})
        cb.pen.indicator(ctx, {color:'orange'})

        /* Ensure to _begin_ (Pick up the pen, ending the last draws. */
        ctx.beginPath()
        /* Ensure we draw from the _Start_ position */
        let ap = a.project()
        ctx.moveTo(ap.x, ap.y)

        // ctx.quadraticCurveTo(ca.x, ca.y, b.x, b.y)

        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/bezierCurveTo
        let bp = b.project()
        ctx.bezierCurveTo(ca.x, ca.y, cb.x, cb.y, bp.x, bp.y)

        ctx.stroke()
        ctx.closePath()
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
