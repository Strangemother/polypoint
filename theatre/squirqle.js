/*
title: Curve Circle (Egg bezierFactor)
categories: curve
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/stage-clock.js
    ../point_src/extras.js
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/functions/clamp.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/curve-extras.js
    ../point_src/split.js
    ../point_src/angle.js

---

 */

function bezierFactor(count) {
    // Formula: factor = (4/3) * tan( (π / 2) / count )
    return (4 / 3) * Math.tan(Math.PI / (2 * count));
}


class MainStage extends Stage {
    canvas='playspace'
    live = true

    mounted(){
        this.generate()
        this.dragging.add(...this.points)
        this.lineStroke = new Stroke({
            color: '#fff'
            , width: 2
            , dash: [7, 4]
        })

        this.events.wake()
    }

    generate(count=4, radius=100) {
        let factor = bezierFactor(count)
        let size = radius * factor
        let p = this.center.copy().update({radius})
        this.point = this.center.copy().update({radius: radius - 5})
        let rot = Angle.from(1/4).turns

        /* Split on a point, returns many points around the radius. */
        const _splits = p.split(count, rot.rad)
        _splits.each.radius = size

        let lines = this.lines = []
        let length = _splits.length;

        /* Generate a new list of points, 2 points per line*/
        let res = new PointList;

        /* Generate many curves. connecting pairs. */
        for (var i = 0; i < length; i++) {
            let nextValue = i + 1;
            if(nextValue == length) {
                nextValue = 0 // wrap around.
            }
            let o = _splits[nextValue].copy()
            let a = _splits[i].copy()
            o.rotation += 180
            let line = new BezierCurve(a, o)
            res.push(a, o)
            lines.push(line)
        }

        this.points = res;
        return res
    }

    draw(ctx){
        this.clear(ctx)
        let col = {color: '#336600'}
        // this.points.pen.indicator(ctx, {color: '#336600'})
        let mouse = this.mouse.position
        this.points.forEach((p)=>{
            let d = p.distanceTo(mouse) * .2
            let td = d
            p.radius = 150 - (clamp(td, -90, 90))
        })
        let lineStroke = this.lineStroke
        lineStroke.set(ctx)

        this.lines.forEach((l)=>{
            l.render(ctx, {color: '#44CC55'});
        });

        lineStroke.unset(ctx)

    }
}

;stage = MainStage.go();