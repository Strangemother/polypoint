

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


class Relative {

    constructor(opts={}){
        // super(opts)
        this._relativeData = [0, 0, 0, 0]
    }

    getRelativeData() {
        let r = this._relativeData
        if(r == undefined) {
                                    //x,y,rad,rot
            r = this._relativeData = [0, 0, 0, 0]
        }
        return r
    }
}


class Positionable extends Relative {

    set x(v) {
        this._opts.x = isFunction(v)? v(this, 'x'): v
    }

    set y(v) {
        this._opts.y = isFunction(v)? v(this, 'y'): v
    }

    get x() {
        const opts = this._opts
            , _x = opts.x
            ;

        let r = _x == undefined? 0: _x
        let v = this._relativeData[0]
        r = isFunction(r)? r(this, 'x'): r
        return r + v
    }

    get y() {
        const opts = this._opts
            , _y = opts.y
            ;

        let r = _y == undefined? 0: _y
        r = isFunction(r)? r(this, 'y'): r
        return r + this._relativeData[1]
    }

    get rel() {
        let r = this._rel
        if(r != undefined) {
            return r
        }

        let relData = this._relativeData
        let sp = {
            get x(){
                return relData[0]
            }

            , set x(v) {
                relData[0] = v
            }

            , get y(){
                return relData[1]
            }

            , set y(v) {
                relData[1] = v
            }

            , get radius() {
                return relData[2]
            }

            , set radius(v) {
                return relData[2] = v
            }

            , get rotation() {
                return relData[3]
            }

            , set rotation(v) {
                return relData[3] = v
            }
        }

        this._rel = sp
        return sp
    }

    set rel(v) {
        this._opts.rel = v
    }

    set(x, y, radius, rotation) {

        const isUndefined = function(v) {
            return v === undefined
        }

        if(isUndefined(y)) {

            if(Array.isArray(x)) {
                let lmap = {
                    1: () => {
                        /* An array of one
                            set([200])
                        */
                    }
                    , 2: ()=> {
                        [x,y] = x
                    }
                    , 3: ()=> {
                        [x,y, radius] = x
                    }
                    , 4: ()=> {
                        [x,y, radius, rotation] = x
                    }
                }

                lmap[x.length]()
            } else if(typeof(x)=='number') {
                y = x
                x = x
            }else{
                // object
                for(let k in x) {
                    this[k] = x[k]
                }
                y = x?.y
                x = x?.x
            }
        }

        this.x = isUndefined(x)? 0: x
        this.y = isUndefined(y)? 0: y
        if(!isUndefined(radius)) {
            this.radius = radius
        }
        if(!isUndefined(rotation)) {
            this.rotation = rotation
        }
    }

    _cast(p, _2=p) {
        if(typeof(p) == 'number') {
            p = point(p, _2)
        }
        if(Array.isArray(p)){
            return point(p, _2)
        }
        return p
    }

    subtract(p, _2=p){
        if(typeof(p) == 'number') {
            p = point(p, _2)
        }

        return new Point(this.x - p.x, this.y - p.y)
    }

    add(p, _b,) {
        p = this._cast(p, _b)

        return new Point(
            this.x + p.x,
            this.y + p.y
        )
    }

