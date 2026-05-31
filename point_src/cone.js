/*
Project and render a point-owned cone shape.

    Object.assign(point.cone.settings, {
        distance: 200,
        container: stage.dimensions
    })

    let cone = point.cone.renderData()
    point.cone.fill(ctx, cone)
    point.cone.renderOutline(ctx, cone)

Reusable settings helpers in this file can also be used directly when the
class wrapper is not needed.
*/


const CONE_DEFAULT_SETTINGS = {
    distance: undefined
    , viewportLimit: false
    , innerOffset: 0
    , inner: false
    , curve: 0
    , invertCurve: false
    , innerCurve: 0
    , outline: false
    // , fillColor: 'rebeccapurple'
    // , color: 'rebeccapurple'
    , outlineColor: 'purple'
    , outlineWidth: 2
}


const CONE_OUTLINE_MODES = {
    true: {
        enabled: true
        , leading: true
        , trailing: true
        , inner: true
        , outer: true
    }
    , edge: {
        enabled: true
        , leading: true
        , trailing: true
        , inner: false
        , outer: false
    }
    , outer: {
        enabled: true
        , leading: true
        , trailing: true
        , inner: false
        , outer: true
    }
}


function resolveConeSettings(point, baseSettings={}, settings={}) {
    if(typeof settings === 'number') {
        settings = { distance: settings }
    }

    let conf = Object.assign({}, baseSettings, settings)

    let coneDeg = Number(conf.coneDeg)
    if(Number.isNaN(coneDeg)) {
        coneDeg = Number(conf.cone)
    }

    conf.coneDeg = Number.isNaN(coneDeg)? point.coneDeg: coneDeg
    conf.cone = conf.coneDeg

    let rotation = Number(conf.rotation)
    conf.rotation = Number.isNaN(rotation)? point.rotation: rotation

    return conf
}


function getConeOutlineSettings(settings={}) {
    let outline = settings.outline
    let defaults = {
        enabled: false
        , leading: false
        , trailing: false
        , inner: false
        , outer: false
        , color: settings.outlineColor
        , width: settings.outlineWidth
    }

    if(outline && typeof outline === 'object') {
        let result = Object.assign({}, defaults, outline)
        if(outline.enabled == undefined) {
            result.enabled = Boolean(result.leading || result.trailing || result.inner || result.outer)
        }
        return result
    }

    let selected = CONE_OUTLINE_MODES[outline] || {}
    return Object.assign({}, defaults, selected)
}


function normalizeConeCurveValue(value, invert=false) {
    let curve = Number(value)
    curve = Number.isNaN(curve)? 0: curve
    return curve * (invert? -1: 1)
}


function withinCone(point, cone) {
    if(point == undefined || cone == undefined) {
        return false
    }

    let coneTool = cone.hitPolygon != undefined
        ? cone
        : cone.cone 

    if(coneTool == undefined || coneTool.hitPolygon == undefined) {
        return false
    }

    let polygon = coneTool.hitPolygon()
    if(polygon == undefined || polygon.length < 3) {
        return false
    }

    const x = point.x
        , y = point.y;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x
            , yi = polygon[i].y;
        const xj = polygon[j].x
            , yj = polygon[j].y;

        const intersect = (
                    (yi > y) !== (yj > y)
                ) && (
                    x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
                );

        if (intersect) inside = !inside;
    }

    return inside;
}


class PointCone {

    constructor(point, settings={}) {
        this.parent = point
        this.settings = Object.assign({}, CONE_DEFAULT_SETTINGS, settings)
    }

    update(settings) {
        /* Apply changes for the persistent info*/
        
        return Object.assign(this.settings, settings)
    }

    resolveSettings(settings={}) {
        return resolveConeSettings(this.parent, this.settings, settings)
    }

    renderData(settings={}) {
        if(this.isRenderData(settings)) {
            return settings
        }

        let conf = this.resolveSettings(settings)
        let points = this.points(conf)
        let hasInnerEdge = this.getInnerOffset(conf) !== 0

        return {
            originPoint: this.parent
            , settings: conf
            , points
            , startAnchor: points[0]
            , endAnchor: hasInnerEdge? points.last(): points[0]
            , edgePoints: hasInnerEdge? points.slice(1, -1): points.slice(1)
            , hasInnerEdge
            , hasOuterEdge: conf.distance != undefined
            , curves: this.getCurveSettings(conf)
        }
    }

