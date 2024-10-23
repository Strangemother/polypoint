
// moved to functions/context.js
const saveRestoreDraw = function(ctx, position, callback) {
    /*
        + `save()` the context
        + translate and rotate to `position``
        + run the function
        + Restore.
     */
    ctx.save()

    let offsetX = -position.radius
        , offsetY = 0 // position.radius
    let tip = (new Point(offsetX, offsetY))

    ctx.translate(position.x, position.y) // Becomes the draw point.
    ctx.rotate(degToRad(position.rotation))// + this.tick))

    /* Draw tip */
    callback && callback(tip)
    // tip.draw.ngon(ctx, 3, position.radius)
    /* Pop the stack, de-rotating the page.*/
    ctx.translate(-position.x, -position.y) // Becomes the draw point.
    ctx.restore()

}


class Line {
    doTips = true
    doBeginPath = true
    doClosePath = true

    constructor(p1, p2, color='red', width=1){
        // new Line([90, 130], [200, 300], 420)
        this.create.apply(this, arguments)
    }

    get [0]() {
        return this.a
    }

    get [1]() {
        return this.b
    }

    last() {
        return this.b
    }

    first() {
        return this.a
    }

    get length(){
        return this.a.distanceTo(this.b)
    }

    get points() {
        return [this.a, this.b]
    }

    create(p1, p2, color='red', width=1) {
        this.a = point(p1)
        this.b = point(p2)
        this.color = color
        this.width = width
    }

    render(ctx, conf={}) {
        this.start(ctx, conf)
        this.draw(ctx, conf)
        this.close(ctx)
    }

    start(ctx) {
        this.doBeginPath && ctx.beginPath();
        let a = this.a;
        ctx.moveTo(a[0], a[1])
    }

    draw(ctx, color=undefined) {
        let conf = {color}
        if(typeof(color) != 'string') {
            conf = color
        }

        if(conf.color != undefined && this.color != undefined ) {
            ctx.strokeStyle = conf.color || this.color
        }


        if(conf.width != undefined) {
            ctx.lineWidth = conf.width == undefined? 1: conf.width
        }

        this.perform(ctx)
        this.writeLine(ctx)
        ;(this.doTips) && this.performDrawTips(ctx)
    }

    performDrawTips(ctx, result){
        this.performTipA(ctx, result)
        this.performTipB(ctx, result)
    }

    /* Apply a tip at point A, (the first position).

    The Tip is a point, with some styling with an ngon.
    */
    performTipA(ctx, result){
        let tipA = this.a
        ctx.beginPath()

        this.drawPolyTipA(ctx, result, tipA)
        this._ctx_fill(ctx)

        let point = this.drawLineTipA(ctx, result, tipA)
        this.writeLineTip(ctx, point)
    }

    writeLineTip(ctx, tip) {

        tip.rotation += 90
        tip.radius = 10

        let lineA = tip.project()
        tip.rotation += 180
        let lineB = tip.project()
        lineA.pen.line(ctx, lineB, 'orange', 2)
    }

    drawPolyTipA(ctx, result, position) {

        let tail = this.a.copy()
        /* Rotate this _end point_ to look directly at, then perform a 180,
        allowing Polypoint to offset the calculation */
        let target = this.b
        tail.lookAt(new Point(target))
        /* Spin the point around the center (its nose).
        rotate to be _under_ the point. */
        tail.rotation += 180
        /* poly distance from the tip */
        tail.radius = 10

        let callback = tip => {
            /* Draw tip */
            tip.draw.ngon(ctx, 3, tail.radius)
        }

        saveRestoreDraw(ctx, tail, callback)

        return tail
    }

    _ctx_fill(ctx) {
        // Make a fancy Fill thing.
        ctx.fillStyle = '#880000'
        ctx.fill()
    }

    drawLineTipA(ctx, result, position) {
        let s = this.a.copy()
        ctx.moveTo(s[0], s[1])

        let target = this.b.copy()
        s.lookAt(new Point(target))
        return s
    }

    performTipB(ctx, result){
        let tipB = this.b

        this.drawPolyTipB(ctx, result, tipB);
        this._ctx_fill(ctx)

        let res = this.drawLineTipB(ctx, result, tipB)
        this.writeLineTip(ctx, res)
    }


