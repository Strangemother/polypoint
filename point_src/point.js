/*
files:
    relative-xy.js
    pointcast.js
categories: primary
    point
doc_readme: point/readme.md
doc_content: point/*.md
doc_imports: point
doc_loader: loadDocInfo

*/

const isPoint = function(value) {
    return value.constructor == Point
}


const isFunction = function(value) {
    return (typeof(value) == 'function')
}


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


window.loadDocInfo = function() {
    /* Return the think to resolve */
    console.log('loadDocInfo called')
    return Point;
}


class Positionable extends Relative {
    /* The base `Positionable` class provides functionality for
    plotting the X and Y of an entity. This includes any fundamental
    methods such as `multiply()`.
    */

    /* ABOVE X method

    Multiline - touching.
    */
    set x(value) {
        /* Set the _X_ (horizontal | latitude | across) value of the positionable.
        From cooridinate top left `(0,0)``

            point.x = 100

        If the given value is a function, the function is called immediately,
        with _this_ positionable as the first argument.

            stage.center.x = (p)=>200

         */
        // this._opts.x = isFunction(v)? v(this, 'x'): v
        return this.setSpecial('x', value)
    }

    set y(value) {
        /* Set the _Y_ (vertical | height | longtitude) value of the positionable.
        From cooridinate top left `(0,0)``

            point.x = 100

        If the given value is a function, the function is called immediately,
        with _this_ positionable as the first argument.

            stage.center.x = (p)=>200

         */
        // this._opts.y = isFunction(v)? v(this, 'y'): v
        return this.setSpecial('y', value)
    }

    get x() {

        // const _x = this._opts.x;
        // let r = _x == undefined? 0: _x
        // let v = this._relativeData[0]
        // r = isFunction(r)? r(this, 'x'): r
        // return r + v
        return this.getSpecial('x', 0)
    }

    get y() {

        // const _y = this._opts.y;
        // let r = _y == undefined? 0: _y
        // r = isFunction(r)? r(this, 'y'): r
        // return r + this._relativeData[1]
        return this.getSpecial('y', 1)
    }

    set radius(v) {
        // this._opts.radius = isFunction(v)? v(this, 'radius'): v
        return this.setSpecial('radius', v)
    }

    get radius() {
        /*
        Return the _radius_ of this point in base units (pixels)

            const point = new Point(100,300, 20)
            point.radius == 20
        */
        // const _radius = this._opts.radius
        // let r = _radius == undefined? 0: _radius;
        // r = isFunction(r)? r(this, 'radius'): r;
        // return r + this._relativeData[2]
        return this.getSpecial('radius', 2, 5)
    }

    setSpecial(key,  value) {
        /* Set the given `key`, `value`, assuming the given key is a "special"
        string, such as "radius".
        This method is called by the special getters and setters for this point:

            const point = new Point(100,300, 20)
            point.setSpecial('radius', 55)

        Synonymous to:

            point.radius = 55

        */
        this._opts[key] = isFunction(value)? value(this, key): value
        this.onSpecialSet(key, value)
        return true
    }

    onSpecialSet(key, value) {
        /* A callback executed by setSpecial when a "special" property is called.

        If a method on this point exists matching the _set method_ pattern,
        the method is called with the given `value`:

            class MyPoint extends Point {
                radiusSet(value) {
                    console.log('New Radius value is', value)
                }
            }

        */
        let name = `${key}Set`
        this[name] && this[name](value)
        // console.log(name)
    }

    getSpecial(key, relIndex=undefined, defaultValue=0) {
        /* Return a stored _special_ value given a `key`.

        If the `relIndex`  property is not None, the relative value found
        at the index (within this points relative data Array),
        add the stashed relative value to the result.

            const point = new Point(100,300, 20)
            point.getSpecial('radius', 2)
            // 20

        if a default value is given, and the internal `key` value does not exist,
        return the default value:

            point.getSpecial('banana', 'yellow')
            'yellow'

        */
        const internalValue = this._opts[key];
        let r = internalValue == undefined? defaultValue: internalValue
        r = isFunction(r)? r(this, key): r
        let relVal = relIndex != undefined? this.getRelativeData()[relIndex]: 0
        return r + relVal
    }

