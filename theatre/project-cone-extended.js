/*
---
title: Project Cone
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/point-content.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stagepen.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/stage.js
    ../point_src/constrain-distance.js
---

The projected cone from the center of the origin. This is actually
a pointlist with a fill.
*/
class MainStage extends Stage {
    canvas='playspace'

    mounted(){

        let a = this.a = new Point({x:200,y:200, radius: 100,
                                rotation: 10, cone: 50})

        this.dragging.add(a)

    }

    draw(ctx){
        this.clear(ctx)

        this.a.rotation += .2

        let coneSettings = this.getDemoConeSettings(this.a)
        let conePoints = this.getConePoints(this.a, coneSettings)
        
        this.drawConeFill(ctx, this.a, conePoints, coneSettings);

        // conePoints.pen.line(ctx, {color: 'purple', width: 2, closed: true})
        this.a.pen.indicator(ctx, {color:'#ddd'})

        this.drawConeOutline(ctx, this.a, conePoints, coneSettings)

    }

    getDemoConeSettings(point) {
        return {
            /* For a projected distance - Omit for _to walls_ */
            distance: point.radius * 3
            /* For a projected distance - Including wall intersections */
            , viewportLimit: false
            /* Offset the start anchor by a multiple of the point radius.
            0 starts at center, 1 starts at the point edge. */
            , innerOffset: 0
            /* Project to max radius of the point. - */
            , inner: false

            /* -1-0-1 value of how much curve to apply to the cone fill.
            `curve:-1` is the same as `invertCurve:true` */
            , curve: 1
            , invertCurve: false

            /* Apply the same signed curve control to the inner return edge.
            curve:1 innerCurve:1 produces a donut slice. */
            , innerCurve: true

            // , outline: true
            // , outline: false
            // , outline: 'edge'
            // , outline: 'outer'
            // , outline: { leading: true, trailing: true, inner: false, outer: false }
            , outline: 'outer'
        }
    }

    drawConeFill(ctx, originPoint, conePoints, settings={}) {
        let path = this.getConeRenderData(originPoint, conePoints, settings)
        this.traceConePath(ctx, originPoint, path)
        this.fillConePath(ctx)
    }

    drawConeOutline(ctx, originPoint, conePoints, settings={}) {
        let path = this.getConeRenderData(originPoint, conePoints, settings)
        let outline = this.getOutlineSettings(settings)
        if(outline.enabled === false) {
            return false
        }

        this.traceConeOutline(ctx, originPoint, path, outline)
        ctx.strokeStyle = 'purple'
        ctx.lineWidth = 2
        ctx.stroke()
    }

    getConeRenderData(originPoint, conePoints, settings={}) {
        let path = this.getCurvePathInfo(conePoints, settings)
        path.curves = this.getCurveSettings(settings)
        path.originPoint = originPoint
        path.hasOuterEdge = settings.distance != undefined
        return path
    }

    traceConePath(ctx, originPoint, path) {
        let start = path.edgePoints[0]
        let end = path.edgePoints.last()

        if(start == undefined || end == undefined) {
            return false
        }

        ctx.beginPath()
        ctx.moveTo(path.startAnchor.x, path.startAnchor.y)
        ctx.lineTo(start.x, start.y)

        this.drawEdgePath(ctx, originPoint, path.edgePoints, path.curves.outer)

        if(this.samePoint(path.endAnchor, end) === false) {
            ctx.lineTo(path.endAnchor.x, path.endAnchor.y)
        }

        if(path.hasInnerEdge && path.curves.inner !== 0) {
            this.drawInnerCurve(ctx, originPoint, path.endAnchor, path.startAnchor, path.curves.inner)
        }

        ctx.closePath()
        return true
    }

    traceConeOutline(ctx, originPoint, path, outline) {
        let start = path.edgePoints[0]
        let end = path.edgePoints.last()

        if(start == undefined || end == undefined) {
            return false
        }

        ctx.beginPath()

        if(outline.leading) {
            ctx.moveTo(path.startAnchor.x, path.startAnchor.y)
            ctx.lineTo(start.x, start.y)
        }

        if(outline.outer && path.hasOuterEdge) {
            ctx.moveTo(start.x, start.y)
            this.drawEdgePath(ctx, originPoint, path.edgePoints, path.curves.outer)
        }

        if(outline.trailing && this.samePoint(path.endAnchor, end) === false) {
            ctx.moveTo(end.x, end.y)
            ctx.lineTo(path.endAnchor.x, path.endAnchor.y)
        }

        if(outline.inner && path.hasInnerEdge) {
            ctx.moveTo(path.endAnchor.x, path.endAnchor.y)

            if(path.curves.inner !== 0) {
                this.drawInnerCurve(ctx, originPoint, path.endAnchor, path.startAnchor, path.curves.inner)
            } else {
                ctx.lineTo(path.startAnchor.x, path.startAnchor.y)
            }
        }

        return true
    }

