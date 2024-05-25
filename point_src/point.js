const point = function(p, b) {
    if(p.constructor == Point) {
        return p
    }
    if(Array.isArray(p)) {
        return new Point({x: p[0], y:p[1]})
    }

    if(b !== undefined) {
        return new Point({x: p, y: b})
    }

    return p
}


class PointDraw {
    // Draw functions for the Point.draw
    // methods.
    constructor(point) {
        this.point = point;
    }

    arc(ctx, radius=undefined) {
        let p = this.point;
        let r = radius === undefined? p.radius: radius;
        ctx.arc(p.x, p.y, r, 0, Math.PI2)
    }

    circle(ctx, radius) {
        return this.arc(ctx, radius)
    }

    lineTo(ctx, b) {
        let a = this.point;
        if(b != undefined) {
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
        }
    }

    ngon(ctx, sides, radius, fromCenter=true) {
        /* Draw a polygon of _n_ sides, with an optional radius.

                polygonPoint.radius = 20
                polygonPoint.draw.ngon(ctx, 7)

         */

        /* Apply the position of the polypoint.*/
        let p = this.point;
        let r = radius === undefined? p.radius: radius;

        if(fromCenter) {
            p = p.add(-r)
        }

        // return polyGen(ctx, sides, p);
        let points = getPolyDistributedPoints(sides, p, r)
        let p0 = points[0]

        ctx.moveTo(p0.x, p0.y)

        for (i = 1; i <= points.length - 1; i++) {
            let p = points[i]
            ctx.lineTo(p.x, p.y);
        }

    }
}


class Random {

    /* The minimum value the _point(value)_ can be, before
    the automatic 'float' method is used over the 'int' method.
    */
    pointIntMin = 2

    int(multiplier=1) {
        /* Generate an integer between 0 and the given multiplier.
            Given 1 (default), the result will be either 0 or 1

            random.int(10)
            7
            random.int(50)
            30
            random.int(300)
            220
        */
        return Number((this.float() * (multiplier)).toFixed())
    }

    float(multiplier=1) {
        return Math.random() * multiplier
    }

    string(multiplier=1, rot=32){
        return this.radix(this.float(multiplier), rot).slice(2)
    }

    radix(v, rot=32) {
        return v.toString(rot)
    }

    point(multiplier=1, method=undefined) {
        /*
            return a random point(), with the X/Y values set as random*multplier
         */
        if (method == undefined) {
            method = multiplier <= this.pointIntMin ? 'float': 'int'
        }

        let p = new Point(this[method](multiplier), this[method](multiplier))
        return p
    }
}


random = new Random()

class PointPen {
    // Draw functions for the Point.draw
    // methods.
    constructor(point) {
        this.point = point;
    }

    _quickStroke(ctx, f, color, width=1) {
        ctx.beginPath()
        let r = f()

        ctx.strokeStyle = color == undefined? 'yellow': color
        ctx.lineWidth = width == undefined? 1: width
        ctx.stroke()

        return r
    }

    ngon(ctx, sides, radius, fromCenter=true) {
        this._quickStroke(ctx, ()=>{
            this.point.draw.ngon(ctx, sides, radius, fromCenter)
        })
    }

    circleGon(ctx, radius, lod=.3, fromCenter=true) {
        let sides = Number((radius * lod).toFixed())
        sides = Math.max(8, sides)
        return this.ngon(ctx, sides, radius, fromCenter)
    }

    line(ctx, otherPoint, color, width) {
        this._quickStroke(ctx, ()=>{
            this.point.draw.lineTo(ctx, otherPoint)
        }, color, width)
    }

    circle(ctx, radius=undefined, color, width) {
        /*An arc, but complete with begin path and stoking */
        this._quickStroke(ctx, ()=>{
            this.point.draw.arc(ctx, radius)
        }, color, width)
    }

