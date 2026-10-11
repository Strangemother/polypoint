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
    ../point_src/keyboard.js
    ../point_src/split.js
    ../point_src/curve-extras.js
    ../point_src/pointlock.js
    ../point_src/widgets.js
    ../point_src/random.js

In this example the dirty flag is used for curve tips.
*/

class BezierPoint extends Point {

    get handles() {
        if(this._handles) { return this._handles }
        /* Install the point, ensuring it has handles. */
        let handles = this.createHandles(this)
        this._handles = handles
        return handles
    }

    createHandles(p) {
        let pair = p.split(2, 0, Math.PI * .5)
        pair[0].recordedDistance = pair[0].distance2D(p)
        pair[0].relRads = degToRad(calculateAngle360(p, pair[0]))
        pair[1].recordedDistance = pair[1].distance2D(p)
        pair[1].relRads = degToRad(calculateAngle360(p, pair[1]))
        pair[0]._other = pair[1]
        pair[1]._other = pair[0]
        return pair;
    }
}


function inkSplines(pointList, { rate = 1, uniform = false } = {}) {
    if (!Number.isFinite(rate) || rate <= 0) {
        throw new RangeError('rate must be a positive number')
    }

    // Rate is measured in canvas units per second.
    pointList._inkStartedAt = performance.now()
    pointList._inkRate = rate
    pointList._inkUniform = uniform

    let distance = 0
    pointList._inkSegments = []
    pointList.forEach((p, index) => {
        let next = pointList[index + 1]
        if (!next) return

        let lengths = get_bezier_arc_lengths(
            p, p.handles[0], next.handles[1], next, 100
        )
        let length = lengths[lengths.length - 1]
        pointList._inkSegments.push({
            index, length, start: distance, lengths: uniform ? lengths : undefined
        })
        distance += length
    })
    pointList._inkLength = distance
}

class BezierSpline extends PointList {
    /* A _spline_ is many line segments presented as a single
    continuious line.
    In this example the Spline has special properties.

    Each point has a handles - applied when the point is pushed.

    perform `push` then `update` for an append. Else 'add'

    */
    showHandles = true
    showPoints = true
    // showMinimal = true

    mirrorHandles = true

    add(point) {
        this.push(new BezierPoint(point))
    }

    render(ctx, extras = {}) {
        this.checkUpdates(extras)

        let showHandles = (extras.showHandles == undefined) ? this.showHandles: extras.showHandles
        let showPoints = (extras.showPoints == undefined) ? this.showPoints: extras.showPoints


        if (showHandles) {
            this.renderHandlebars(ctx)
            this.renderHandles(ctx)
        }

        this.renderCurve(ctx, extras)

        if (showPoints) {
            this.pen.fill(ctx, '#4499DD', 5)
            // this.pen.indicator(ctx)
        }

    }

    renderHandles(ctx) {
        this.forEach((p, i, a) => {
            let hConf = { radius: 4, width: 1 };
            if (i == 0) {
                p.handles[0].pen.fill(ctx, '#444', 4)
            } else if (i == a.length - 1) {
                p.handles[1].pen.fill(ctx, '#444', 4)
            } else {
                p.handles.pen.fill(ctx, '#444', 4)
            }
        })
    }

    renderHandlebars(ctx) {
        let color = '#666'
        this.forEach((p, i, a) => {
            if (i == 0) {
                p.handles[0].pen.line(ctx, p, color)
            } else if (i == a.length - 1) {
                p.handles[1].pen.line(ctx, p, color)
            } else {
                p.handles[0].pen.line(ctx, p, color)
                p.handles[1].pen.line(ctx, p, color)
                // p.handles.pen.line(ctx, p, {width: 1, color: 'green'})
            }
        })
    }