    drawPolyTipB(ctx, result, position) {
        let point = (new Point(position)).copy()// || this.b)
            /* First we grab the cached _curve_ of this line instance. */
            ;
        /* For the tail, we take the last-1 [and last] to render a
        point at this position. */
        let penUltP = this.b.copy()
            ;

        /*Ensure the given point is a point instance. */
        /* it's likely the original point, therefore we ensure it's new. */
        let tail = point.copy()
        /* Rotate this _end point_ to look directly at, then perform a 180, allowing Polypoint to offset the calculation */
        let target = this.a

        tail.lookAt(new Point(target))
        tail.rotation += 180

        tail.radius = 7

        // ctx.closePath()
        // ctx.stroke()
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

        return tail
    }

    drawLineTipB(ctx, result, position) {
        let s = new Point(position)
        ctx.moveTo(s[0], s[1])
        let tail = s.copy()
        /* Look at the target point. */

        let a = this.a
        // let penUltP = curves[curves.length-2]
        tail.lookAt(a)
        return tail
    }

    writeLine(ctx) {
        ctx.stroke()
    }

    perform(ctx) {
        let b = this.b;
        ctx.lineTo(b[0], b[1])
    }

    close(ctx) {
        this.doClosePath && ctx.closePath()
    }
}

Polypoint.head.install(Line)


class BezierCurve extends Line {

    // create(p1, p2, color='red', width=1) {
    // }
    useCache = false
    getControlPoints(useCache=this.useCache) {

        if(useCache === true && this.cachedControlPoints) {
            return this.cachedControlPoints
        }

        let a = this.a
          , b = this.b
          ;

        // let midDistance = a.distanceTo(b)*.5
        // let offset = this.offset == undefined? 0: this.offset

        /*A bezier requires two control points */
        // let cached = [
        //       a.project(midDistance + offset)
        //     , b.project(midDistance + offset)
        // ]
        let cached = [
              a.project()
            , b.project()
        ]

        this.cachedControlPoints = cached;
        return cached
    }

    get points() {
        return new PointList(this.a,this.b)
    }


    drawLineTipA(ctx, result, position) {
        let s = this.a.copy()
        ctx.moveTo(s[0], s[1])
        s.rotation = this.a.rotation + 180
        // let target = this.b.copy()
        // s.lookAt(new Point(target))
        return s
    }

    drawPolyTipA(ctx, result, position) {

        let tail = this.a.copy()
        /* Rotate this _end point_ to look directly at, then perform a 180,
        allowing Polypoint to offset the calculation */
        let target = this.b
        // tail.lookAt(new Point(target))
        /* Spin the point around the center (its nose).
        rotate to be _under_ the point. */
        tail.rotation = this.a.rotation + 180
        /* poly distance from the tip */
        tail.radius = 7

        let callback = tip => {
            /* Draw tip */
            tip.draw.ngon(ctx, 3, tail.radius)
        }

        saveRestoreDraw(ctx, tail, callback)

        return tail
    }

    drawLineTipB(ctx, result, position) {
        let s = new Point(position).copy()
        ctx.moveTo(s[0], s[1])
        // let tail = s.copy()
        /* Look at the target point. */
        s.rotation = this.b.rotation
        let a = this.a
        // let penUltP = curves[curves.length-2]
        // tail.lookAt(a)
        return s
    }

    drawPolyTipB(ctx, result, position) {
        /* it's likely the original point, therefore we ensure it's new. */
        let tail = (new Point(position)).copy()// || this.b)
            ;

        /* TODO:
        Attempt to understand why the b tip of a spline is -90,
        But the `a` tip 180*/
        tail.rotation += this.b.rotation + -90
        tail.radius = 7

        let callback = tip => {
            /* Draw tip */
            tip.draw.ngon(ctx, 3, tail.radius)
        }

        saveRestoreDraw(ctx, tail, callback)
    }

    perform(ctx) {
        let b = this.b;
        let cps = this.getControlPoints()
        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/bezierCurveTo
        let bp = b
        ctx.bezierCurveTo(cps[0].x, cps[0].y, cps[1].x, cps[1].y, bp.x, bp.y)
    }
}



class QuadraticCurve extends Line {
    /* A Quad line control point is A.project() */
    useCache = false
    getControlPoints(useCache=this.useCache) {

        if(useCache === true && this.cachedControlPoints) {
            return this.cachedControlPoints
        }

        let a = this.a
          , b = this.b
          ;

        // let midDistance = a.distanceTo(b)*.5
        // let offset = this.offset == undefined? 0: this.offset

        /*A quadratic curve requires two control points */
        let cached = [
              a.project()
            // , b.project()
        ]

        this.cachedControlPoints = cached;
        return cached
    }