    indicator(ctx, miniConf={}) {
        /* Synonymous to:

            weightedComPoint.project().pen.line(ctx, weightedComPoint, 'red', 2)
            weightedComPoint.pen.circle(ctx, undefined, 'yellow', 1)

        */
        let def = {
            line: {color:'red', width: 2}
            , circle: {color:'yellow', width: 1}
        };

        Object.assign(def, miniConf)
        this.point.project().pen.line(ctx, this.point, def.line.color, def.line.width)
        this.circle(ctx, undefined, def.circle.color, def.circle.width)
    }
}


class Positionable {

    set x(v) {
        this._opts.x = v
    }

    set y(v) {
        this._opts.y = v
    }

    get x() {
        let _x = this._opts.x
        return _x == undefined? 0: _x
    }

    get y() {
        let _y = this._opts.y
        return _y == undefined? 0: _y
    }

    set(x,y) {

        if(y == undefined) {
            if(Array.isArray(x)) {
                [x,y] = x
            } else {
                // object
                for(let k in x) {
                    this[k] = x[k]
                }
                y = x?.y
                x = x?.x
            }
        }
        this.x = x == undefined? 0: x
        this.y = y == undefined? 0: y
    }

    subtract(other){
        return new Point(this.x - other.x, this.y - other.y)
    }

    add(p) {
        if(typeof(p) == 'number') {
            p = point(p, p)
        }

        return new Point(
            this.x + p.x,
            this.y + p.y
        )
    }

    divide(p) {
        if(typeof(p) == 'number') {
            p = point(p, p)
        }

        return new Point(
            this.x / p.x,
            this.y / p.y
        )
    }

    multiply(p) {
        if(typeof(p) == 'number') {
            p = point(p, p)
        }

        return new Point(
            this.x * p.x,
            this.y * p.y
        )
    }
}


class Rotation extends Positionable {

    set rotation(v){

        /* Issue:
        This is a problem. If used with concat addition the value is bad.
        Because:

            p.rotation = 0

        results in

            p.rotation = 270

        therefore

            p.rotation += 1

        or
            p.rotation = 271

        results in:

            p.rotation = 181

        because the UP vector is applied on the _set_ and polutes the incoming
        value.

        When using an external delta, it obviously works:

            p.rotate = (delta * spinSpeed)
            delta += 1

        */
        this._rotationDegrees = v % 360
    }

    rotate(degrees) {
        this.rotation = this.UP + degrees
    }

    get rotation() {
        return this._rotationDegrees
    }

    get radians() {
        /*Return the _radians_ of the current rotation, where _rotation returns
        the degrees*/
        return degToRad(this._rotationDegrees)
    }

    set radians(angle) {
        /* by pushing through the existing rotations, we account for the _up_
        vector. */
        this.rotation = radiansToDegrees(angle)
    }

    lookAt(otherPoint) {
        // Calculate the differences in x and y coordinates
        const delta = otherPoint.subtract(this);
        // Calculate the angle in radians
        const angleRadians = delta.atan2()
        this.radians = angleRadians
        return angleRadians
    }

    getTheta(other, direction=undefined) {
        /* Return the calculated theta value through atan2 and built to offload
        some of the boring.
        The _direction_ denotes the "gravity" pull. Generally this is `DOWN`.


        Synonymous to:

            let theta = Math.atan2(point.y,
                                   point.x);

            let theta = Math.atan2(point.y - other.y,
                                   point.x - other.x);

            let theta = Math.atan2(point.y - other.y,
                                   point.x - other.x) - DOWN;

         */
        let x = this.x
          , y = this.y
            ;

        if(other) {
            let _p = this.subtract(other)
            x = _p.x
            y = _p.y
        }

        // Gravity is generally DOWN by default
        // perhaps this should be -rotation.
        // direction = this.resolveStringOrFunction(direction, DOWN)
        let theta = Math.atan2(y, x) - direction
        return theta
    }
}


class Tooling extends Rotation {

