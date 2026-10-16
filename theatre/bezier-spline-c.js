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


function getSplineCache(pointList) {
    let cached = pointList._splineCache
    if (cached && cached.sources.length == pointList.length
            && cached.sources.every((p, i) => p === pointList[i])) {
        return cached
    }

    let points = pointList.length
        ? [{ x: pointList[0].x, y: pointList[0].y, distance: 0 }]
        : []
    let segments = []
    let distance = 0
    const samples = 100

    for (let index = 0; index < pointList.length - 1; index++) {
        let p = pointList[index]
        let n = pointList[index + 1]
        let start = distance
        let startIndex = points.length - 1
        let previous = p

        for (let i = 1; i <= samples; i++) {
            let sample = get_bezier_point(p, p.handles[0], n.handles[1], n, i / samples)
            distance += Math.hypot(sample.x - previous.x, sample.y - previous.y)
            points.push({ ...sample, distance })
            previous = sample
        }

        segments.push({
            start, length: distance - start, startIndex, endIndex: points.length - 1
        })
    }

    pointList._splineCache = {
        sources: Array.from(pointList), points, segments, length: distance
    }
    return pointList._splineCache
}

function splineIndexAtDistance(cache, distance, uniform) {
    if (!cache.segments.length) return 0

    let segment = cache.segments.find(s => distance <= s.start + s.length)
        || cache.segments[cache.segments.length - 1]
    let localDistance = Math.max(0, Math.min(segment.length, distance - segment.start))

    if (!uniform || segment.length == 0) {
        return segment.startIndex
            + (segment.endIndex - segment.startIndex)
                * localDistance / (segment.length || 1)
    }

    let i = segment.startIndex + 1
    while (i < segment.endIndex && cache.points[i].distance < distance) i++
    let before = cache.points[i - 1].distance
    let after = cache.points[i].distance
    return i - 1 + (distance - before) / (after - before || 1)
}

function drawSplineCache(ctx, cache, from, to) {
    ctx.beginPath()
    if (!cache.points.length) return

    let at = index => {
        let i = Math.floor(index)
        let a = cache.points[i]
        let b = cache.points[Math.min(i + 1, cache.points.length - 1)]
        let t = index - i
        return {
            x: a.x + (b.x - a.x) * t,
            y: a.y + (b.y - a.y) * t
        }
    }

    let first = at(from)
    ctx.moveTo(first.x, first.y)
    if (from < to) {
        for (let i = Math.floor(from) + 1; i < to; i++) {
            ctx.lineTo(cache.points[i].x, cache.points[i].y)
        }
    } else {
        for (let i = Math.ceil(from) - 1; i > to; i--) {
            ctx.lineTo(cache.points[i].x, cache.points[i].y)
        }
    }
    let last = at(to)
    ctx.lineTo(last.x, last.y)
}

function startSplineAnimation(pointList, options, { reverse = false, erase = false } = {}) {
    let { rate = 1, uniform = false } = options
    if (!Number.isFinite(rate) || rate <= 0) {
        throw new RangeError('rate must be a positive number')
    }

    getSplineCache(pointList)
    pointList._splineAnimation = { rate, uniform, reverse, erase, startedAt: performance.now() }
}

function inkSplines(pointList, options = {}) {
    startSplineAnimation(pointList, options)
}

function unInkSplines(pointList, options = {}) {
    startSplineAnimation(pointList, options, { erase: true })
}

function inkSplineReverse(pointList, options = {}) {
    startSplineAnimation(pointList, options, { reverse: true })
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
        let animation = this._splineAnimation
        if (animation) {
            let cache = getSplineCache(this)
            let distance = Math.min(
                cache.length,
                (performance.now() - animation.startedAt) * animation.rate / 1000
            )
            let from = animation.reverse ? cache.points.length - 1 : 0
            let to = splineIndexAtDistance(
                cache,
                animation.reverse || animation.erase ? cache.length - distance : distance,
                animation.uniform
            )
            drawSplineCache(
                ctx, cache,
                from, to
            )
        } else {
            ctx.beginPath()
            if (this.length) {
                ctx.moveTo(this[0].x, this[0].y)
                for (let i = 0; i < this.length - 1; i++) {
                    let p = this[i]
                    let n = this[i + 1]
                    ctx.bezierCurveTo(
                        p.handles[0].x, p.handles[0].y,
                        n.handles[1].x, n.handles[1].y,
                        n.x, n.y
                    )
                }
            }
        }

        ctx.strokeStyle = conf.color || 'purple'
        ctx.lineWidth = 3
        ctx.stroke()
    }

    checkUpdates(options) {
        let mirror = this.mirrorHandles
        let changed = false
        if (options.altMode !== undefined) {
            mirror = !options.altMode
        }
        this.forEach((p, i) => {

            if (p.wasDirty) {
                changed = true
                this.computeHandles(i, p)
            }

            p.handles.forEach(h => {
                if (h.wasDirty) {
                    changed = true
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
        if (changed) this._splineCache = undefined
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
