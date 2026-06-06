/*
title: Elbow Constraints
category: constraints
files:
    head
    point
    stroke
    ../point_src/point-content.js
    pointlist
    mouse
    dragging
    ../point_src/distances.js
    ../point_src/functions/clamp.js
    ../point_src/mirror.js
    ../point_src/stage.js
    ../point_src/text/label.js
    ../point_src/intersections.js
    ../point_src/cone.js
    ../point_src/easing.js
    ../point_src/arc.js
    ../point_src/constrain-distance.js
---

An elbow contraint ensures a target point is _connected_ to another point, at
a distance of the two radii.

        point.constraint.elbow(other)

It's called an elbow, as there will always be an intersection at the max distance.
Similar to rings bound at the edge.

Synonymous to:

    let pA = this.legL
    let pB = this.primaryPoint

    pA.leash(pointB,
        (pB.radius + pA.radius) - .01)
    pA.avoid(pointB,
        Math.abs(pB.radius - pA.radius) + .01)

*/

const getContinuationArc = function(fromPoint, toPoint, centerPoint) {
    /* Return a plotted point on the continuation arc. The endpoint
    rotations define the tangent directions, while `centerPoint` acts as
    the landing-point hint and selects the correct sweep side. */
    const dx = toPoint.x - fromPoint.x
    const dy = toPoint.y - fromPoint.y
    const distance = Math.hypot(dx, dy)

    if(distance === 0) {
        return {
            x: fromPoint.x
            , y: fromPoint.y
        }
    }

    const midpointX = (fromPoint.x + toPoint.x) * .5
    const midpointY = (fromPoint.y + toPoint.y) * .5
    const startTangent = fromPoint.radians == undefined
        ? degToRad(fromPoint.rotation + 180)
        : fromPoint.radians + Math.PI
    const endTangent = toPoint.radians == undefined
        ? degToRad(toPoint.rotation)
        : toPoint.radians
    const sweep = Math.atan2(
        Math.sin(endTangent - startTangent)
        , Math.cos(endTangent - startTangent)
    )
    const minimumSweep = degToRad(.5)
    const absSweep = Math.max(Math.abs(sweep), minimumSweep)

    if(centerPoint != undefined && Math.abs(sweep) < degToRad(1)) {
        const projectionAmount = (
                ((centerPoint.x - fromPoint.x) * dx)
                + ((centerPoint.y - fromPoint.y) * dy)
            ) / (distance * distance)

        return {
            x: fromPoint.x + (dx * projectionAmount)
            , y: fromPoint.y + (dy * projectionAmount)
        }
    }

    const offsetDistance = (distance * .5) / Math.tan(absSweep * .5)
    const unitPerpX = -dy / distance
    const unitPerpY = dx / distance
    const sideHint = centerPoint == undefined
        ? 1
        : ((dx * (centerPoint.y - midpointY)) - (dy * (centerPoint.x - midpointX))) < 0 ? -1 : 1

    const radiansDiff = function(a, b) {
        return Math.atan2(Math.sin(a - b), Math.cos(a - b))
    }

    const getCandidate = function(direction) {
        const centerX = midpointX + (unitPerpX * offsetDistance * direction)
        const centerY = midpointY + (unitPerpY * offsetDistance * direction)
        const startRadiusAngle = Math.atan2(fromPoint.y - centerY, fromPoint.x - centerX)
        const endRadiusAngle = Math.atan2(toPoint.y - centerY, toPoint.x - centerX)
        const candidateSweep = radiansDiff(endRadiusAngle, startRadiusAngle)
        const tangentDirection = candidateSweep < 0 ? -1 : 1
        const tangentAtStart = startRadiusAngle + (tangentDirection * Math.PI * .5)
        const tangentAtEnd = endRadiusAngle + (tangentDirection * Math.PI * .5)
        const tangentError = Math.abs(radiansDiff(tangentAtStart, startTangent))
            + Math.abs(radiansDiff(tangentAtEnd, endTangent))
        const sweepError = Math.abs(Math.abs(candidateSweep) - Math.min(absSweep, Math.PI))
        const radius = Math.hypot(centerX - fromPoint.x, centerY - fromPoint.y)

        let pointX = midpointX
        let pointY = midpointY
        let hintError = direction == sideHint ? 0 : .001

        if(centerPoint != undefined) {
            const hintDx = centerPoint.x - centerX
            const hintDy = centerPoint.y - centerY
            const hintDistance = Math.hypot(hintDx, hintDy)

            if(hintDistance > 0.000001) {
                pointX = centerX + (hintDx / hintDistance) * radius
                pointY = centerY + (hintDy / hintDistance) * radius
                hintError += Math.abs(hintDistance - radius)
            }
        }

        return {
            x: pointX
            , y: pointY
            , score: ((tangentError + sweepError) * distance) + (hintError / distance)
        }
    }

    const candidateA = getCandidate(-1)
    const candidateB = getCandidate(1)
    return candidateA.score < candidateB.score ? candidateA : candidateB
}


