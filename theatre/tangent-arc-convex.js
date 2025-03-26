/*
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
    ../point_src/angle.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/curve-extras.js
    ../point_src/mirror.js
    ../point_src/stage.js
    ../point_src/intersections.js
    ../point_src/tangents.js

 */


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.pointA = new Point({x:200,y:300, radius:70})
        this.pointB = new Point({x:500,y:300, radius:100})
        this.dragging.addPoints(this.pointA, this.pointB)
        // this.events.wake()

        this.lines = []
        this.rLength = 400
    }

    draw(ctx){
        this.clear(ctx)

        let a = this.pointA;
        let b = this.pointB;

        let ts = arcTangents(a, b, this.rLength, 0)

        if(ts == undefined) {
            /* No tangents - too far away. */
            a.pen.indicator(ctx)
            b.pen.indicator(ctx, {color: this.pointB.color})
            return
        }

        /* The points.*/
        a.pen.indicator(ctx)
        b.pen.indicator(ctx)

        /* The big protractor angles.*/
        ts.c?.pen.indicator(ctx, {color:'#333'})
        ts.d?.pen.indicator(ctx, {color:'#333'})

        /* Tangent start and end points. */
        ts.n.forEach(p=>p.pen.indicator(ctx,'orange'))

        ctx.strokeStyle = 'yellow'

        /* draw an arc, with the origin at o4,
        then from the end point, to the start point (because we're sweeping
        backward).
        get the angle of the origin to t2 (left),
        then get the angle of origin to t4 (right). */
        let origin0 = ts.origin0
            , origin1 = ts.origin1
            , sharedRadius = ts.sharedRadius
            , p0Rads = ts.n[0].radians
            , p1Rads = ts.n[1].radians
            , p2Rads = ts.n[2].radians
            , p3Rads = ts.n[3].radians
            ;

        ctx.beginPath()
        // ctx.arc(origin0.x, origin0.y, sharedRadius, p1Rads, p0Rads, 1);
        origin0.draw.arc(ctx, sharedRadius, p1Rads, p0Rads, 1);
        // origin0.draw.arc(ctx, sharedRadius, p0Rads, p1Rads, 0);
        ctx.stroke()

        ctx.beginPath()
        // ctx.arc(origin1.x, origin1.y, sharedRadius, p2Rads, p3Rads, 1);
        origin1.draw.arc(ctx, sharedRadius, p2Rads, p3Rads, 1);
        ctx.stroke()

        ctx.strokeStyle = 'grey'

        origin1 && (origin1).pen.fill(ctx, '#CC00BB')
        origin0 && (new Point(origin0)).pen.fill(ctx, '#CC00BB')
    }
}




;stage = MainStage.go();

