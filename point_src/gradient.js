class Gradient {
    /* A simple gradient tool */
    // type =
    /*
    createConicGradient(startAngle, x, y)
    createLinearGradient(x0, y0, x1, y1)
    createRadialGradient(x0, y0, r0, x1, y1, r1)
    */

    constructor(ctx, type='Linear') {
        this.ctx = ctx
        this.type = type // default
        this.stopMap = new Map()
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
            // Project 2 pointsof the radius.
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