const getRayCirclePoint = function(originPoint, rayPoint, circleCenter, radius) {
    const dx = rayPoint.x - originPoint.x
    const dy = rayPoint.y - originPoint.y
    const a = (dx * dx) + (dy * dy)

    if(a === 0) {
        return null
    }

    const fx = originPoint.x - circleCenter.x
    const fy = originPoint.y - circleCenter.y
    const b = 2 * ((fx * dx) + (fy * dy))
    const c = (fx * fx) + (fy * fy) - (radius * radius)
    const discriminant = (b * b) - (4 * a * c)

    if(discriminant < 0) {
        return null
    }

    const sqrtDiscriminant = Math.sqrt(discriminant)
    const t1 = (-b - sqrtDiscriminant) / (2 * a)
    const t2 = (-b + sqrtDiscriminant) / (2 * a)
    const candidates = [t1, t2].filter((value) => value > 0.000001)

    if(candidates.length === 0) {
        return null
    }

    let t = candidates[0]
    if(candidates.length > 1 && Math.abs(candidates[1] - 1) < Math.abs(t - 1)) {
        t = candidates[1]
    }

    return {
        x: originPoint.x + (dx * t)
        , y: originPoint.y + (dy * t)
    }
}


const getContinuationPairThroughCenter = function(fromPoint, toPoint, centerPoint) {
    const arcPoint = getContinuationArc(fromPoint, toPoint, centerPoint)
    const cap = fromPoint.arc.to(toPoint, arcPoint)

    if(cap == null || centerPoint == undefined) {
        return [fromPoint, toPoint]
    }

    const arcCenter = {x: cap.cx, y: cap.cy}
    const radius = Math.hypot(centerPoint.x - cap.cx, centerPoint.y - cap.cy)
    const adjustedFrom = getRayCirclePoint(centerPoint, fromPoint, arcCenter, radius)
    const adjustedTo = getRayCirclePoint(centerPoint, toPoint, arcCenter, radius)

    if(adjustedFrom == null || adjustedTo == null) {
        return [fromPoint, toPoint]
    }

    return [
        fromPoint.copy().update(adjustedFrom)
        , toPoint.copy().update(adjustedTo)
    ]
}


const getPointLineDistance = function(point, fromPoint, toPoint) {
    const dx = toPoint.x - fromPoint.x
    const dy = toPoint.y - fromPoint.y
    const length = Math.hypot(dx, dy)

    if(length === 0) {
        return Math.hypot(point.x - fromPoint.x, point.y - fromPoint.y)
    }

    return Math.abs(
            (dx * (fromPoint.y - point.y))
            - ((fromPoint.x - point.x) * dy)
        ) / length
}