    set(x, y, radius, rotation) {
        /*
            set(x, y, radius, rotation)
            set(100)    => x,y
            set([])     => [x,y,radius, rotation]
            set({})     => *
        */
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

    _cast(other, _2=other) {
        if(typeof(other) == 'number') { other = point(other, _2) }
        if(Array.isArray(other)){ return point(other, _2) }
        return other
    }

    subtract(other, _2=other){
        /* "subtract" this point to the _other_ point, returning a new point. */
        if(typeof(other) == 'number') {
            other = point(other, _2)
        }

        return new Point(this.x - other.x, this.y - other.y)
    }

    add(other, _b,) {
        /* "Add" this point to the _other_ point, returning a new point. */
        other = this._cast(other, _b)

        return new Point(
            this.x + other.x,
            this.y + other.y
        )
    }

    divide(other) {
        /* "Divide" this point to the _other_ point, returning a new point. */
        if(typeof(other) == 'number') {
            other = point(other, other)
        }

        let nNaN = v => isNaN(v)? 0: v;

        return new Point(
              nNaN(this.x / other.x)
            , nNaN(this.y / other.y)
        )
    }

    multiply(other) {
        /* "Multiply" this point to the _other_ point, returning a new point. */
        if(typeof(other) == 'number') {
            other = point(other, other)
        }

        return new Point(
            this.x * other.x,
            this.y * other.y
        )
    }

    // _midpoint(other, offset=.5) {
    //     /*return a new point, with the XY set at the _mid point_ between
    //     this point and the given*/
    //     let p = this.copy()
    //     p.x = (p.x + other.x) * offset
    //     p.y = (p.y + other.y) * offset
    //     return p
    // }

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

}



class Rotation extends Positionable {
    set rotation(value){
        /* Set the rotation in degrees (0 to 360). If `this.modulusRotate` is
        `true` (default), the given value is fixed through modulus 360

            point.rotation = 600
            // 240
            point.rotation += 1
            // 241

        To set the rotation (degrees) whilst accounting for the _UP_ vector,
        consider the `rotate()` method.
        */

        if(this.modulusRotate == false) {
            return this.setSpecial('rotation', value)
        }

        return this.setSpecial('rotation', value % 360)

    }

    rotate(degrees) {
        this.rotation = this.UP + degrees
        return this
    }

    get rotation() {
        return this.getSpecial('rotation', 3)
    }

    get radians() {
        /*Return the _radians_ of the current rotation, where _rotation returns
        the degrees*/
        return degToRad(this.getSpecial('rotation', 3))
    }

    set radians(angle) {
        /* by pushing through the existing rotations, we account for the _up_
        vector. */
        this.rotation = radiansToDegrees(angle)
    }

    lookAt(otherPoint, add=0, rotationMultiplier=undefined) {
        /* Rotate the point such that the angle relative to the
        `otherPoint` is `0`, essentially _looking at_ the other point.

            point.lookAt(otherPoint)

        Return the angle in radians.
        */
        return this.radians = this.directionTo(otherPoint, rotationMultiplier, add)// + add
    }

    directionTo(otherPoint, rotationMultiplier=undefined, addRad=0) {
        // Calculate the differences in x and y coordinates
        let delta = 0
        try {
            delta = otherPoint.subtract(this);
        } catch(e) {
            if(!isPoint(otherPoint)) {
                otherPoint = new Point(otherPoint)
                delta = otherPoint.subtract(this);
            } else {
                throw e
            }

        }
        if(rotationMultiplier != undefined) {
            let normRad = this._normalizedRadians(otherPoint, rotationMultiplier, addRad)
            return normRad
        }

        // Calculate the angle in radians
        const angleRadians = delta.atan2()
        return angleRadians + addRad
    }

    _normalizedRadians(otherPoint, rotationMultiplier, addRad=0) {
        const delta = otherPoint.subtract(this);
        const targetRad = delta.atan2() + addRad;
        const currentRad = this.radians;

        let radDiff = targetRad - currentRad;
        // Normalize the angle difference to be within the range -PI to PI
        radDiff = Math.atan2(Math.sin(radDiff), Math.cos(radDiff));
        const newAngleRadians = currentRad + radDiff * rotationMultiplier;
        const normRad = Math.atan2(
                            Math.sin(newAngleRadians),
                            Math.cos(newAngleRadians)
                        );
        return normRad;
    }