    points(settings={}) {
        if(this.isRenderData(settings)) {
            return settings.points
        }

        let point = this.parent
        let conf = this.resolveSettings(settings)
        let startAngle = conf.rotation - conf.coneDeg
        let endAngle = conf.rotation + conf.coneDeg
        let innerOffset = this.getInnerOffset(conf)
        let innerDistance = point.radius * innerOffset
        let origin = point.copy().update({radius: undefined})
        let innerStart = this.projectDistance(point, startAngle, innerDistance)
        let innerEnd = this.projectDistance(point, endAngle, innerDistance)
        let start = this.getEdgePoint(startAngle, conf)
        let end = this.getEdgePoint(endAngle, conf)
        let corners = this.getConeCorners(startAngle, endAngle, conf)
        let points = [innerOffset !== 0? innerStart: origin]

        this.pushUniquePoint(points, start)
        points.push(...corners)
        this.pushUniquePoint(points, end)

        if(innerOffset !== 0 && this.samePoint(points[points.length - 1], innerEnd) === false) {
            points.push(innerEnd)
        }

        return new PointList(...points).cast()
    }

    hitPolygon(settings={}) {
        let data = this.ensureRenderData(settings)
        let start = data.edgePoints[0]
        let end = data.edgePoints.last()
        let polygon = []

        if(start == undefined || end == undefined) {
            return new PointList().cast()
        }

        this.pushUniquePoint(polygon, data.startAnchor)
        this.pushUniquePoint(polygon, start)
        this.appendHitOuterPoints(polygon, data)

        if(this.samePoint(data.endAnchor, end) === false) {
            this.pushUniquePoint(polygon, data.endAnchor)
        }

        if(data.hasInnerEdge && data.curves.inner !== 0) {
            this.appendHitInnerPoints(polygon, data)
        }

        if(this.samePoint(polygon[0], polygon[polygon.length - 1])) {
            polygon.pop()
        }

        return new PointList(...polygon).cast()
    }

    fill(ctx, settings={}) {
        let data = this.tracePath(ctx, settings)
        if(data == false) { return false }

        let before = ctx.fillStyle
        ctx.fillStyle = (data.settings.fillColor || data.settings.color)
        ctx.fill()
        ctx.fillStyle = before
        
        return data
    }

    renderOutline(ctx, settings={}) {
        let data = this.ensureRenderData(settings)
        let outline = this.getOutlineSettings(data.settings)
        if(outline.enabled === false) {
            return false
        }

        if(this.traceOutline(ctx, data, outline) === false) {
            return false
        }

        let strokeStyle = ctx.strokeStyle
        let lineWidth = ctx.lineWidth

        if(outline.color != undefined) {
            ctx.strokeStyle = outline.color
        }

        if(outline.width != undefined) {
            ctx.lineWidth = outline.width
        }

        ctx.stroke()
        ctx.strokeStyle = strokeStyle
        ctx.lineWidth = lineWidth
        return data
    }

    tracePath(ctx, settings={}) {
        let data = this.ensureRenderData(settings)
        let start = data.edgePoints[0]
        let end = data.edgePoints.last()

        if(start == undefined || end == undefined) {
            return false
        }

        ctx.beginPath()
        ctx.moveTo(data.startAnchor.x, data.startAnchor.y)
        ctx.lineTo(start.x, start.y)

        this.drawEdgePath(ctx, data, data.curves.outer)

        if(this.samePoint(data.endAnchor, end) === false) {
            ctx.lineTo(data.endAnchor.x, data.endAnchor.y)
        }

        if(data.hasInnerEdge && data.curves.inner !== 0) {
            this.drawInnerCurve(ctx, data.originPoint, data.settings, data.endAnchor, data.startAnchor, data.curves.inner)
        }

        ctx.closePath()
        return data
    }

    traceOutline(ctx, settings={}, outline=undefined) {
        let data = this.ensureRenderData(settings)
        outline = outline || this.getOutlineSettings(data.settings)

        let start = data.edgePoints[0]
        let end = data.edgePoints.last()

        if(start == undefined || end == undefined) {
            return false
        }

        ctx.beginPath()

        if(outline.leading) {
            ctx.moveTo(data.startAnchor.x, data.startAnchor.y)
            ctx.lineTo(start.x, start.y)
        }

        if(outline.outer && data.hasOuterEdge) {
            ctx.moveTo(start.x, start.y)
            this.drawEdgePath(ctx, data, data.curves.outer)
        }

        if(outline.trailing && this.samePoint(data.endAnchor, end) === false) {
            ctx.moveTo(end.x, end.y)
            ctx.lineTo(data.endAnchor.x, data.endAnchor.y)
        }

        if(outline.inner && data.hasInnerEdge) {
            ctx.moveTo(data.endAnchor.x, data.endAnchor.y)

            if(data.curves.inner !== 0) {
                this.drawInnerCurve(ctx, data.originPoint, data.settings, data.endAnchor, data.startAnchor, data.curves.inner)
            } else {
                ctx.lineTo(data.startAnchor.x, data.startAnchor.y)
            }
        }

        return data
    }

