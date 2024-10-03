const splitToPointList = function(point, count) {
    /* splitToPointList(point, count).pen.indicators(ctx)*/
    let p1 = point
    let r = point.radius
    p1 = p1.subtract(r)
    p1.radius = r
    p1.rotation = point.rotation

    return PointList.from(
                getPolyDistributedPoints(count, p1, p1.radius, p1.radians)
                // splitRadius(p1, count)
            )
}


class MainStage extends Stage {
    canvas='playspace'
    // live=false
    live = true
    mounted(){
        this.point = new Point(300, 400, 100)
        this.count = 5

        let lpoints = [new Point(100, 100), new Point(500, 100)]
        this.line = new Line(...lpoints)


        let lpoints2 = [new Point(100, 200), new Point(500, 200)]
        this.line2 = new Line(...lpoints2)

        let lpoints3 = [new Point(100, 700, 200), new Point(500, 700, 200)]
        this.curve = new BezierCurve(...lpoints3)

        let lpoints4 = [new Point(100, 800, 200), new Point(500, 800, 200)]
        this.curve2 = new BezierCurve(...lpoints4)

        this.dragging.add(this.point, ...lpoints, ...lpoints2, ...lpoints3, ...lpoints4)
    }

    draw(ctx){
        this.clear(ctx)

        let pos = this.mouse.position
        pos.pen.circle(ctx)

        this.point.pen.indicator(ctx)
        this.point.split(this.count).pen.indicators(ctx)

        this.line.render(ctx)
        this.line.split(this.count).pen.indicators(ctx)

        this.line2.splitInner(this.count).pen.indicators(ctx, {color:'green'})
        this.line2.render(ctx, {color: 'green'})

        this.curve.render(ctx, {color: 'green'})
        this.curve.splitInner(this.count).pen.indicators(ctx)

        this.curve2.render(ctx, {color: 'red'})
        this.curve2.split(this.count).pen.indicators(ctx)
    }
}


Polypoint.head.installFunctions('Point', {

    /* A "split" function to divide the point circumference to many points.
    Return a list of points.

        let pointList = point.split(4)

    A `point.project()` is the same as `point.split(1)`
    */
    split(count) {
        let point = this
        return splitToPointList(point, count, point.radius, point.radians)
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

Polypoint.head.installFunctions('BezierCurve', {
    splitInner(count) {

        // console.log('BezierCurve split')
        let p0 = this.a
        let p3 = this.b
        let [p1, p2] = this.getControlPoints()

        let r = new PointList

        let splitVal = 1 / (count+1)

        for (var i = 1; i < count+1; i++) {
            r.push(
                new Point(get_bezier_point(p0, p1, p2, p3, i*splitVal))
            )
        }
        return r
    }

    , split(count) {

        // console.log('BezierCurve split')
        let p0 = this.a
        let p3 = this.b
        let [p1, p2] = this.getControlPoints()

        let r = new PointList

        let splitVal = 1 / (count-1)

        if(count == 1) {
            // mid point.
            r.push(new Point(
                get_bezier_point(p0, p1, p2, p3, .5)
                )
            )
            return r
        }

        for (var i = 0; i < count; i++) {
            r.push(
                new Point(get_bezier_point(p0, p1, p2, p3, i*splitVal))
            )
        }
        return r
    }
});


Polypoint.head.installFunctions('Line', {

    /* A "split" function to divide the point circumference to many points.
    Return a list of points.

        let pointList = point.split(4)

    A `point.project()` is the same as `point.split(1)`
    */
    splitInner(count) {

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

        for (var i = 0; i < count; i++) {
            r.push(new Point(
                lerp(a.x, b.x, i * splitVal)
                , lerp(a.y, b.y, i * splitVal)
                )
            )
        }
        return r
    }

    , split(count) {

        let a = this.a
        let b = this.b
        let r = new PointList

        let splitVal = 1 / (count+1)

        for (var i = 1; i < count+1; i++) {
            r.push(new Point(
                lerp(a.x, b.x, i * splitVal)
                , lerp(a.y, b.y, i * splitVal)
                )
            )
        }
        return r
    }
});

;stage = MainStage.go();