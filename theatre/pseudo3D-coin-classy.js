/*
---
title: Pseudo-3D Z-Depth Sorting
categories: pseudo3D
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/rotate.js
    stroke
    ../point_src/distances.js
    ../point_src/dragging.js

---

*/

class PointCoin {
    /* point.coin */
    constructor(p) {
        this.parent = p

        this.spin = {
                x: this.rotSize
                , y: this.rotSize
                , z: 0//-this.rotSize
            }
        // Change these values to rotate around the coin center or an offset pivot.
        // this.rotationOriginMode = 'center' // 'center' | 'offset'
        this.rotationOriginMode = 'offset' // 'center' | 'offset'
        this.rotationOriginOffset = new Point({x: 0, y: 0, z: 0})

        this.projectionPoint = this.getRotationOriginPoint()
        this.projectionLength = 1000

        this.perspectiveCenter = this.parent.copy()
        this.rotSize = 0
        this.performSpin = true

        // Four-curve coin profile in point-local plane space.
        this.coinCurveConfig = {
            axisStep: 1
            , radius: undefined
            // Circle approximation constant for each cubic quarter arc.
            , k: .5522847498307936
        }

    }

    getRotationOriginPoint(){
        if(this.rotationOriginMode == 'offset'){
            return this.parent.add(
                this.rotationOriginOffset.x
                , this.rotationOriginOffset.y
                , this.rotationOriginOffset.z
            )
        }
        return this.parent.copy()
    }


    projectPointBasis(source, axisStep=1){
        let center = source.copy()
        let basisX = source.add(axisStep, 0, 0)
        let basisY = source.add(0, axisStep, 0)

        // Use rotate helpers directly so this demo does not depend on PointList.
        let rotated = pseudo3DRotate(
            [center, basisX, basisY]
            , this.spin
            , this.projectionPoint
            , false
        )

        let projected = pseudo3DRotatePerspective(
            rotated
            , this.perspectiveCenter
            , this.projectionLength
        )

        let p = projected[0]
        let px = projected[1]
        let py = projected[2]

        return {
            source
            , p
            , vx: {x: px.x - p.x, y: px.y - p.y}
            , vy: {x: py.x - p.x, y: py.y - p.y}
        }
    }

    step(){
        this.spin = {
                x: 0 // this.rotSize
                , y: this.rotSize
                , z: 0//-this.rotSize
            }

        this.projectionPoint = this.getRotationOriginPoint()

        let axisStep = this.coinCurveConfig.axisStep ?? 1
        this.projectedCoin = this.projectPointBasis(this.parent, axisStep)
    }

    draw(ctx){

        if(this.performSpin){
            this.rotSize += 1
        }
        this.step()

        // Four-segment cubic casting for the coin profile.
        let curve = this.getProjectedCoinBezier(this.projectedCoin, this.coinCurveConfig)

        ctx.beginPath()
        ctx.moveTo(curve.start.x, curve.start.y)
        curve.segments.forEach((seg)=>{
            ctx.bezierCurveTo(
                seg.c1.x, seg.c1.y,
                seg.c2.x, seg.c2.y,
                seg.end.x, seg.end.y
            )
        })
        ctx.closePath()
        let v = this.spin.y % 360
        let col = (v > 90 && v < 270) ? '#555': 'purple'
        ctx.fillStyle = col
        ctx.fill()
        // p.pen.fill(ctx, {color: col})

        ctx.strokeStyle = `hsl(277 60% 80%)`
        ctx.lineWidth = 3
        ctx.stroke()
    }

    getProjectedCoinBezier(item, conf={}){
        let radius = conf.radius ?? item.source?.radius ?? 6
        let k = conf.k ?? .5522847498307936
        let map = (u, v)=> this.mapPlaneLocalToScreen(item, u, v, radius)

        let a0 = map(1, 0)
        let a1 = map(0, 1)
        let a2 = map(-1, 0)
        let a3 = map(0, -1)

        // Four cubic curves: one segment per quarter arc.
        return {
            start: a0
            , segments: [
                {
                    c1: map(1, k)
                    , c2: map(k, 1)
                    , end: a1
                }
                , {
                    c1: map(-k, 1)
                    , c2: map(-1, k)
                    , end: a2
                }
                , {
                    c1: map(-1, -k)
                    , c2: map(-k, -1)
                    , end: a3
                }
                , {
                    c1: map(k, -1)
                    , c2: map(1, -k)
                    , end: a0
                }
            ]
        }
    }

    mapPlaneLocalToScreen(item, u, v, radius){
        let p = item.p
        let ex = item.vx
        let ey = item.vy
        return {
            x: p.x + ((ex.x * u) + (ey.x * v)) * radius
            , y: p.y + ((ex.y * u) + (ey.y * v)) * radius
        }
    }

}


class MainStage extends Stage {
    canvas='playspace'
    // live=false
    live = true

    mounted(){
        this.depth = 1000
        this.sourcePoint = new Point({
            x: this.center.x
            , y: this.center.y
            , z: 0
            , radius: 100
        })

        this.sourcePoint.coin = new PointCoin(this.sourcePoint)
    }

    onMousedown(){
        this.sourcePoint.coin.performSpin = !this.sourcePoint.coin.performSpin
    }

    draw(ctx){
        this.clear(ctx)
        let p = this.sourcePoint;
        p.coin.draw(ctx)


    }
}


;stage = MainStage.go();