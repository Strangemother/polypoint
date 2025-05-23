class Gradient {
    /* A Gradient instance can be generated once or for every draw.

    Examples:

    Pre-configure the origin points and the _type_

        g = new Gradient(null, 'Linear', [stage.center])
        g.addStops({
            0: "hsl(299deg 62% 44%)",
            1: "hsl(244deg 71% 56%)"
        })

        let canvasGradient = g.getObject(ctx)
        ctx.fillStyle = canvasGradient

    ---

    The context may be given early.

        g = new Gradient(ctx, 'Linear',)
        g.addStops({
            0: "hsl(299deg 62% 44%)",
            1: "hsl(244deg 71% 56%)"
        })
        let canvasGradient = g.getObject()
        ctx.fillStyle = canvasGradient

    ---

    Provide the context at the last stage.

        g = new Gradient()
        g.addStops({
            0: "hsl(299deg 62% 44%)",
            1: "hsl(244deg 71% 56%)"
        })
        g = g.conical(stage.center)
        // draw
        ctx.fillStyle = g.getObject(ctx)

    ---

    Radial gradient through two point. The same points are used as
    color stops.

        pointGradInner = primaryPoint.copy().update({
                radius: rel(-250),
                color:'pink'
            })
        pointGradOuter = primaryPoint.copy().update({
                radius: rel(-10),
                color: 'purple' // dark
            })

        pointGrad = (new Gradient).radial(pointGradInner, pointGradOuter)
        pointGrad.addStops({
            0: pointGradInner,
            1: pointGradOuter
        })
        pointGrad.radial() // refresh hack.
        let ctxPointGrad = pointGrad.getObject(ctx)
        primaryPoint.pen.fill(ctx, ctxPointGrad)
    ---

    This base `Gradient` class covers the three core types:

    + createConicGradient(startAngle, x, y)
    + createLinearGradient(x0, y0, x1, y1)
    + createRadialGradient(x0, y0, r0, x1, y1, r1)

    ## More Info

    Create a new gradient object:

        let g = new Gradient()

    Many _stops_ define the gradient color values. A _stop_ is a relative 1D
    position from `0` to `1`.

        g.addStops({
            0: "hsl(299deg 62% 44%)",
            1: "hsl(244deg 71% 56%)"
        })

    Define the type of gradient object:

        let rootPoint = stage.center
        let grad = g.linear(rootPoint)

    Under the hood, this configures and refreshes `g` gradient instance. similar
    to:

        // same as above
        g = new Gradient(null, 'Linear', [stage.center])

    A canvas _gradient_ is generated when required. This Gradient class mimic
    this:

        let canvasGradient = g.getObject(ctx)

    The `getObject` method returns a result from the root functions, such as
    `createLinearGradient`


    */


    constructor(ctx, type='Linear', originPoints=[]) {
        this.ctx = ctx
        this.type = type // default
        this.stopMap = new Map()
        this.originPoints = originPoints
    }

    // createConicGradient(startAngle, x, y)
    // conic({radians, x, y} = point) {
    conic(point) {
        let given = Array.from(arguments)
        if(given.length > 0){ this.originPoints = given }

        this.type = 'Conic'
        this._gradient = undefined
        return this
    }

    // createLinearGradient(x0, y0, x1, y1)
    // linear({x0, y0}=pointA, {x1, y1}=pointB)
    linear(pointA, pointB) {
        let given = Array.from(arguments)
        if(given.length > 0){ this.originPoints = given }

        this.type = 'Linear'
        this._gradient = undefined
        return this
    }

    // createRadialGradient(x0, y0, r0, x1, y1, r1)
    // radial({x0, y0, r0}=pointA, {x1, y1, r1}=pointB)
    radial(pointA, pointB) {
        let given = Array.from(arguments)
        if(given.length > 0){ this.originPoints = given }

        this.type = 'Radial'
        this._gradient = undefined
        return this
    }

    getObject(ctx=this.ctx) {
        let res = this._gradient;

        if(res) {
            return res
        }

        // build.
        let argsFuncName = `generate${this.type}Args`
        if(this[argsFuncName] == undefined) {
            console.error('Function does not exist,', argsFuncName)
        }

        const args = this[argsFuncName]()

        let canvasFuncName = `create${this.type}Gradient`
        res = this._gradient = ctx[canvasFuncName].apply(ctx, args)
        this.installStops(res)
        return res
    }

    installStops(gradient, stopMap=this.stopMap) {
        /* Given a canvas graident object, apply the stops from the _points_ within
        this instance.*/
        this.stopMap.forEach((v, k) => {
            gradient.addColorStop(k, v.color || v);
        })
    }

    generateLinearArgs() {
        // createLinearGradient(x0, y0, x1, y1)

        let origins = this.originPoints
        let inner = origins[0]
        let outer = origins[1]

        if(outer == undefined) {
            // Project 2 points of the radius.
            // use projections as the primaries.
            [inner, outer] = inner.split(2)
        }

        return [
            inner.x, inner.y,
            outer.x, outer.y,
        ]
    }

    generateConicArgs() {
        // createConicGradient(startAngle, x, y)
        let o = this.originPoints[0]
        return [
            o.radians, o.x, o.y
        ]
    }

    generateRadialArgs() {
        // createRadialGradient(x0, y0, r0, x1, y1, r1)
        /* If points.length == 1, assume the inner point.y/x is the same as B.
        And the radius is 0.*/
        let origins = this.originPoints
        let inner = origins[0]
        let outer = origins[1]

        if(outer == undefined) {
            outer = inner;
            inner = inner.copy().update({radius: 0})
        }

        return [
            inner.x, inner.y, inner.radius,
            outer.x, outer.y, outer.radius,
        ]
    }

    addStops(dict) {
        for(let k in dict) {
            this.stopMap.set(Number(k), dict[k])
        }
    }
}