    renderCurve(ctx, conf={}) {
        ctx.beginPath()
        let a = this[0]
        ctx.moveTo(a.x, a.y)
        let closeLoop = 0
        let progress = this._inkStartedAt === undefined
            ? this.length
            : (performance.now() - this._inkStartedAt) * this._inkRate / 1000

        if (this._inkStartedAt !== undefined && this._inkLength > 0) {
            let target = Math.min(this._inkLength, progress)
            let segment = this._inkSegments.find(s => target <= s.start + s.length)

            if (segment) {
                let distance = target - segment.start
                if (this._inkUniform) {
                    let sample = 1
                    while (sample < segment.lengths.length - 1
                            && segment.lengths[sample] < distance) {
                        sample++
                    }
                    let before = segment.lengths[sample - 1]
                    let after = segment.lengths[sample]
                    let fraction = (distance - before) / (after - before || 1)
                    progress = segment.index
                        + (sample - 1 + fraction) / (segment.lengths.length - 1)
                } else {
                    progress = segment.index + distance / (segment.length || 1)
                }
            } else {
                progress = this.length
            }
        }

        this.forEach((p, i) => {
            let n = this[i + 1]
            if (n == undefined) {
                if (closeLoop) {
                    n = this[0]
                } else {
                    return
                }
            }

            let t = Math.min(1, progress - i)
            if (t <= 0) return

            if (t == 1) {
                ctx.bezierCurveTo(
                    p.handles[0].x, p.handles[0].y,
                    n.handles[1].x, n.handles[1].y,
                    n.x, n.y
                )
                return
            }

            let lerp = (a, b) => ({
                x: a.x + (b.x - a.x) * t,
                y: a.y + (b.y - a.y) * t
            })
            let q0 = lerp(p, p.handles[0])
            let q1 = lerp(p.handles[0], n.handles[1])
            let q2 = lerp(n.handles[1], n)
            let r0 = lerp(q0, q1)
            let r1 = lerp(q1, q2)
            let end = lerp(r0, r1)
            ctx.bezierCurveTo(q0.x, q0.y, r0.x, r0.y, end.x, end.y)
        })

        ctx.strokeStyle = conf.color || 'purple'
        ctx.lineWidth = 3
        ctx.stroke()
    }

    checkUpdates(options) {
        let mirror = this.mirrorHandles
        if (options.altMode !== undefined) {
            mirror = !options.altMode
        }
        this.forEach((p, i) => {

            if (p.wasDirty) {
                this.computeHandles(i, p)
            }

            p.handles.forEach(h => {
                if (h.wasDirty) {
                    // store
                    let other = h._other
                    // this.constrainHandle(p, other)
                    h.recordedDistance = h.distance2D(p)
                    h.relRads = degToRad(calculateAngle360(p, h))
                    if (mirror) {
                        this.mirrorHandle(p, h, h.recordedDistance.distance)
                    }
                }
            })
        })
    }

    mirrorHandle(owner, handle, distance, scaleDistance=false) {
        let antipose = handle._other
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

    computeHandles(index, point) {
        let handles = point.handles
        handles.forEach(handle => {
            let radians = point.radians + (handle?.relRads || 0)
            let distance = handle?.recordedDistance?.distance || point.radius //
            handle.x = point.x + Math.cos(radians) * distance
            handle.y = point.y + Math.sin(radians) * distance
        })
    }
}


addButton('button', {
    label: "new spline"
    , onclick(){
        stage.generateCurve()
    }
})


class MainStage extends Stage {
    canvas='playspace'
    mounted() {
        this.myKeys = {}
        this.keyboard.wake()
        this.splines = []
    }

    generateCurve() {
        this.splines.push({
            color: random.color([0, 360], [30, 90], [60,80])
            , spline: this.createCurve()
        })
    }

    createCurve() {
        let spline = new BezierSpline(
                [100, 150, 60, -30]
                , [200, 340, 30, -30]
                , [450, 340, 30, -90]
                , [650, 340, 30, -90]
                , [650, 440, 30, 40]
            ).cast(BezierPoint)

        inkSplines(spline, { rate: 600, uniform: true })

        this.dragging.add(...spline)

        spline.forEach((p) => {
            this.dragging.add(...p.handles)
        })

        return spline
    }

    onKeydown(ev) {
        // console.log('onKeydown', ev)
        this.myKeys[ev.key] = 1
    }
    onKeyup(ev) {
        // console.log('onKeyup', ev)
        this.myKeys[ev.key] = 0
    }

    draw(ctx){
        this.clear(ctx)

        let altButton = this?.myKeys['Control'] == 1
        this.splines.forEach((sConf) => {
            let s = sConf.spline;
            s.render(ctx, {
                altMode: altButton
                , color: sConf.color
                , showHandles: sConf.showHandles
                , showPoints: sConf.showPoints
            })
        })
    }
}


;stage = MainStage.go();