    turnTo(otherPoint, rotationMultiplier=1){
        let normRad = this._normalizedRadians(otherPoint, rotationMultiplier)
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

        return res
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

    copy(position, deep=false) {
        /* Given another point, replicate the value into this node.
        Else, return a new node with the same information as this point.
        */
        if(position) {
            this.set(position.x, position.y)
            if(position?.radians){
                this.radians = position.radians
            }

            if(deep==true) {
                /* Deep should inspect all given options
                to a point, and apply them all. */

                if(position.radius){
                    this.radius = position.radius
                }
            }
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
        /*
        Synonymous to:

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

        return getPointOffsetAbsolute(this, other, offset, pointIndex)
    }

    interpolateFrom(other, offset, pointIndex=0) {
        return getPointOffsetAbsolute(other, this, offset, pointIndex)
    }

    static distance(a, b){
        return Math.hypot(b.x - a.x, b.y - a.y);
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

    lerpPixel(other, pixelDistance) {
        /*
        Returns a new point, offset by `pixelDistance` pixels in the direction
        from this point to the other point.
        */

        // Calculate the direction vector from this point to the other point
        let directionX = other.x - this.x;
        let directionY = other.y - this.y;
        let dirV = this.distance2D(other)
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
    /*The `Point` is the primary class for manipulating XY 2D points.

    Arguments:

        new Point(100, 200)

    Object | Array:

        new Point({x: 100, y: 200})
        new Point([100, 200])

    Properties:

        point = new Point
        point.x = 100
        point.y = 200

    */

    // x=0
    // y=0
    // radius = 5
    UP = UP_DEG
    _rotationDegrees = UP_DEG

    constructor(opts={}){
        /* A new point accepts arguments, an object, or an array.

        By default the `Point` accepts up to four arguments

            new Point(x, y, radius, rotation)

        The same properties may be supplied as a single `Array`:

            new Point([x, y, radius, rotation])

        If the given object is an `object`, we can assign properties
        immediately:

            point = new Point({x, y, radius, rotation, other:100})
            point.other
            // 100

        */
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
        this.created()
    }

    created() {
        // api hook for life.
    }

    update(data) {
        /*
        Perform an _update_ given a dictionary of other properties.

            point.update({ x: 200, color: 'red' })
        */
        for(let k in data) {
            this[k] = data[k]
        }

        return this
    }

    get uuid() {
        /* Get or create the random `_id` for this point.
        Return a unique string.
        */
        let r = this._id;
        if(r == undefined) {
            this._id = r = (~~(Math.random() * 10000)).toString(32)
        }
        return r
    }

    set uuid(v) {
        this._id = v
    }

    get [0]() {
        /* return the X value of the point:

            point[0]

        Note:

            point[0] == point.x
        */
        return this.x
    }

    set [0](value) {
        /*
        Sugar function to apply `this.x`:

            point[0] = 100
            point.x == 100
        */
        this.x = value
    }

    get [1]() {
        /* return the Y value of the point:

            point[0]

        Note:

            point[0] == point.y
        */
        return this.y
    }

    set [1](value) {
        /*
        Sugar function to apply `this.y`:

            point[0] = 300
            point.y == 300
        */
        this.y = value
    }

    get [Symbol.toStringTag]() {
        return this.toString()
    }

    [Symbol.toPrimitive](hint) {
        if (hint === 'string') {
            return this.toString()
        }
        return null
        // return Reflect.apply(...arguments)
    }

    toString(){
        let name = 'point'
        return `${name}({x:${this.x}, y:${this.y}})`;
    }

    get _liveProps() { return true }

    asArray(fix=false) {
        /*
        Return this point as an Array of 4 values:

            const point = new Point(1,2,3,4);
            point.asArray();
            // [1,2,3,4]

        Keys:

        + x
        + y
        + radius
        + rotation

        */
        // let r = [this.x, this.y, this.radius, this.rotation]
        let r = Object.values(this.asObject())
        if(fix) {
            let int = (x)=> Number( x.toFixed(Number(fix)) )
            return r.map(v=>int(v))
        }
        return r
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

}


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
