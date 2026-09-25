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
        // this.curve[0].color = '#333'
        this.curve.each.color = '#444'
        this.linearDrag = true
        this.equalDistance = false
        this.scaleDistance = false

        this.curve.forEach(p => {
            let pair = p.split(2, 0, Math.PI * .5)
            pair[0].recordedDistance = pair[0].distance2D(p)
            pair[0].relRads = degToRad(calculateAngle360(p, pair[0]))
            pair[1].recordedDistance = pair[1].distance2D(p)
            pair[1].relRads = degToRad(calculateAngle360(p, pair[1]))
            this.handles.push(pair)
            this.dragging.add(...pair)
        })

        this.dragging.add(...this.curve)
    }

    computeHandles(index, owner) {
        let handles = this.handles[index]
        handles.forEach(handle => {
            let radians = owner.radians + handle.relRads
            let distance = handle.recordedDistance.distance
            handle.x = owner.x + Math.cos(radians) * distance
            handle.y = owner.y + Math.sin(radians) * distance
        })
    }

    constrainHandle(owner, handle) {
        let radians = owner.radians + handle.relRads
        let directionX = Math.cos(radians)
        let directionY = Math.sin(radians)
        let offsetX = handle.x - owner.x
        let offsetY = handle.y - owner.y
        let distance = offsetX * directionX + offsetY * directionY

        handle.x = owner.x + directionX * distance
        handle.y = owner.y + directionY * distance
        return distance
    }

    mirrorHandle(owner, handle, distance, scaleDistance=false) {
        let antipose = handle === owner.pair[0] ? owner.pair[1] : owner.pair[0]
        let radians = owner.radians + handle.relRads
        let antiposeDistance = distance
        if (scaleDistance) {
            let originalDistance = handle.recordedDistance.distance
            let ratio = originalDistance == 0 ? 0 : Math.abs(distance) / originalDistance
            antiposeDistance = antipose.recordedDistance.distance * ratio
        }
        antipose.x = owner.x - Math.cos(radians) * antiposeDistance
        antipose.y = owner.y - Math.sin(radians) * antiposeDistance
        antipose.recordedDistance = antipose.distance2D(owner)
        antipose.relRads = degToRad(calculateAngle360(owner, antipose))
        antipose.dirty = false
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

        let linearDrag = this.linearDrag
        let equalDistance = this.equalDistance
        let scaleDistance = this.scaleDistance
        /* Iterate all handle pairs, if a handle within the pair is dirty, re-cache its
        position. */
        this.handles.forEach((pair, i) => {
            let p = this.curve[i]
            p.pair = pair
            let dragged = this.dragging.isDragging ? this.dragging.getPoint() : undefined
            let pairDrag = pair.includes(dragged)
            pair.forEach(handle => {
                if (handle.wasDirty && (!pairDrag || handle === dragged)) {
                    let distance
                    if (linearDrag) {
                        distance = this.constrainHandle(p, handle)
                    } else {
                        distance = handle.distance2D(p).distance
                        handle.relRads = degToRad(calculateAngle360(p, handle))
                    }
                    if (equalDistance || scaleDistance) {
                        this.mirrorHandle(p, handle, distance, scaleDistance && !equalDistance)
                    }
                    handle.recordedDistance = handle.distance2D(p)
                    handle.relRads = degToRad(calculateAngle360(p, handle))
                }
            })
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
        ctx.strokeStyle = 'purple'
        ctx.stroke()

    }
}


;stage = MainStage.go();
