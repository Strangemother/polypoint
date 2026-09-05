/*
title: Split
files:
    functions/clamp.js
---

_Split_ a point, line or curve into many smaller points.

    const p = new Point({radius: 100})
    let points = p.split(4)

Lines and curves share one `split(count, options)` signature:

    // both ends included
    curve.split(20)                          
    // ends excluded
    curve.split(20, { inner: true })         
    // equal arc-length spacing
    curve.split(20, { even: true })          
    // a point every 10 units
    curve.split({ every: 10 })               
    // lerp radius/rotation a -> b
    curve.split(20, { hinted: true })        
    // face a point
    curve.split(20, { lookAt: point })       
    // rotate each point (radians)
    curve.split(20, { angle: Math.PI / 2 })  

A bare number as the second argument is treated as `angle`.
*/

/* splitToPointList(point, count).pen.indicators(ctx)*/
const splitToPointList = function(point, count, radius, rotation, angle=undefined) {
    let p1 = point
    let r = radius || point.radius
    p1 = p1.subtract(r)
    let _radius = radius || p1.radius
    // p1.rotation = rotation || point.rotation
    /* p1 does not recieve r.radians - use the original rads.
    rotation ==0 is falsy.*/
    let rot = rotation == undefined? point.radians: rotation
    return PointList.from(
                getPolyDistributedPoints(count, p1, _radius, rot, angle)
                // splitRadius(p1, count)
            )
}


const lerp = (x, y, a) => x * (1 - a) + y * a;


const animatedSegmentOffset = function(delta, speed, segmentSize, scale=.005) {
    let travel = delta * speed * scale
    // Keep animation inside one segment width/angle to avoid hard clipping pops.
    return ((travel % segmentSize) + segmentSize) % segmentSize
}


const EMPTY_SPLIT_OPTIONS = Object.freeze({})

const splitArgs = function(count, options) {
    /* Normalise `split(count, options)` arguments.
    Accepts `split({ every: 10 })` and the legacy `split(count, angle)`. */
    if(count != null && typeof count == 'object') {
        options = count
        count = options.count
    }
    if(typeof options == 'number') {
        return [count, { angle: options }]
    }
    return [count, options || EMPTY_SPLIT_OPTIONS]
}


const splitFractions = function(count, inner) {
    /* Linear 0..1 fractions along a path for `count` points.
    Ends are included unless `inner`; a single point sits at the middle. */
    if(!(count >= 1)) { return [] }
    if(count == 1) { return [.5] }
    let r = new Array(count)
    if(inner) {
        let step = 1 / (count + 1)
        for (var i = 0; i < count; i++) { r[i] = (i + 1) * step }
        return r
    }
    let step = 1 / (count - 1)
    for (var i = 0; i < count; i++) { r[i] = i * step }
    return r
}


const everyFractions = function(total, every, inner) {
    /* Fractions for a point every `every` units along a `total` length. */
    let r = []
    if(!(every > 0) || !(total > 0)) { return r }
    for (let d = inner ? every : 0; d <= total; d += every) {
        if(inner && d >= total) { break }
        r.push(d / total)
    }
    return r
}


function bLerp(a,b,t){
    return (1-t)*a+t*b;
}

// AWESOME! https://acegikmo.com/bezier/
// https://acegikmo.medium.com/the-ever-so-lovely-bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©zier-curve-eb27514da3bf
function lerpV2(a,b,t){
    return {
        x: bLerp(a.x,b.x,t),
        y: bLerp(a.y,b.y,t)
    };
}


function get_bezier_point(p0, p1, p2, p3, t ){
    var a = lerpV2(p0,p1,t);
    var b = lerpV2(p1,p2,t);
    var c = lerpV2(p2,p3,t);
    var d = lerpV2(a,b,t);
    var e = lerpV2(b,c,t);
    return lerpV2(d,e,t);
}


function get_bezier_derivative(p0, p1, p2, p3, t) {
    var oneMinusT = 1 - t;

    var dx = 3 * oneMinusT * oneMinusT * (p1.x - p0.x) +
             6 * oneMinusT * t * (p2.x - p1.x) +
             3 * t * t * (p3.x - p2.x);

    var dy = 3 * oneMinusT * oneMinusT * (p1.y - p0.y) +
             6 * oneMinusT * t * (p2.y - p1.y) +
             3 * t * t * (p3.y - p2.y);

    return { dx, dy };
}


class BezierArcTable {
    /* Cumulative chord lengths at `samples` evenly spaced `t` values,
    used to map an arc-length distance back to `t`. Reused across frames;
    `update()` only resamples when the control points or sample count change. */
    constructor() {
        this.key = new Float64Array(8)
        this.samples = 0
        this.lengths = null
        this.total = 0
        this.cursor = 0
    }