    drawEdgePath(ctx, data, curveValue) {
        let start = data.edgePoints[0]
        let end = data.edgePoints.last()

        if(data.edgePoints.length < 2 || curveValue === 0) {
            return this.drawStraightEdge(ctx, data.edgePoints)
        }

        if(data.edgePoints.length === 2 && curveValue === 1 && this.hasEqualRadius(data.originPoint, start, end)) {
            return this.drawConeArc(ctx, data.originPoint, start, end)
        }

        if(data.edgePoints.length === 2) {
            let control = this.getConeCurveControl(data.originPoint, data.settings, start, end, curveValue)
            return ctx.quadraticCurveTo(control.x, control.y, end.x, end.y)
        }

        return this.drawQuadraticPath(ctx, data.edgePoints)
    }

    drawQuadraticPath(ctx, points) {
        let start = points[0]
        if(start == undefined) {
            return false
        }

        if(points.length === 1) {
            ctx.lineTo(start.x, start.y)
            return true
        }

        ctx.lineTo(start.x, start.y)

        for(let i = 1; i < points.length - 1; i++) {
            let current = points[i]
            let next = points[i + 1]
            let midpoint = current.midpoint(next)
            ctx.quadraticCurveTo(current.x, current.y, midpoint.x, midpoint.y)
        }

        let secondLast = points[points.length - 2]
        let end = points.last()
        ctx.quadraticCurveTo(secondLast.x, secondLast.y, end.x, end.y)
        return true
    }

    drawStraightEdge(ctx, points) {
        for(let point of points) {
            if(point == undefined) {
                continue
            }

            ctx.lineTo(point.x, point.y)
        }

        return true
    }

    appendHitOuterPoints(polygon, data) {
        let edgePoints = data.edgePoints
        let start = edgePoints[0]
        let end = edgePoints.last()
        let curveValue = data.curves.outer

        if(edgePoints.length < 2 || curveValue === 0) {
            for(let i = 1; i < edgePoints.length; i++) {
                this.pushUniquePoint(polygon, edgePoints[i])
            }
            return true
        }

        if(edgePoints.length === 2 && curveValue === 1 && this.hasEqualRadius(data.originPoint, start, end)) {
            return this.appendArcSamplePoints(polygon, data.originPoint, start, end)
        }

        if(edgePoints.length === 2) {
            let control = this.getConeCurveControl(data.originPoint, data.settings, start, end, curveValue)
            return this.appendQuadraticSamplePoints(polygon, start, control, end)
        }

        return this.appendQuadraticPathPoints(polygon, edgePoints)
    }

    appendHitInnerPoints(polygon, data) {
        let start = data.endAnchor
        let end = data.startAnchor
        let curveValue = data.curves.inner

        if(curveValue === 1 && this.hasEqualRadius(data.originPoint, start, end)) {
            return this.appendArcSamplePoints(polygon, data.originPoint, start, end, true)
        }

        let control = this.getConeCurveControl(data.originPoint, data.settings, start, end, curveValue)
        return this.appendQuadraticSamplePoints(polygon, start, control, end)
    }

    appendQuadraticPathPoints(polygon, pathPoints) {
        let start = pathPoints[0]
        if(start == undefined) {
            return false
        }

        if(pathPoints.length < 2) {
            return true
        }

        let segmentStart = start

        for(let i = 1; i < pathPoints.length - 1; i++) {
            let control = pathPoints[i]
            let next = pathPoints[i + 1]
            let midpoint = control.midpoint(next)
            this.appendQuadraticSamplePoints(polygon, segmentStart, control, midpoint)
            segmentStart = midpoint
        }

        let secondLast = pathPoints[pathPoints.length - 2]
        let end = pathPoints.last()
        return this.appendQuadraticSamplePoints(polygon, segmentStart, secondLast, end)
    }