    resolveStringOrFunction(direction, defaultValue) {
        let res = defaultValue;

        if(typeof(direction) == 'string') {
            // str such as this["rotation"]
            res = this[direction]
        }

        if(typeof(direction) == 'function') {
            return direction()
        }

        // if(direction == undefined) {
        return res
        // }
    }

    atan2() {
        /* Return the theta value through the atan2 function for this point.*/
        let x = this.x
            , y = this.y
            ;

        let thetaRadians = Math.atan2(y, x);
        return thetaRadians
    }

    project(distance, rotation, relative=true) {
        if(rotation !== undefined && relative == true) {
            rotation = (this.UP + rotation) % 360
        }
        return new this.constructor(projectFrom(this, distance, rotation))
    }


    copy(position) {
        /* Given another point, replicate the value into this node.
        Else, return a new node with the same information as this point.
        */
        if(position) {
            this.set(position.x, position.y)
            return this;
        }

        return new Point(this.x, this.y)
    }


    interpolateTo(other, offset, pointIndex=0) {
        /* return a point relative from _this_ point towards the `other`,
        offset by the given number `offset` value.
        The `pointIndex` (default 0) identifies from which point [this, other]
        to offset.*/
        // console.log('interpolateTo', this, other)
        return getPointOffsetAbsolute(this, other, offset, pointIndex)
    }

    interpolateFrom(other, offset, pointIndex=0) {
        return getPointOffsetAbsolute(other, this, offset, pointIndex)
    }

    static distance(a, b){
        return Math.hypot(b.x - a.x, b.y - a.y);
    }

    distanceTo(other) {
        return distance(this, other)
    }

    quantize(amount=1) {
        let q = quantizeNumber
        return new this.constructor({
                            x: q(this.x, amount)
                            , y: q(this.y, amount)
                        })
    }

    protractorAngleTo(other, referencePoint) {
        let value = calculateAngleWithRefWithNeg(this, other, referencePoint)
        return new Angle(value)
    }
}


class Point extends Tooling {
    // x=0
    // y=0

    radius = 5
    UP = UP_DEG
    _rotationDegrees = UP_DEG

    constructor(opts={}){
        super(opts)
        opts = arguments[0] || {}
        // If given a Point instance, return the  point.
        if(opts && (opts.constructor == this.constructor) ){ return opts }
        // new Point(x,y, ...)  // reset the opts obj.
        if(arguments.length > 1){ opts = {} }

        this._opts = opts
        // set 0 or more object
        this.set.apply(this, arguments)
    }

    get draw() {
        let r = this._draw
        if(r == undefined) {
            r = new PointDraw(this)
            this._draw = r
        }
        return r
    }

    get pen() {
        let r = this._pen
        if(r == undefined) {
            r = new PointPen(this)
            this._pen = r
        }
        return r
    }

    get [Symbol.toStringTag]() {
        return this.toString()
    }

    [Symbol.toPrimitive](hint) {
        if (hint === 'string') {
            return this.toString()
        }
        return Reflect.apply(...arguments)
    }

    toString(){
        return `Point({x:${this.x}, y:${this.y}})`;
    }

    get _liveProps() { return true }

    asArray(fix=false) {
        if(fix) {
            let int = (x)=> Number( x.toFixed(Number(fix)) )
            return [int(this.x), int(this.y)]

        }
        return [this.x, this.y]
    }

    asObject() {
        /* Return the important information about this node,
        used for _save_ or copy methods. */
        return {
            x: this.x
            , y: this.y
            , radius: this.radius
            , rotation: this.rotation
        }
    }

    isNaN(any=false) {
        let r = 0;
        r += +isNaN(this.x)
        r += +isNaN(this.y)
        if(r==0) { return false }

        if(r > 0) {
            if(any) { return true }
            // two NaNs, is always isNaN == true
            if(r >= 2) { return true }
        }

        return false
    }
}