    get points() {
        return new PointList(this.a,this.b)
    }

    perform(ctx) {
        let b = this.b;
        let cps = this.getControlPoints()
        // https://developer.mozilla.org/
        // en-US/docs/Web/API/CanvasRenderingContext2D/quadraticCurveTo
        ctx.quadraticCurveTo(cps[0].x, cps[0].y, b.x, b.y);
    }
}


Polypoint.head.install(BezierCurve)


class CantenaryCurve extends Line {

    doTips = true
    sine = 1
    bounceRate = .1
    _oneReducer = 1
    stable = false
    /* When sine bouncing, reduce over time to stop the motion.
    0 would turn of motion, 1 would bounce forever very quickly.*/
    reductionRate = .999
    swingDegrees = 20
    elasticity = .09

    create(a,b, length=undefined, color='red', width=1) {
        super.create(a,b,color,  width)
        this._length = length
        /* Length elasticity when oscillating */
        this.stretchMultiplier = 1
    }

    get points() {
        return new PointList(this.a,this.b)
    }

    set length(v) {
        this._length = v
        this.cachedCantenary = undefined
    }
    restart() {
        this.sine = this._restLength * this.stretchMultiplier
        this._oneReducer = 1
        this.stable = false;
    }

    set restLength(v) {
        this._restLength = v
        this.sine = v * this.stretchMultiplier
        this._oneReducer = 1
    }

    set stretchMultiplier(v) {
        this.sine = this._restLength * v
    }

    getCurveLength(a, b) {
        let l = this._length
        if(l == undefined){
            return distance(a, b) * 1.5
        }
        return l
    }

    getControlPoints() {
        return this.getCachedCurve()
    }

    getCachedCurve() {
        if(!this.cachedCantenary ) {
            let a = this.a
                , b = this.b
                ;
            this.cachedCantenary = getCatenaryCurve(a,b, this.getCurveLength(a,b))
        }

        return this.cachedCantenary
    }

    draw(ctx, color=undefined) {
        ctx.strokeStyle = color == undefined? this.color: color
        ctx.lineWidth = this.width == undefined? 1: this.width
        let pl = new PointList()
        pl.push(this.a, this.b)

        let result = this.perform(ctx)
        this.writeLine(ctx)
        ;(this.doTips) && this.performDrawTips(ctx, result)
    }

    perform(ctx, result) {

        result = result || this.getControlPoints()
        let curves = result.curves


        ctx.moveTo(result.start[0], result.start[1])

        if(!curves) {
            let p = result.lines[0]
            ctx.lineTo(p[0], p[1])
            return result;
        }

        for (let i = 0; i < curves.length; i++) {
            let c = curves[i]
            ctx.quadraticCurveTo(
                c[0], // cpx
                c[1], // cpy
                c[2], // x
                c[3], // y
            )
        }

        return result;
    }

    // performDrawTips(ctx, result){
    //     this.performTipA(ctx, result)
    //     this.performTipB(ctx, result)
    // }

    performTipB(ctx, result){
        let tipB = this.b

        this.drawPolyTipB(ctx, result, tipB);
        this.writePolyTipB(ctx)

        let res = this.drawLineTipB(ctx, result, tipB)
        // this.writeLineTipB(ctx, res)
        this.writeLineTip(ctx, res)
    }

    drawLineTipB(ctx, result, position) {
        let s = new Point(position)
            /* First we grab the cached _curve_ of this line instance. */
            , curves = result.curves

        ctx.moveTo(s[0], s[1])

        let tail = s.copy()
        /* Look at the target point. */
        let lines = result.lines;
        let penUltP =(curves == undefined)? result.start: curves[curves.length-1]
        // let penUltP = curves[curves.length-2]
        tail.lookAt(new Point(penUltP))
        return tail
    }

    writeLineTipB(ctx, tip) {

        tip.rotation += 90
        tip.radius = 10

        let lineA = tip.project()
        tip.rotation += 180
        let lineB = tip.project()
        lineA.pen.line(ctx, lineB, '#AADDFF', 2)
    }

    // performTipA(ctx, result){
    //     let tipA = this.a
    //     ctx.beginPath()
    //     this.drawPolyTipA(ctx, result, tipA)
    //     this.writePolyTipB(ctx)

    //     let res = this.drawLineTipA(ctx, result, tipA)
    //     this.writeLineTip(ctx, res)
    // }

