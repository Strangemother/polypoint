/*
title: Concave Arc Tangent
categories: tangents
files:
    head
    point
    stroke
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/curve-extras.js
    ../point_src/mirror.js
    ../point_src/stage.js
    ../point_src/text/label.js
    ../point_src/intersections.js


 */


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.pointA = new Point({x:200,y:300, radius:70})
        this.pointB = new Point({x:500,y:300, radius:100})
        this.dragging.addPoints(this.pointA, this.pointB)
        // this.events.wake()

        this.lines = []
        this.rLength = 200
    }

    draw(ctx){
        this.clear(ctx)

        let a = this.pointA;
        let b = this.pointB;
        this.rLength = a.distanceTo(b) * .6

        let ts = getTangents(a,b, this.rLength)

        if(ts == undefined) {
            a.pen.circle(ctx)
            b.pen.circle(ctx, {color: this.pointB.color})
            return
        }



        if(ts.o3 && ts.o4) {

            let dist = ts.o3.distanceTo(ts.o4)
            let v = dist - (this.rLength * 2)
            if(v < 4) {
                /* touching arcs */
                /* The two primary indicators. */
                a.pen.circle(ctx)
                b.pen.circle(ctx)
                return
            }
        }

        return this.drawArcs(ctx, ts)
    }

    drawArcs(ctx, ts){
        let a = this.pointA;
        let b = this.pointB;

        let color = 'green'
        let [t1, t2] = ts.a
        let [t3, t4] = ts.b

        /* Touch points. */
        t1.pen.fill(ctx, 'red') // top left
        t2.pen.fill(ctx, 'orange') // bottom left
        t3.pen.fill(ctx, 'green') // top right
        t4.pen.fill(ctx, 'lime') // bottom left

        // t1.pen.arc(ctx, t2, 'red')
        ctx.beginPath()
        a.draw.arc(ctx, a.distanceTo(t1), a.directionTo(t1), a.directionTo(t2))
        ctx.stroke()
        ctx.beginPath()
        b.draw.arc(ctx, b.distanceTo(t3), b.directionTo(t3), b.directionTo(t4), 0)
        ctx.stroke()
        // c.pen.circle(ctx, undefined, '#777')
        // d.pen.circle(ctx, undefined, '#777')

        // /* The two primary indicators. */
        // a.pen.indicator(ctx)
        // b.pen.indicator(ctx)

        /* The straight lines to the protractor points.*/
        // ts.lines.forEach(l=>l.render(ctx))

        ctx.strokeStyle = 'yellow'
        /* draw an arc, with the origin at o4,
        then from the end point, to the start point (because we're sweeping
        backward).
        get the angle of the origin to t2 (left),
        then get the angle of origin to t4 (right). */

        let o4 = ts.o4
            , o3 = ts.o3
            , r3 = ts.r3
            ;
        const t2Angle = twoPointsAngle(o4, t2)
        const t4Angle = twoPointsAngle(o4, t4)
        ctx.beginPath()
        ctx.arc(o4.x, o4.y, r3, t4Angle, t2Angle, 1);

        ctx.stroke()
        ctx.beginPath()

        const t3Angle = twoPointsAngle(o3, t3)
        const t1Angle = twoPointsAngle(o3, t1)
        ctx.arc(o3.x, o3.y, r3, t1Angle, t3Angle, 1);

        ctx.stroke()
        // ctx.strokeStyle = 'grey'

    }
}



let getTangents = function(a, b, rLength){

    let r1 = a.radius
    let r2 = b.radius
    let r3 = rLength

    // Then build the new protractor points.
    let c = a.copy().update({
        radius: r1 + r3
    })

    let d = b.copy().update({
        radius: r2 + r3
    })

    let o34 = getCircleCircleIntersections(c, d)
    if(o34 === false || o34.length == 0) {
        return
    }

    let o3 = new Point(o34[1])
    let o4 = new Point(o34[0])

    // let [o3, o4] = o34
    let o1 = a
    let o2 = b
    // join points o1 to o3, o3 to o2, o2 to o4, o4 to o1
    let asLine = (x,y)=>{let l = new Line(x, y); l.doTips=false; return l}
    let lineA = asLine(a, o3)
    let lineB = asLine(o3, b)
    let lineC = asLine(b, o4)
    let lineD = asLine(o4, a)
    let lines = [lineA, lineB, lineC, lineD]

    let t1, t2, t3, t4;

    let o1LineAInter = checkPointIntersectionEdge(lineA, a)
    if(o1LineAInter) {
        t1 = new Point(o1LineAInter[0])
        // o1LineAInter.forEach(p=>t1.pen.fill(ctx, 'green'))
    }

    let o1LineBInter = checkPointIntersectionEdge(lineD, a)
    if(o1LineBInter) {
        t2 = new Point(o1LineBInter[0])
        // o1LineAInter.forEach(p=>(new Point(p)).pen.fill(ctx, 'green'))
    }

    let o2LineAInter = checkPointIntersectionEdge(lineB, b)
    if(o2LineAInter) {
        t3 = new Point(o2LineAInter[0])
        // o1LineAInter.forEach(p=>(new Point(p)).pen.fill(ctx, 'green'))
    }

    let o2LineBInter = checkPointIntersectionEdge(lineC, b)
    if(o2LineBInter) {
        t4 = new Point(o2LineBInter[0])
        // o2LineBInter.forEach(p=>(new Point(p)).pen.fill(ctx, 'green'))
    }

    return {
        a: [t1, t2]
        , b: [t3, t4]
        , lines
        , o1, o2, o3, o4
        , r3
    }
}


const twoPointsAngleRaw = function(origin, target) {
    /*given two points, return the relative angle (in radians), of target from the origin.
    For example if the target was left of the origin, this would be a -Math.PI */
        const { x: x1, y: y1, radius: r1 } = origin;
        const { x: x2, y: y2, radius: r2 } = target;

        // Calculate distance between centers
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Calculate the angle between the points
        const angle = Math.atan2(dy, dx);
        return angle
}


const twoPointsAngle = function(origin, target) {
    let dist = new Point(target.distance2D(origin))
    return dist.atan2()
}


;stage = MainStage.go();