class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        console.log('main')
        this.a = new PointList(
                {x:180,y:360, radius:20}
                , {x:200,y:320, radius:20}
                , {x:240,y:290, radius:20}
                , {x:270,y:320, radius:20}
                , {x:300,y:350, radius:20}
            ).cast()
        this.dragging.addPoints(...this.a)
    }

    draw(ctx){
        this.clear(ctx)

        /* hip leashes knee */
        // this.a[2].constraint.leash(this.a[1], 100)

        /* Knee leashes foot */
        // this.a[1].constraint.leash(this.a[0], 100)

        /* Knee looks away from hip*/
        let orig = this.a;
        let lineCurve = this.genLine(orig)
        // a1.pen.indicator(ctx)
        // this.a.pen.indicator(ctx, {color: 'cyan'})
        orig.pen.indicator(ctx, {color: '#444'})
        let last; 
        lineCurve.forEach(trip => {
            let sub = new PointList(...trip)
            if(last) {
                sub[0].pen.line(ctx, last, {color: 'cyan', width: 2})
            }
            sub.pen.indicator(ctx, {color: 'orange'})
            // sub.pen.quadCurve(ctx, {color: 'pink', width: 2, loop:false})
            this.drawF(ctx, ...trip)
            last = sub.last()
        })
        // lineCurve.pen.indicator(ctx, {color: 'orange'})
        
        // lineCurve.pen.quadCurve(ctx, {color: 'red', width: 2, loop:true})
        // lineCurve.pen.quadCurve(ctx, {color: 'pink', width: 2, loop:false})
        // lineCurve.pen.line(ctx, {color: 'pink', width: 2, loop:false})
    }

    drawF(ctx, fromPoint, throughPoint, toPoint){
        if(getPointLineDistance(throughPoint, fromPoint, toPoint) < 0.001) {
            ctx.beginPath();
            ctx.moveTo(fromPoint.x, fromPoint.y)
            ctx.lineTo(toPoint.x, toPoint.y)
            ctx.stroke();
            return
        }

        let cap = fromPoint.arc.to(toPoint, throughPoint)

        if(!cap) {
            ctx.beginPath();
            ctx.moveTo(fromPoint.x, fromPoint.y)
            ctx.lineTo(toPoint.x, toPoint.y)
            ctx.stroke();
            return
        }

        ctx.beginPath();
        ctx.arc(cap.cx, cap.cy, cap.radius, cap.startRadians, cap.toRadians, 0);
        ctx.stroke();        
    }

    genLine(orig){

        let getPair = function(fromIndex=0, centerIndex=1, toIndex=2) {
            let r = orig[centerIndex].rotation

            orig[centerIndex].lookAt(orig[fromIndex])
            let a1 = orig[centerIndex].project()

            orig[centerIndex].lookAt(orig[toIndex])
            let a2 = orig[centerIndex].project()

            orig[centerIndex].rotation = r
            return [a1, a2]
        }

        let triple = function(fromIndex=0, centerIndex=1, toIndex=2, easingName) {
            let ab = getPair(fromIndex, centerIndex, toIndex)
            let adjusted = getContinuationPairThroughCenter(ab[0], ab[1], orig[centerIndex])

            let throughPoint = orig[centerIndex].copy().update({radius:5})
            // return [ab[0], orig[centerIndex], ab[1]]
            return [adjusted[0], throughPoint, adjusted[1]]
        }

        let tipA = function(beforeIndex, index, toTip=true, easingName) {
            let origR = orig[index].rotation
            // orig[index].lookAt(orig.last())
            let a1 = orig[index].project()

            orig[index].lookAt(orig[beforeIndex])
            let a2 = orig[index]
            if(toTip) { a2 = a2.project() }
            orig[index].rotation = origR

            if(!toTip)  { return [a2, orig[index]] }
            let adjusted = getContinuationPairThroughCenter(a1, a2, orig[index])
            let throughPoint = orig[index].copy().update({radius:5})
        
            return [adjusted[0], throughPoint, adjusted[1]]
        }

        let tipB = function(beforeIndex, index, toTip=true, easingName) {
            let origR = orig[index].rotation
            orig[index].lookAt(orig[beforeIndex])
            let a1 = orig[index]

            if(toTip) { a1 = a1.project() }
            orig[index].rotation = origR

            let a2 = orig[index].project()

            let c = orig[index].copy()
            // if(easingName) {
            //     c.lookAt(a1.midpoint(a2))
            //     let real = c.radius - (a1.distanceTo(a2)) * .5
            //     real = c.radius * easingFunctions[easingName][easingType](real / c.radius)
            //     c = c.project(real)
            // }
            let adjusted = getContinuationPairThroughCenter(a1, a2, orig[index])
            let throughPoint = orig[index].copy().update({radius:5})
        
            if(!toTip)  { return [a1, orig[index]] }

            return [adjusted[0], throughPoint, adjusted[1]]
        }

        let items = orig//.slice(1, stage.a.length-1)
        let toTip = true;
        let easingName = 'sine'
        let easingType = 'out'
        // orig[1].constraint.cone(orig[2], 90)
        let lineCurve = new PointList(
                tipA(1, 0, toTip, easingName)
            )//.cast()


        items.forEach((e,i, a) => {
            if(i == 0 || i == items.length-1) { return }
            lineCurve.push(triple(i-1, i, i+1, easingName))
        })

        lineCurve.push(tipB(items.length-2, items.length-1, toTip, easingName));

        return lineCurve
    }
}


;stage = MainStage.go();