    drawTipA(ctx, result, position) {
    }

    drawPolyTipA(ctx, result, position) {
        /* First we grab the cached _curve_ of this line instance. */
        let curves = result.curves
        /* For the tail, we take the last-1 [and last] to render a
        point at this position. */
        let lines = result.lines
        let penUltP = (curves == undefined)? this.b: curves[1]

        /*Ensure the given point is a point instance. */
        /* it's likely the original point, therefore we ensure it's new. */
        let tail = (new Point(position || result.start)).copy()
        /* Rotate this _end point_ to look directly at, then perform a 180,
        allowing Polypoint to offset the calculation */
        let target = curves? penUltP: this.b
        tail.lookAt(new Point(target))
        /* Spin the point around the center (its nose).
        rotate to be _under_ the point. */
        tail.rotation += 180
        /* poly distance from the tip */
        tail.radius = 6

        let callback = tip => {
            /* Draw tip */
            tip.draw.ngon(ctx, 3, tail.radius)
        }

        saveRestoreDraw(ctx, tail, callback)

        return tail
    }

    drawLineTipA(ctx, result, position) {
        let s = new Point(position || result.start)
            /* First we grab the cached _curve_ of this line instance. */
            , curves = result.curves

        ctx.moveTo(s[0], s[1])

        /* The position of the tip, picking nodes along the line */
        let target = (curves == undefined)? result.lines[0]: curves[0];
        let tail = (new Point(s)).copy()
        /* Look at the target point. */
        tail.lookAt(new Point(target))
        return tail
    }

    drawTipB(ctx, result, position) {
        return this.drawLineTipB(ctx, result, position)
        // return this.drawPolyTipB(ctx, result, position)
    }

    drawPolyTipB(ctx, result, position) {
        let point = (new Point(position)).copy()// || this.b)
            /* First we grab the cached _curve_ of this line instance. */
            , curves = result.curves
            ;
        /* For the tail, we take the last-1 [and last] to render a
        point at this position. */
        let lines = result.lines
        let penUltP =(curves == undefined)? lines[lines.length-1]: curves[curves.length-2]
            ;

        /*Ensure the given point is a point instance. */
        /* it's likely the original point, therefore we ensure it's new. */
        let tail = point.copy()
        /* Rotate this _end point_ to look directly at, then perform a 180, allowing Polypoint to offset the calculation */
        let target = curves? penUltP: result.start

        tail.lookAt(new Point(target))
        tail.rotation += 180

        tail.radius = 7

        // ctx.closePath()
        // ctx.stroke()
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

        return tail
    }

    writeLineTip(ctx, tip) {

        tip.rotation += 90
        tip.radius = 10

        let lineA = tip.project()
        tip.rotation += 180
        let lineB = tip.project()
        lineA.pen.line(ctx, lineB, 'orange', 2)

    }

    writePolyTipB(ctx) {
        // Make a fancy Fill thing.
        ctx.fillStyle = '#880000'
        ctx.fill()
    }

    update(ctx, tick) {

        if(this.stable = this.sine < .1) {
            return
        }

        this.stretchMultiplier = this.elasticity * this._oneReducer

        this.sine *= this.reductionRate
        this._oneReducer *= this.reductionRate

        this.length = this._restLength + (
                Math.sin(tick * this.bounceRate) * this.sine
            )
    }

    updateSwing(ctx, tick) {

        let oneRed = this._oneReducer
        /* How much _left and right_ can the line swing. */
        let swingDegrees = this.swingDegrees * oneRed
        /* How much theta for a gravity vector.
            configured to be 0 as naturally _down_ gravity.
            -45 would swing south west. */
        let gravityDegrees = 0
        let swingSpeed = this.bounceRate * .5 // .04
        /* Default .1, changed here to match gravity swing */
        this.stretchMultiplier = this.elasticity * oneRed

        let deltaSwing = (Math.sin((tick * swingSpeed) % 360) * swingDegrees)
        let t = -90 + gravityDegrees + deltaSwing
        this.deltaT = t
        this.useCache = false
        let ps = this.points
        let com = ps.centerOfMass()
        // ps.offset(com.multiply(-1))
        // ps.rotate(1)
        this.a.x = ps[0].x
        this.a.y = ps[0].y
        this.b.x = ps[1].x
        this.b.y = ps[1].y

        this.color = (this.stable)? 'green': 'red'
    }

    clear() {
        this.cachedCantenary = undefined
    }

}

