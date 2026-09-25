/*
---
title: Bezier
files:
    ../point_src/math.js
    head
    point
    pointlist
    dragging
    mouse
    stage
    dragging
    stroke
    ../point_src/split.js
    ../point_src/curve-extras.js

In this example the dirty flag is used for curve tips.
*/
class MainStage extends Stage {
    canvas='playspace'
    mounted(){
        this.curve = new PointList(
                new Point(100, 150, 60, -30)
                , new Point(200, 340, 60, -30)
                , new Point(450, 340, 60, -90)
                , new Point(650, 340, 60, -90)
            )

        this.handles = []
        this.curve[0].color = 'red'
        this.curve.last().color = 'pink'

        this.curve.forEach(p => {
            let pair = p.split(2, 0, Math.PI * .5)
            pair[0].recordedDistance = pair[0].distance2D(p)
            pair[0].relRads = degToRad(calculateAngle360(p, pair[0]))
            pair[1].recordedDistance = pair[1].distance2D(p)
            this.handles.push(pair)
            this.dragging.add(...pair)
        })

        this.dragging.add(...this.curve)
    }

    computeHandles(index, owner) {
        console.log('compute')
        // this.handles[index] = handle.split(2, 0, Math.PI * .5)
        let handles = this.handles[index]
        handles.forEach((handle, i) => {

        })
    }


    relPolarXY(primaryPoint, controlPoint, distance, spinRads) {
        /*
        get xy of the control point, relative to the {X,Y, Rot} of point A,
        using distance and relative angle.
         */
        // const primaryPoint = { x: 10, y: 10, radians: 1 };
        if(distance == undefined){
            distance = primaryPoint.distance2D(controlPoint)
        }
        const relative = { distance, spinRads };

        const totalRads = primaryPoint.radians + relative.spinRads;
        const dx = distance.x
              , dy = distance.y;

        const xRot = dx * Math.cos(totalRads) - dy * Math.sin(totalRads);
        const yRot = dx * Math.sin(totalRads) + dy * Math.cos(totalRads);

        return [primaryPoint.x + xRot, primaryPoint.y + yRot]
    }

    draw(ctx){
        this.clear(ctx)
        this.curve.pen.indicator(ctx, { width: 1 })
        /* Iterate each point. If there is a change, recompute the handles*/
        this.curve.forEach((p, i) => {
            if (p.wasDirty) {
                this.computeHandles(i, p)
            }
        })
        /* Iterate all handle pairs, if a handle within the pair is dirty, re-cache its
        position. */
        this.handles.forEach((pair, i) => {
            let p = this.curve[i]
            p.pair = pair
            pair.forEach(handle => {
                if (handle.wasDirty) {
                    handle.recordedDistance = handle.distance2D(p)
                }
            });
            pair.pen.indicator(ctx, { color: p.color, width: 1 })
        })


        let a = this.curve[0]
        let b = this.curve[1]
        let c = this.curve[2]
        let d = this.curve[3]

        ctx.moveTo(a.x, a.y)
        let closeLoop = 0

        this.curve.forEach((p, i) => {
            let n = this.curve[i + 1]
            if (n == undefined) {
                if (closeLoop) {
                    n = this.curve[0]
                } else {

                    return
                }
            }
            ctx.bezierCurveTo(
                p.pair[0].x, p.pair[0].y,
                n.pair[1].x, n.pair[1].y,
                n.x, n.y
            )
        })

        // ctx.bezierCurveTo(
        //     a.pair[0].x, a.pair[0].y,
        //     b.pair[1].x, b.pair[1].y,
        //     b.x, b.y
        // )

        // ctx.bezierCurveTo(
        //     b.pair[0].x, b.pair[0].y,
        //     c.pair[1].x, c.pair[1].y,
        //     c.x, c.y
        // )

        // ctx.bezierCurveTo(
        //     c.pair[0].x, c.pair[0].y,
        //     d.pair[1].x, d.pair[1].y,
        //     d.x, d.y
        // )

        ctx.stroke()

    }
}


;stage = MainStage.go();
