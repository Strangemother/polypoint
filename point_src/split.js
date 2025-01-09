/*
files:
    functions/clamp.js
*/

/* splitToPointList(point, count).pen.indicators(ctx)*/
const splitToPointList = function(point, count, radius, rotation, angle=undefined) {
    let p1 = point
    let r = radius || point.radius
    p1 = p1.subtract(r)
    let _radius = radius || p1.radius
    // p1.rotation = rotation || point.rotation
    //
    //
    /* p1 does not recieve r.radians - use the original rads.
    rotation ==0 is falsy.*/
    let rot = rotation == undefined? point.radians: rotation
    return PointList.from(
                getPolyDistributedPoints(count, p1, _radius, rot, angle)
                // splitRadius(p1, count)
            )
}


Polypoint.head.installFunctions('Point', {
    /* A "split" function to divide the point circumference to many points.
    Return a list of points.

        let pointList = point.split(4)

    A `point.project()` is the same as `point.split(1)`
    */
    split(count, angle=undefined) {
        let point = this
        return splitToPointList(point, count, point.radius, point.radians, angle)
    }
});


const lerp = (x, y, a) => x * (1 - a) + y * a;


function bLerp(a,b,t){
    return (1-t)*a+t*b;
}

// AWESOME! https://acegikmo.com/bezier/
// https://acegikmo.medium.com/the-ever-so-lovely-bézier-curve-eb27514da3bf
function lerpV2(a,b,t){
    return { x: bLerp(a.x,b.x,t), y: bLerp(a.y,b.y,t) };
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


Polypoint.head.installFunctions('BezierCurve', {
    splitInner(count, angle=0) {

        // console.log('BezierCurve split')
        let p0 = this.a
        let p3 = this.b
        let [p1, p2] = this.getControlPoints()

        let r = new PointList

        let splitVal = 1 / (count+1)

        for (var i = 1; i < count+1; i++) {
            let t = i * splitVal
            let { dx, dy } = get_bezier_derivative(p0, p1, p2, p3, t)
            p= new Point(get_bezier_point(p0, p1, p2, p3, t))
            p.radians = angle + Math.atan2(-dx, dy)
            r.push(p)
        }
        return r
    }

    , splitOnly(count, angle=undefined, ctx) {

        // console.log('BezierCurve split')
        let p0 = this.a
        let p3 = this.b
        let [p1, p2] = this.getControlPoints()

        let r = new PointList

        let splitVal = 1 / (count-1)

        if(count == 1) {
            // mid point.
            let p = new Point(get_bezier_point(p0, p1, p2, p3, .5))
            r.push(p)
            return r
        }

        for (var i = 0; i < count; i++) {
            let p = new Point(get_bezier_point(p0, p1, p2, p3, i*splitVal))
            r.push(p)
        }

        p1.pen.indicator(ctx, {color:'yellow'})
        p2.pen.indicator(ctx, {color:'yellow'})

        return r
    }

    , split(count, angle=0) {
        let p0 = this.a;
        let p3 = this.b;
        let [p1, p2] = this.getControlPoints();

        let r = new PointList();

        let splitVal = 1 / (count - 1);

        if (count == 1) {
            // Midpoint
            let t = 0.5;
            let p = new Point(get_bezier_point(p0, p1, p2, p3, t))
            let { dx, dy } = get_bezier_derivative(p0, p1, p2, p3, t)
            p.radians = Math.atan2(dx, -dy);

            r.push(p);
            return r;
        }

        for (var i = 0; i < count; i++) {
            let t = i * splitVal ;
            let p = new Point(get_bezier_point(p0, p1, p2, p3, t));
            let { dx, dy } = get_bezier_derivative(p0, p1, p2, p3, t);
            p.radians = Math.atan2(-dx, dy) + angle
            // p.radians = Math.atan2(dx, -dy) + Math.PI;

            r.push(p);
        }

        return r;
    }

    , splitHog(count, angle=undefined, ctx) {

        // console.log('BezierCurve split')
        let p0 = this.a
        let p3 = this.b
        let [p1, p2] = this.getControlPoints()

        let r = new PointList

        let splitVal = 1 / (count-1)

        if(count == 1) {
            // mid point.
            let p = new Point(get_bezier_point(p0, p1, p2, p3, .5))
            r.push(p)
            return r
        }

        let midX = (p0.x + p3.x) * .5
        let midY = (p0.y + p3.y) * .5
        let mid = new Point(midX, midY)


        let mid2X = (p1.x + p2.x) * .5
        let mid2Y = (p1.y + p2.y) * .5
        let mid2 = new Point(mid2X, mid2Y)

        mid.pen.indicator(ctx, {color:'yellow'})
        mid2.pen.indicator(ctx, {color:'yellow'})

        let mid3X = (mid.x + mid2.x) * .5
        let mid3Y = (mid.y + mid2.y) * .6
        let mid3 = new Point(mid3X, mid3Y)

        mid3.pen.indicator(ctx, {color:'yellow'})

        for (var i = 0; i < count; i++) {
            let p = new Point(get_bezier_point(p0, p1, p2, p3, i*splitVal))
            p.lookAt(mid3)
            p.rotation += 180
            r.push(p)
        }


        p1.pen.indicator(ctx, {color:'yellow'})
        p2.pen.indicator(ctx, {color:'yellow'})

        return r
    }

    , splitHinted(count) {
        /* Perform a split, using the point hints as a reference for size
        and rotation lerping through the count. */
        let r = new PointList
        let [first, last] = this.points
        let [p1, p2] = this.getControlPoints()

        let midX = (first.x + last.x) * .5
        let midY = (first.y + last.y) * .5
        let mid = new Point(midX, midY)

        let splitVal = 1 / (count-1)
        let dis = first.distanceTo(last)
        for (var i = 0; i < count; i++) {
            let p = new Point(get_bezier_point(first, p1, p2, last, i*splitVal))
            p.radius = lerpRadius(first.radius, last.radius, i/count)
            p.lookAt(mid)
            p.rotation = lerpRadius(first.rotation, last.rotation, i/count)
            r.push(p)
        }
        return r

    }
});


const lerpRadius = function(a, b, v) {
    /* Process the width from the _first_ to the _last_ of a line.*/
    // let av = ((asLast.radius - asFirst.radius) * (i/l))+asFirst.radius
    return ((b - a) * v) + a
}

const radiusManual = function(a, b, i) {
}

Polypoint.head.installFunctions('Line', {

    /* A "split" function to divide the point circumference to many points.
    Return a list of points.

        let pointList = point.split(4)

    A `point.project()` is the same as `point.split(1)`
    */
    splitInner(count, angle=undefined) {

        let a = this.a
        let b = this.b
        let r = new PointList

        if(count == 1) {
            // mid point.
            r.push(new Point(
                lerp(a.x, b.x, .5)
                , lerp(a.y, b.y, .5)
                )
            )
            return r
        }

        let splitVal = 1 / (count - 1)
        let degs = undefined
        if(angle != undefined) {
            degs = calculateAngle(a, b) - angle;
        }

        for (var i = 0; i < count; i++) {
            r.push(new Point(
                lerp(a.x, b.x, i * splitVal)
                , lerp(a.y, b.y, i * splitVal)
                , a.radius
                , degs
                )
            )
        }
        return r
    }

    , split(count, angle=undefined) {

        let a = this.a
        let b = this.b
        let r = new PointList

        let splitVal = 1 / (count+1)
        let degs = undefined
        if(angle != undefined) {
            degs = calculateAngle(a, b) - angle;
        }

        for (var i = 1; i < count+1; i++) {
            r.push(new Point(
                lerp(a.x, b.x, i * splitVal)
                , lerp(a.y, b.y, i * splitVal)
                , a.radius
                , degs
                )
            )
        }
        return r
    }
});