    appendQuadraticSamplePoints(polygon, start, control, end, sampleCount=undefined) {
        let approxLength = start.distanceTo(control) + control.distanceTo(end)
        sampleCount = sampleCount || Math.max(8, Math.ceil(approxLength / 18))

        for(let i = 1; i <= sampleCount; i++) {
            let t = i / sampleCount
            let invT = 1 - t
            let x = (invT * invT * start.x)
                + (2 * invT * t * control.x)
                + (t * t * end.x)
            let y = (invT * invT * start.y)
                + (2 * invT * t * control.y)
                + (t * t * end.y)

            this.pushUniquePoint(polygon, new Point({x, y}))
        }

        return true
    }

    appendArcSamplePoints(polygon, originPoint, start, end, anticlockwise=false, sampleCount=undefined) {
        let startAngle = Math.atan2(start.y - originPoint.y, start.x - originPoint.x)
        let endAngle = Math.atan2(end.y - originPoint.y, end.x - originPoint.x)
        let sweep = endAngle - startAngle

        if(anticlockwise) {
            if(sweep >= 0) {
                sweep -= Math.PI * 2
            }
        } else if(sweep <= 0) {
            sweep += Math.PI * 2
        }

        let radius = originPoint.distanceTo(start)
        let approxLength = Math.abs(sweep) * radius
        sampleCount = sampleCount || Math.max(8, Math.ceil(approxLength / 18))

        for(let i = 1; i <= sampleCount; i++) {
            let angle = startAngle + (sweep * (i / sampleCount))
            let x = originPoint.x + (Math.cos(angle) * radius)
            let y = originPoint.y + (Math.sin(angle) * radius)
            this.pushUniquePoint(polygon, new Point({x, y}))
        }

        return true
    }

    getConeCurveControl(originPoint, settings, start, end, curveValue) {
        let radius = Math.max(originPoint.distanceTo(start), originPoint.distanceTo(end))
        let midpoint = start.midpoint(end)
        let midpointDistance = originPoint.distanceTo(midpoint)
        /* A full positive curve follows the matching circular arc passing
        through the edge points, then interpolates beyond that centerline. */
        let halfAngle = Math.abs(degToRad(settings.cone || 0))
        let circleDistance = radius / Math.max(.0001, Math.cos(halfAngle))
        /* Negative curves mirror that bulge through the edge midpoint so the
        same signed range can bend the cone inward. */
        let inverseDistance = Math.max(0, (midpointDistance * 2) - circleDistance)
        let targetDistance = curveValue > 0? circleDistance: inverseDistance
        let amount = Math.abs(curveValue)
        let distance = midpointDistance + ((targetDistance - midpointDistance) * amount)

        return this.projectDistance(originPoint, settings.rotation, distance)
    }

    drawInnerCurve(ctx, originPoint, settings, start, end, curveValue) {
        if(curveValue === 1 && this.hasEqualRadius(originPoint, start, end)) {
            return this.drawConeArc(ctx, originPoint, start, end, true)
        }

        let control = this.getConeCurveControl(originPoint, settings, start, end, curveValue)
        ctx.quadraticCurveTo(control.x, control.y, end.x, end.y)
        return true
    }

    drawConeArc(ctx, originPoint, start, end, anticlockwise=false) {
        let startAngle = Math.atan2(start.y - originPoint.y, start.x - originPoint.x)
        let endAngle = Math.atan2(end.y - originPoint.y, end.x - originPoint.x)
        let radius = originPoint.distanceTo(start)
        ctx.arc(originPoint.x, originPoint.y, radius, startAngle, endAngle, anticlockwise)
        return true
    }

    getEdgePoint(angle, settings={}) {
        let point = this.parent
        let conf = this.resolveSettings(settings)

        if(conf.inner === true) {
            let innerSettings = Object.assign({}, conf, { distance: point.radius })
            return this.getWallIntersection(angle, innerSettings)
        }

        return this.getWallIntersection(angle, conf)
    }

    getConeCorners(startAngle, endAngle, settings={}) {
        let conf = this.resolveSettings(settings)

        if(conf.distance != undefined || conf.inner === true) {
            return []
        }

        let point = this.parent
        let { width, height } = this.getContainer(conf)
        let sweep = endAngle - startAngle
        let corners = [
            new Point({x: 0, y: 0})
            , new Point({x: width, y: 0})
            , new Point({x: width, y: height})
            , new Point({x: 0, y: height})
        ]

        return corners
            .filter((corner) => {
                let angle = this.angleTo(point, corner)
                let offset = this.wrapAngle(angle - startAngle)
                return offset > 0 && offset < sweep
            })
            .sort((a, b) => {
                let aAngle = this.wrapAngle(this.angleTo(point, a) - startAngle)
                let bAngle = this.wrapAngle(this.angleTo(point, b) - startAngle)
                return aAngle - bAngle
            })
    }