    getCurvePathInfo(conePoints, settings={}) {
        let hasInnerEdge = this.getInnerOffset(settings) !== 0
        return {
            startAnchor: conePoints[0]
            , endAnchor: hasInnerEdge? conePoints.last(): conePoints[0]
            , edgePoints: hasInnerEdge? conePoints.slice(1, -1): conePoints.slice(1)
            , hasInnerEdge
        }
    }

    drawEdgePath(ctx, originPoint, edgePoints, curveValue) {
        let start = edgePoints[0]
        let end = edgePoints.last()

        if(curveValue === 0) {
            return this.drawStraightEdge(ctx, edgePoints)
        }

        if(edgePoints.length === 2 && curveValue === 1 && this.hasEqualRadius(originPoint, start, end)) {
            return this.drawConeArc(ctx, originPoint, start, end)
        }

        if(edgePoints.length === 2) {
            let control = this.getConeCurveControl(originPoint, start, end, curveValue)
            return ctx.quadraticCurveTo(control.x, control.y, end.x, end.y)
        }

        this.drawQuadraticPath(ctx, edgePoints)
    }

    drawQuadraticPath(ctx, points) {
        let start = points[0]
        ctx.lineTo(start.x, start.y)

        for(let i = 1; i < points.length - 1; i++) {
            let current = points[i]
            let next = points[i + 1]
            let midpoint = this.midpoint(current, next)
            ctx.quadraticCurveTo(current.x, current.y, midpoint.x, midpoint.y)
        }

        let secondLast = points[points.length - 2]
        let end = points.last()
        ctx.quadraticCurveTo(secondLast.x, secondLast.y, end.x, end.y)
    }

    drawStraightEdge(ctx, points) {
        for(let point of points) {
            ctx.lineTo(point.x, point.y)
        }
    }

    getConeCurveControl(originPoint, start, end, curveValue) {
        let radius = Math.max(originPoint.distanceTo(start), originPoint.distanceTo(end))
        let midpoint = this.midpoint(start, end)
        let midpointDistance = originPoint.distanceTo(midpoint)
        /* A full positive curve should match a circle passing through the
        edge points, so we project the control point onto the cone centerline
        at the corresponding circle-center distance. */
        let halfAngle = Math.abs(degToRad(originPoint.cone || 0))
        let circleDistance = radius / Math.max(.0001, Math.cos(halfAngle))
        /* Negative curves mirror that bulge back through the midpoint so the
        same [-1, 1] range covers the inverted shape. */
        let inverseDistance = Math.max(0, (midpointDistance * 2) - circleDistance)
        let targetDistance = curveValue > 0? circleDistance: inverseDistance
        let amount = Math.abs(curveValue)
        let distance = midpointDistance + ((targetDistance - midpointDistance) * amount)

        return this.projectDistance(originPoint, originPoint.rotation, distance)
    }

    drawInnerCurve(ctx, originPoint, start, end, curveValue) {
        if(curveValue === 1 && this.hasEqualRadius(originPoint, start, end)) {
            return this.drawConeArc(ctx, originPoint, start, end, true)
        }

        let control = this.getConeCurveControl(originPoint, start, end, curveValue)
        ctx.quadraticCurveTo(control.x, control.y, end.x, end.y)
    }

    drawConeArc(ctx, originPoint, start, end, anticlockwise=false) {
        let startAngle = Math.atan2(start.y - originPoint.y, start.x - originPoint.x)
        let endAngle = Math.atan2(end.y - originPoint.y, end.x - originPoint.x)
        let radius = originPoint.distanceTo(start)
        ctx.arc(originPoint.x, originPoint.y, radius, startAngle, endAngle, anticlockwise)
    }

    midpoint(a, b) {
        return new Point({
            x: (a.x + b.x) * .5
            , y: (a.y + b.y) * .5
        })

    }

    getConePoints(point, settings={}){
        let startAngle = point.rotation - point.cone
        let endAngle = point.rotation + point.cone
        let innerOffset = this.getInnerOffset(settings)
        let innerDistance = point.radius * innerOffset
        let origin = point.copy().update({radius: undefined})
        let innerStart = this.projectDistance(point, startAngle, innerDistance)
        let innerEnd = this.projectDistance(point, endAngle, innerDistance)
        let start = this.getEdgePoint(point, startAngle, settings)
        let end = this.getEdgePoint(point, endAngle, settings)
        let corners = this.getConeCorners(point, startAngle, endAngle, settings)
        let points = [innerOffset !== 0? innerStart: origin]

        this.pushUniquePoint(points, start)
        points.push(...corners)

        this.pushUniquePoint(points, end)

        if(innerOffset !== 0 && this.samePoint(points[points.length - 1], innerEnd) === false) {
            points.push(innerEnd)
        }

        return new PointList(...points).cast()
    }