    divide(p) {
        if(typeof(p) == 'number') {
            p = point(p, p)
        }

        let nNaN = v => isNaN(v)? 0: v;

        return new Point(
              nNaN(this.x / p.x)
            , nNaN(this.y / p.y)
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

    /* Perform random() on the X and Y.

    If a point is given, randomize to the _max_ of the given point
    If a single number is given, assume _square_
    If no params are given, discover the stage size.

    Use `Point.random()` for the same form, as a new point

        let p = new Point()
        p.randomize(100, 400)
        p.randomize(100) // 100, 100
        p.randomize(new Point(100, 400)) // 100, 400

    if one of the keys is undefined, no change occurs:

        p.setXY(500,700)
        p.randomize(100, undefined) // 100, 700
        p.randomize(undefined, 400) // 500, 400

        p.randomize(undefined, undefined) // 500, 700 // no change occurs.

    Note; no params will randomize as much as possible (the stage size)

        p.randomize() // 800, 600

    Other features would be nice:
    + random in rect (like stage):

        p.randomize(rect|dimensions)

    + Randomize other values, e.g radius, colors

        p.randomize(['x', 'y', 'radius', 'mass'])

        // randomize x to max 400, radius to max 50
        p.randomize({ x: 400, radius: 50})

    + In the future, the _origin_; randomize relative to a point:

        p.randomize({point, relative: true})

    */
    randomize(px, y) {

    }
}


class Rotation extends Positionable {
    set rotation(v){
        /* Set the rotation in Degrees (0 to 360). The value applied is a
         modulus of 360 and does not account for the _UP_ vector.

            >>> point.rotation = 600;
            240

            >>> point.rotation += 1
            241

        To set the rotation (degrees) accounting for the _UP_ vector, use
        the `rotate()` method.
        */

        if(this.modulusRotate == false) {
            this._rotationDegrees = v;
            return
        }

        this._rotationDegrees = v % 360
    }

    rotate(degrees) {
        this.rotation = this.UP + degrees
    }

    get rotation() {
        return this._rotationDegrees + this._relativeData[3]
    }

    get radians() {
        /*Return the _radians_ of the current rotation, where _rotation returns
        the degrees*/
        return degToRad(this._rotationDegrees + this._relativeData[3])
    }

    set radians(angle) {
        /* by pushing through the existing rotations, we account for the _up_
        vector. */
        this.rotation = radiansToDegrees(angle)
    }

    lookAt(otherPoint) {
        /* Rotate the point such that the angle relative to the
        `otherPoint` is `0`, essentially _looking at_ the other point.

            point.lookAt(otherPoint)

        Return the angle in radians.
        */
        let angleRadians = this.directionTo(otherPoint)
        this.radians = angleRadians
        return angleRadians
    }

    directionTo(otherPoint) {
        // Calculate the differences in x and y coordinates
        const delta = otherPoint.subtract(this);
        // Calculate the angle in radians
        const angleRadians = delta.atan2()
        return angleRadians
    }

    turnTo(otherPoint, rotationMultiplier=1){
        const delta = otherPoint.subtract(this);
        const targetRad = delta.atan2();
        const currentRad = this.radians;

        let radDiff = targetRad - currentRad;
        // Normalize the angle difference to be within the range -PI to PI
        radDiff = Math.atan2(Math.sin(radDiff), Math.cos(radDiff));
        const newAngleRadians = currentRad + radDiff * rotationMultiplier;
        const normRad = Math.atan2(
                            Math.sin(newAngleRadians),
                            Math.cos(newAngleRadians)
                        );

        this.radians = normRad;
        return normRad
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
        let np = new this.constructor(projectFrom(this, distance, rotation))
        np.rotation = this.rotation
        return np
    }


    copy(position) {
        /* Given another point, replicate the value into this node.
        Else, return a new node with the same information as this point.
        */
        if(position) {
            this.set(position.x, position.y)
            if(position?.radians){
                this.radians = position.radians
            }
            // if(position?.rotation){
            //     this.rotation = position.rotation
            // }
            return this;
        }

        return new Point(this.x, this.y, this.radius, this.rotation)
    }

    magnitude() {
        let x = this.x;
        let y = this.y;
        return Math.sqrt(x * x + y * y);
    }

    normalized(magnitude=this.magnitude()) {
        /* Synonymous to:

            {
                x: AB.x / magnitudeAB,
                y: AB.y / magnitudeAB
            };
        */
        return this.divide(magnitude)
        // return this.divide(this.magnitude())
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

    // distanceTo(other) {
    //     return distance(this, other)
    // }

    // distance2D(other) {
    //     return distance2D(this, other)
    // }

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

    _midpoint(other, offset=.5) {
        /*return a new point, with the XY set at the _mid point_ between
        this point and the given*/
        let p = this.copy()
        p.x = (p.x + other.x) * offset
        p.y = (p.y + other.y) * offset
        return p
    }

    midpoint(other, offset=0.5) {
        /*
        Returns a new point, with the XY set at the point that is `offset` times
        the distance from the current point to the other point.

        this function is also `lerp` for linear interpolation
        */
        let p = this.copy();
        p.x = p.x + (other.x - p.x) * offset;
        p.y = p.y + (other.y - p.y) * offset;
        return p;
    }

    lerp = this.midpoint

    lerpPixel(other, pixelDistance) {
        /*
        Returns a new point, offset by `pixelDistance` pixels in the direction
        from this point to the other point.
        */

        // Calculate the direction vector from this point to the other point
        let directionX = other.x - this.x;
        let directionY = other.y - this.y;
        let dirV = this.distance2D(other)
        // Calculate the distance between the two points
        // let distance = Math.sqrt(directionX * directionX + directionY * directionY);

        let distance = this.distanceTo(other)
        // Normalize the direction vector (to unit length)
        let unitX = dirV.x / distance;
        let unitY = dirV.y / distance;

        // Scale the unit vector by the desired pixel distance
        let offsetX = unitX * pixelDistance;
        let offsetY = unitY * pixelDistance;

        // Create a new point at the scaled offset from the original point
        let p = this.copy();
        p.x = this.x + offsetX;
        p.y = this.y + offsetY;

        return p;
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

        /* Ensure _opts_ is something. Default; a dict. */
        opts = arguments[0] || {}

        /* If given a Point instance, return the given point instance */
        if(opts && (opts.constructor == this.constructor) ){ return opts }
        // new Point(x,y, ...)  // reset the opts obj.
        if(arguments.length > 1 || typeof(arguments[0] == 'number')){ opts = {} }

        this.modulusRotate = undefined

        this._opts = Object.assign({relX: 0, relY: 0 }, opts)
        // set 0 or more object
        this.set.apply(this, arguments)
    }

    update(data) {
        /* Perform an _update_ given a dictionary of other properties. */
        for(let k in data) {
            this[k] = data[k]
        }

        return this
    }

    get uuid() {
        /* Get or create a random _id for this point.
        Return a unique string */
        let r = this._id;
        if(r == undefined) {
            this._id = r = Math.random().toString(32).slice(2)
        }
        return r
    }

    get [0]() {
        /* return the X value of the point:

            point[0]

        Note:
            point[0] == point.x
        */
        return this.x
    }

    set [0](v) {
        this.x = v
    }

    get [1]() {
        return this.y
    }

    set [1](v) {
        this.y = v
    }

    // get draw() {
    //     let r = this._draw
    //     if(r == undefined) {
    //         r = new PointDraw(this)
    //         this._draw = r
    //     }
    //     return r
    // }

    // get pen() {
    //     let r = this._pen
    //     if(r == undefined) {
    //         r = new PointPen(this)
    //         this._pen = r
    //     }
    //     return r
    // }

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
            return [int(this.x), int(this.y), int(this.radius), int(this.rotation)]

        }
        return [this.x, this.y, this.radius, this.rotation]
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

    // isNaN(any=false) {
    //     let r = 0;
    //     r += +isNaN(this.x)
    //     r += +isNaN(this.y)
    //     if(r==0) { return false }

    //     if(r > 0) {
    //         if(any) { return true }
    //         // two NaNs, is always isNaN == true
    //         if(r >= 2) { return true }
    //     }

    //     return false
    // }
}


class PointCast {
    /* a bunch of convert function, such as "asObject", wrapped within a sub unit

        Point.as.object()
    */

    constructor(point) {
        this.point = point
    }

    object() {
        let point = this.point;
        return {
            x: point.x
            , y: point.y
            , radius: point.radius
            , rotation: point.rotation
        }
    }

    array(fix=false) {
        let target = this.point;
        if(fix) {
            let int = (x)=> Number( x.toFixed(Number(fix)) )
            return [int(target.x), int(target.y), int(target.radius), int(target.rotation)]

        }
        return [target.x, target.y, target.radius, target.rotation]
    }
}


Polypoint.head.install(PointCast)
Polypoint.head.lazierProp('Point', function(){ return new PointCast(this)}, 'as')


Polypoint.head.install(Point)



Polypoint.head.mixin('Point', {
    isNaN: {
        value(any=false) {
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
        , writable: true
    }
})


;Object.defineProperty(Point, 'from', {
    value: function(a,b, c, d){

        if(a.offsetX && b==undefined) {
            // is an event
            return new Point(a.offsetX, a.offsetY)
        }
        return new Point(a,b, c, d)
    }
});

