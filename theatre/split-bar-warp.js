/*
title: Split Bar Warp Distortion
categories: split
    curve
files:
    ../point_src/math.js
    head
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/pointlistpen.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/extras.js
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/functions/clamp.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/split.js
    ../point_src/curve-extras.js
 */

const zip = function(a, b) {

}

class MainStage extends Stage {
    canvas='playspace'
    // live=false
    live = true
    mounted(){
        this.gWidth = 50
        let c = this.point = this.center.copy().update({ radius: 100})
        this.count = 20

        let lpoints = [new Point(c.x-300, c.y-200, 50), new Point(c.x+300, c.y-200, 50)]
        this.line = new Line(...lpoints)

        let lpoints2 = [new Point(c.x-300, c.y+200, 50), new Point(c.x+300, c.y+200, 50)]
        this.line2 = new Line(...lpoints2)

        this.dragging.add(this.point, ...lpoints, ...lpoints2)//, ...lpoints, ...lpoints2, ...lpoints3, ...lpoints4)
    }

    draw(ctx){
        this.clear(ctx)
        let normRelRotation = 90
        this.point.radians += .01
        // this.point.split(this.count).pen.indicators(ctx)

        let as = this.line.splitInner(this.count, -normRelRotation)
        let bs = this.line2.splitInner(this.count, normRelRotation)

        // as.pen.indicators(ctx, {color:'#333'})
        // bs.pen.indicators(ctx, {color:'#333'})

        let lines = []
        let l = as.length
        let asFirst = this.line[0]
        let asLast = this.line[1]
        let bsFirst = this.line2[0]
        let bsLast = this.line2[1]

        const lerpRadius = function(a, b, v) {
            /* Process the width from the _first_ to the _last_ of a line.*/
            // let av = ((asLast.radius - asFirst.radius) * (i/l))+asFirst.radius
            return ((b - a) * (i/l)) + a
        }

        const radiusManual = function(a, b, i) {
            /* Manual lerping from line points. */
            a.radius = lerpRadius(asFirst.radius, asLast.radius, i/l)
            b.radius = lerpRadius(bsFirst.radius, bsLast.radius, i/l)
        }

        const radiusDistance = function(a, b, i) {
            /* Auto by distance. */
            let d = a.distanceTo(b)
            a.radius = b.radius = d * .4
        }

        const radiusLocked = function(a, b, i) {
            /*locked.*/
            a.radius = b.radius = 100
        }

        let p = this.point;

        for (var i = 0; i < l; i++) {

            // radiusManual(as[i], bs[i], i)
            // radiusDistance(as[i], p, i)
            // radiusLocked(as[i], bs[i], i)

            as[i].radius = as[i].distanceTo(p)
            // let line = new Line(as[i], bs[i])
            let line = new BezierCurve(as[i], bs[i])
            as[i].lookAt(p)
            bs[i].lookAt(p)

            line.doTips = false;
            lines.push(line)
        };


        let lc = {color: 'hsl(299deg 62% 44%)'}
        this.line.render(ctx, lc)
        this.line2.render(ctx, lc)

        // as.pen.indicators(ctx, {color:'#333'})
        // bs.pen.indicators(ctx, {color:'#333'})

        this.line.points.forEach(p=>p.pen.indicator(ctx), { line:{color:'#333'}})
        this.line2.points.forEach(p=>p.pen.indicator(ctx), { line:{color:'#333'}})


        lines.forEach((l)=>{
            l.render(ctx, lc);
        });

        this.point.pen.circle(ctx, {color:'#DDD '})

        // this.curve.render(ctx, {color: 'green'})
        // this.curve.splitInner(this.count, degToRad(0)).pen.indicators(ctx)

        // this.curve2.render(ctx, {color: 'red'})
        // this.curve2.split(this.count,  0, ctx).pen.indicators(ctx)

    }
}


;stage = MainStage.go();