    getContainer(){
        return this.dimensions
    }

    getEdgePoint(point, angle, settings={}) {
        if(settings.inner === true) {
            let innerSettings = Object.assign({}, settings, { distance: point.radius })
            return this.getWallIntersection(point, angle, innerSettings)
        }

        return this.getWallIntersection(point, angle, settings)
    }

    getConeCorners(point, startAngle, endAngle, settings={}) {
        if(settings.distance != undefined || settings.inner === true) {
            return []
        }

        let { width, height } = this.getContainer()
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

    getWallIntersection(point, angle, settings={}) {
        if(settings.distance != undefined && settings.viewportLimit !== true) {
            return this.projectDistance(point, angle, settings.distance)
        }

        let { width, height } = this.getContainer()
        let radians = degToRad(angle)
        let dx = Math.cos(radians)
        let dy = Math.sin(radians)
        let hits = []

        if(dx > 0) {
            hits.push(this.hitAtX(point, width, dx, dy))
        }

        if(dx < 0) {
            hits.push(this.hitAtX(point, 0, dx, dy))
        }

        if(dy > 0) {
            hits.push(this.hitAtY(point, height, dx, dy))
        }

        if(dy < 0) {
            hits.push(this.hitAtY(point, 0, dx, dy))
        }

        let hit = hits
            .filter(Boolean)
            .sort((a, b) => a.distance - b.distance)[0]

        if(settings.distance == undefined) {
            return hit
        }

        if(hit == undefined || settings.distance < hit.distance) {
            return this.projectDistance(point, angle, settings.distance)
        }

        return hit
    }

    projectDistance(point, angle, distance) {
        let radians = degToRad(angle)
        return new Point({
            x: point.x + (Math.cos(radians) * distance)
            , y: point.y + (Math.sin(radians) * distance)
            , distance
        })
    }

    fillConePath(ctx) {
        this.pen.fill(ctx, "#1a0e28")
        ctx.fillStyle = 'rebeccapurple'
        ctx.fill()
    }

    hitAtX(point, wallX, dx, dy) {
        let distance = (wallX - point.x) / dx
        let y = point.y + (dy * distance)
        if(distance < 0 || y < 0 || y > this.getContainer().height) {
            return undefined
        }

        return new Point({x: wallX, y, distance})
    }

    hitAtY(point, wallY, dx, dy) {
        let distance = (wallY - point.y) / dy
        let x = point.x + (dx * distance)
        if(distance < 0 || x < 0 || x > this.getContainer().width) {
            return undefined
        }

        return new Point({x, y: wallY, distance})
    }

    angleTo(point, target) {
        return radiansToDegrees(Math.atan2(target.y - point.y, target.x - point.x))
    }

    wrapAngle(value) {
        return (value % 360 + 360) % 360
    }

    getCurveSettings(settings={}) {
        return {
            outer: this.normalizeCurveValue(settings.curve, settings.invertCurve === true)
            , inner: this.normalizeCurveValue(settings.innerCurve)
        }
    }

    getInnerOffset(settings={}) {
        let innerOffset = Number(settings.innerOffset)
        return Number.isNaN(innerOffset)? 0: innerOffset
    }

    getOutlineSettings(settings={}) {
        let outline = settings.outline

        if(outline === false || outline == undefined) {
            return {
                enabled: false
                , leading: false
                , trailing: false
                , inner: false
                , outer: false
            }
        }

        if(outline === true) {
            return {
                enabled: true
                , leading: true
                , trailing: true
                , inner: true
                , outer: true
            }
        }

        if(outline === 'edge') {
            return {
                enabled: true
                , leading: true
                , trailing: true
                , inner: false
                , outer: false
            }
        }

        if(outline === 'outer') {
            return {
                enabled: true
                , leading: true
                , trailing: true
                , inner: false
                , outer: true
            }
        }

        return {
            enabled: true
            , leading: outline.leading === true
            , trailing: outline.trailing === true
            , inner: outline.inner === true
            , outer: outline.outer === true
        }
    }

    normalizeCurveValue(value, invert=false) {
        let curve = Number(value)
        curve = Number.isNaN(curve)? 0: curve
        return curve * (invert? -1: 1)
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
        if(this.samePoint(points[points.length - 1], point) === false) {
            points.push(point)
        }
    }
}


;stage = MainStage.go();