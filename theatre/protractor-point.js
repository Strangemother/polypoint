/*
title: Angle Protractor Tool
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
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


Perform this:
https://www.youtube.com/watch?v=SUI_AWpgmzU

draw two rays from the two points (o1, o2) (of any angle)
o1 has r1, o2 has r2
set the protractor to r3
then (along the ray), plot r2+r3
same on the other point, plot r1+r3 -> obtains a new radius for o1
setting the compass on o1, we draw the radius r1+r3
setting the compass on o2, we draw the radius r2+r3

Where the two new circles intersect, these become o3 and o4, being the
origin points of our new tangent arc

join points o1 to o3, o3 to o2, o2 to o4, o4 to o1
this produces 4 lines (a diamond shape).
The intersection of those lines with the original r1 and r2 are the four tangent points.

now draw an arc from o2 with a radius of r2,
draw from t1 through to t2
*/



function quantizeNumber(value, quantize=1) {
  const quantizedValue = Math.round(value / quantize) * quantize;
  return quantizedValue;
}


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.pointA = new Point({x:200,y:300, radius:70})
        this.pointB = new Point({x:500,y:300, radius:100})
        this.dragging.addPoints(this.pointA, this.pointB)
        this.events.wake()

        this.lines = []
        this.rLength = 200
    }

    draw(ctx){
        this.clear(ctx)

        let a = this.pointA;
        let b = this.pointB;

        let r1 = a.radius
        let r2 = b.radius
        let r3 = this.rLength

        // Then build the new protractor points.
        let c = a.copy().update({
            radius: r1 + r3
        })

        let d = b.copy().update({
            radius: r2 + r3
        })


        c.pen.circle(ctx, undefined, '#777')
        d.pen.circle(ctx, undefined, '#777')

        a.pen.indicator(ctx)
        b.pen.indicator(ctx, {color: this.pointB.color})

        this.lines.forEach(l=>l.render(ctx))

        let o34 = getCircleCircleIntersections(c, d)
        if(o34.length > 0) {
            // let [o3, o4] = o34
            let o3 = new Point(o34[1])
            let o4 = new Point(o34[0])
            let o1 = a
            let o2 = b
            // join points o1 to o3, o3 to o2, o2 to o4, o4 to o1
            let lineA = new Line(o1, o3)
            let lineB = new Line(o3, o2)
            let lineC = new Line(o2, o4)
            let lineD = new Line(o4, o1)
            this.lines = [lineA, lineB, lineC, lineD]
            let t1, t2, t3, t4;

            let o1LineAInter = checkPointIntersectionEdge(lineA, a)
            if(o1LineAInter) {
                t1 = new Point(o1LineAInter[0])
                // o1LineAInter.forEach(p=>t1.pen.fill(ctx, 'green'))
                t1.pen.fill(ctx, 'green')
            }

            o1LineAInter = checkPointIntersectionEdge(lineD, a)
            if(o1LineAInter) {
                t2 = new Point(o1LineAInter[0])
                // o1LineAInter.forEach(p=>(new Point(p)).pen.fill(ctx, 'green'))
                t2.pen.fill(ctx, 'green')
            }

            o1LineAInter = checkPointIntersectionEdge(lineB, b)
            if(o1LineAInter) {
                t3 = new Point(o1LineAInter[0])
                // o1LineAInter.forEach(p=>(new Point(p)).pen.fill(ctx, 'green'))
                t3.pen.fill(ctx, 'green')
            }

            o1LineAInter = checkPointIntersectionEdge(lineC, b)
            if(o1LineAInter) {
                t4 = new Point(o1LineAInter[0])
                // o1LineAInter.forEach(p=>(new Point(p)).pen.fill(ctx, 'green'))
                t4.pen.fill(ctx, 'green')
            }

            // ctx.moveTo(t2.x, t2.y)
            // ctx.arcTo(o4.x, o4.y, t4.x, t4.y, r3);

            ctx.strokeStyle = 'yellow'
            /* draw an arc, with the origin at o4,
            then from the end point, to the start point (because we're sweeping
            backward).
            get the angle of the origin to t2 (left),
            then get the angle of origin to t4 (right). */
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
            ctx.strokeStyle = 'grey'


            o3 && (o3).pen.fill(ctx, '#CC00BB')
            o4 && (new Point(o4)).pen.fill(ctx, '#CC00BB')
        }

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