    update(p0, p1, p2, p3, samples) {
        let k = this.key
        if(samples == this.samples
            && k[0] == p0.x && k[1] == p0.y && k[2] == p1.x && k[3] == p1.y
            && k[4] == p2.x && k[5] == p2.y && k[6] == p3.x && k[7] == p3.y) {
            return this
        }
        k[0] = p0.x; k[1] = p0.y; k[2] = p1.x; k[3] = p1.y
        k[4] = p2.x; k[5] = p2.y; k[6] = p3.x; k[7] = p3.y

        if(samples != this.samples) {
            this.samples = samples
            this.lengths = new Float64Array(samples + 1)
        }

        let lengths = this.lengths
        let prevX = p0.x, prevY = p0.y
        let total = 0
        for (var i = 1; i <= samples; i++) {
            let p = get_bezier_point(p0, p1, p2, p3, i / samples)
            total += Math.hypot(p.x - prevX, p.y - prevY)
            lengths[i] = total
            prevX = p.x; prevY = p.y
        }
        this.total = total
        return this
    }

    tAt(distance) {
        /* `t` for an arc-length `distance`. Queries are expected in ascending
        order; call `rewind()` before a new walk. */
        let lengths = this.lengths
        let samples = this.samples
        let seg = this.cursor
        while(seg < samples - 1 && lengths[seg + 1] < distance) { seg++ }
        this.cursor = seg
        let segLength = lengths[seg + 1] - lengths[seg]
        let f = segLength > 0 ? (distance - lengths[seg]) / segLength : 0
        return clamp((seg + f) / samples, 0, 1)
    }

    rewind() {
        this.cursor = 0
        return this
    }
}


const lerpRadius = function(a, b, v) {
    /* Process the width from the _first_ to the _last_ of a line.*/
    // let av = ((asLast.radius - asFirst.radius) * (i/l))+asFirst.radius
    return ((b - a) * v) + a
}

const radiusManual = function(a, b, i) {}


class PointListSplit {
    /* Buildin split functionality for a pointlist. */
    segment(index=0, count=10) {
        /* Split a segment */
        let pl = this.parent
        // return splitToPointList(
        //         point
        //         , count
        //         , point.radius
        //         , point.radians + outerAngle
        //         , angle
        //     )
    }
}


Polypoint.head.installFunctions('Point', {
  
    /* A "split" function to divide the point circumference to many points.
    Return a list of points.

        let pointList = point.split(4)
        let pointList = point.split(4, { angle: 0, outerAngle: Math.PI })

    A `point.project()` is the same as `point.split(1)`
    */
    split(count, options=undefined, outerAngle=0) {
        let point = this
        let angle = options
        if(options != null && typeof options == 'object') {
            angle = options.angle
            outerAngle = options.outerAngle == undefined ? outerAngle : options.outerAngle
        }
        return splitToPointList(point, count, point.radius, point.radians + outerAngle, angle)
    }

    , _splitTick: 0
    , splitAnimated(count, angle=undefined, speed=.2, delta=this._splitTick) {
        let point = this
        let safeCount = Math.max(1, count)

        this._splitTick += 1
        let segmentAngle = (Math.PI * 2) / safeCount
        let outerAngle = animatedSegmentOffset(delta, speed, segmentAngle)

        return splitToPointList(
            point,
            count,
            point.radius,
            point.radians + outerAngle,
            angle
        )
    }
});