    getWallIntersection(angle, settings={}) {
        let point = this.parent
        let conf = this.resolveSettings(settings)

        if(conf.distance != undefined && conf.viewportLimit !== true) {
            return this.projectDistance(point, angle, conf.distance)
        }

        let { width, height } = this.getContainer(conf)
        let radians = degToRad(angle)
        let dx = Math.cos(radians)
        let dy = Math.sin(radians)
        let hits = []

        if(dx > 0) {
            hits.push(this.hitAtX(point, width, dx, dy, conf))
        }

        if(dx < 0) {
            hits.push(this.hitAtX(point, 0, dx, dy, conf))
        }

        if(dy > 0) {
            hits.push(this.hitAtY(point, height, dx, dy, conf))
        }

        if(dy < 0) {
            hits.push(this.hitAtY(point, 0, dx, dy, conf))
        }

        let hit = hits
            .filter(Boolean)
            .sort((a, b) => a.distance - b.distance)[0]

        if(conf.distance == undefined) {
            return hit
        }

        if(hit == undefined || conf.distance < hit.distance) {
            return this.projectDistance(point, angle, conf.distance)
        }

        return hit
    }

    projectDistance(point, angle, distance) {
        let projected = point.project(distance, angle, false)
        projected.distance = distance
        return projected
    }

    hitAtX(point, wallX, dx, dy, settings={}) {
        let distance = (wallX - point.x) / dx
        let y = point.y + (dy * distance)
        let container = this.getContainer(settings)
        if(distance < 0 || y < 0 || y > container.height) {
            return undefined
        }

        return new Point({x: wallX, y, distance})
    }

    hitAtY(point, wallY, dx, dy, settings={}) {
        let distance = (wallY - point.y) / dy
        let x = point.x + (dx * distance)
        let container = this.getContainer(settings)
        if(distance < 0 || x < 0 || x > container.width) {
            return undefined
        }

        return new Point({x, y: wallY, distance})
    }

    getContainer(settings={}) {
        let conf = this.resolveSettings(settings)
        let container = conf.container
            || conf.dimensions
            || this.parent.stage?.dimensions
            || this.parent.dimensions

        if(container == undefined) {
            throw new Error('PointCone needs settings.container or settings.dimensions for wall projections.')
        }

        return container
    }

    angleTo(point, target) {
        return radiansToDegrees(point.directionTo(target))
    }

    wrapAngle(value) {
        return (value % 360 + 360) % 360
    }

    getCurveSettings(settings={}) {
        let conf = this.resolveSettings(settings)

        return {
            outer: this.normalizeCurveValue(conf.curve, conf.invertCurve === true)
            , inner: this.normalizeCurveValue(conf.innerCurve)
        }
    }

    getInnerOffset(settings={}) {
        let conf = this.resolveSettings(settings)
        let innerOffset = Number(conf.innerOffset)
        return Number.isNaN(innerOffset)? 0: innerOffset
    }

    getOutlineSettings(settings={}) {
        return getConeOutlineSettings(this.resolveSettings(settings))
    }

    normalizeCurveValue(value, invert=false) {
        return normalizeConeCurveValue(value, invert)
    }

    hasEqualRadius(originPoint, start, end) {
        let a = originPoint.distanceTo(start)
        let b = originPoint.distanceTo(end)
        return Math.abs(a - b) < .001
    }

    samePoint(a, b) {
        if(a == undefined || b == undefined) {
            return false
        }

        return a.x === b.x && a.y === b.y
    }

    pushUniquePoint(points, point) {
        if(point == undefined) {
            return false
        }

        if(this.samePoint(points[points.length - 1], point) === false) {
            points.push(point)
        }

        return true
    }

    ensureRenderData(settings={}) {
        return this.isRenderData(settings)? settings: this.renderData(settings)
    }

    isRenderData(value) {
        return value?.originPoint === this.parent
            && value?.settings != undefined
            && value?.edgePoints != undefined
    }
}


Polypoint.head.install(PointCone)


Polypoint.head.deferredProp('Point', function cone(){
    return new PointCone(this)
})