Polypoint.head.installFunctions('BezierCurve', {
    /* Split the curve into points.

        curve.split(20)                          // both ends included
        curve.split(20, { inner: true })         // ends excluded
        curve.split(20, { even: true })          // equal arc-length spacing
        curve.split({ every: 10 })               // a point every 10 units
        curve.split(20, { hinted: true })        // lerp radius/rotation a -> b
        curve.split(20, { lookAt: point })       // face a point
        curve.split(20, { angle: rads })         // rotate each point

    Rotation precedence: `lookAt` > `hinted` > curve tangent. `angle` is
    added in all cases. `samples` overrides the arc-length resolution used
    by `even` and `every`.
    */
    split(count, options=undefined) {
        [count, options] = splitArgs(count, options)
        let { angle=0, inner=false, even=false, every, hinted=false, lookAt, samples } = options

        let p0 = this.a
        let p3 = this.b
        let [p1, p2] = this.getControlPoints()
        let r = new PointList

        let byArc = even || every > 0
        let table = byArc ? this._arcTable(p0, p1, p2, p3, samples).rewind() : undefined
        let fractions = every > 0
            ? everyFractions(table.total, every, inner)
            : splitFractions(count, inner)

        for (var i = 0; i < fractions.length; i++) {
            let u = fractions[i]
            let t = byArc ? table.tAt(u * table.total) : u

            let p = new Point(get_bezier_point(p0, p1, p2, p3, t))
            if(hinted) { p.radius = lerp(p0.radius, p3.radius, u) }

            if(lookAt) {
                p.lookAt(lookAt)
                p.radians += angle
            } else if(hinted) {
                p.rotation = lerp(p0.rotation, p3.rotation, u)
                p.radians += angle
            } else {
                let { dx, dy } = get_bezier_derivative(p0, p1, p2, p3, t)
                p.radians = Math.atan2(-dx, dy) + angle
            }
            r.push(p)
        }
        return r
    }

    , arcLength(samples=undefined) {
        /* Approximate length of the curve, in units. */
        let [p1, p2] = this.getControlPoints()
        return this._arcTable(this.a, p1, p2, this.b, samples).total
    }

    , _arcTable(p0, p1, p2, p3, samples=undefined) {
        if(samples == undefined) {
            // Control polygon length bounds the arc; ~1 sample per 2 units,
            // rounded to 64s so small movements don't reallocate the table.
            let polyLength = Math.hypot(p1.x - p0.x, p1.y - p0.y)
                           + Math.hypot(p2.x - p1.x, p2.y - p1.y)
                           + Math.hypot(p3.x - p2.x, p3.y - p2.y)
            samples = clamp(Math.ceil(polyLength / 128) * 64, 64, 1024)
        }
        let table = this._bezierArcTable || (this._bezierArcTable = new BezierArcTable)
        return table.update(p0, p1, p2, p3, samples)
    }

    /* Aliases for the option flags. */
    , splitInner(count, angle=0) { return this.split(count, { inner: true, angle }) }
    , splitEven(count, angle=0) { return this.split(count, { even: true, angle }) }
    , splitExact(every, angle=0) { return this.split({ every, angle }) }
    , splitHinted(count) { return this.split(count, { hinted: true }) }

    , _splitTick: 0
    , splitAnimated(count, angle=undefined, speed=.2, delta=this._splitTick) {

        let p0 = this.a
        let p3 = this.b
        let [p1, p2] = this.getControlPoints()

        let r = new PointList

        let safeCount = Math.max(1, count)
        let splitVal = 1 / safeCount
        let rotationOffset = angle == undefined ? 0 : angle

        this._splitTick += 1
        let _s = animatedSegmentOffset(delta, speed, splitVal)

        for (var i = 0; i < count+1; i++) {
            let t = i * splitVal + _s
            if(t > 1 || t < 0) { continue }

            let p = new Point(get_bezier_point(p0, p1, p2, p3, t))
            let { dx, dy } = get_bezier_derivative(p0, p1, p2, p3, t)
            p.radians = Math.atan2(-dx, dy) + rotationOffset
            r.push(p)
        }

        return r
    }
});


Polypoint.head.installFunctions('Line', {
    /* Split the line into points. Same options as `BezierCurve.split`
    (`even` is meaningless on a straight line and ignored).

        line.split(5)                     // both ends included
        line.split(5, { inner: true })    // ends excluded
        line.split({ every: 10 })

    `angle` is in degrees relative to the line direction; when omitted the
    points keep the default rotation.
    */
    split(count, options=undefined) {
        [count, options] = splitArgs(count, options)
        let { angle, inner=false, every, hinted=false, lookAt } = options

        let a = this.a
        let b = this.b
        let r = new PointList

        let fractions = every > 0
            ? everyFractions(a.distanceTo(b), every, inner)
            : splitFractions(count, inner)

        let degs = undefined
        if(angle != undefined) {
            degs = calculateAngle(a, b) - angle
        }

        for (var i = 0; i < fractions.length; i++) {
            let u = fractions[i]
            let p = new Point(lerp(a.x, b.x, u), lerp(a.y, b.y, u), a.radius, degs)
            if(hinted) {
                p.radius = lerp(a.radius, b.radius, u)
                p.rotation = lerp(a.rotation, b.rotation, u)
            }
            if(lookAt) { p.lookAt(lookAt) }
            r.push(p)
        }
        return r
    }

    , splitInner(count, angle=undefined) { return this.split(count, { inner: true, angle }) }
    , splitExact(every, angle=undefined) { return this.split({ every, angle }) }

    , _splitTick: 0
    , splitAnimated(count, angle=undefined, speed=.2, delta=this._splitTick) {

        let a = this.a
        let b = this.b
        let r = new PointList

        let safeCount = Math.max(1, count)
        let splitVal = 1 / safeCount
        let degs = undefined
        if(angle != undefined) {
            degs = calculateAngle(a, b) - angle;
        }

        this._splitTick += 1
        let _s = animatedSegmentOffset(delta, speed, splitVal)

        for (var i = 0; i < count+1; i++) {
            let slideOffset = i * (splitVal) + _s;
            if(slideOffset > 1 || slideOffset < 0) { continue }
            r.push(new Point(
                    lerp(a.x, b.x, slideOffset)
                    , lerp(a.y, b.y, slideOffset)
                    , a.radius
                    , degs
                )
            )
        }
        return r
    }
});
