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
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
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
class MainStage extends Stage {
    canvas='playspace'
    // live=false
    live = true
    mounted(){
        let depth = this.depth = 1000
        let z = ()=> -(depth) + Math.random() * depth + (depth * .5)
        this.points = PointList.generate.random(100, 500, {x: 200, y: 200, z})
        this.projectionPoint = this.points.center.copy()
        this.projectionLength = 1000
        this.perspectiveCenter = this.projectionPoint.copy()
        this.rotSize = 0
        this.performSpin = false

        // Two-curve asymmetric egg profile in point-local plane space.
        this.pointCurveConfig = {
            axisStep: 1
            , radius: undefined
            , waist: 1
            , topHeight: 1
            , bottomHeight: 1
            // For 2 cubic segments (one per half), round profile uses 4/3.
            , topBow: 1.3333333333333333
            , bottomBow: 1.3333333333333333
            , topInset: 1
            , bottomInset: 1
        }

    }

    projectPointBasis(source, axisStep=1){
        let center = source.copy()
        let basisX = source.copy().add(axisStep, 0, 0)
        let basisY = source.copy().add(0, axisStep, 0)

        let projected = (new PointList(center, basisX, basisY)).pseudo3d.perspective(
                  this.spin
                , this.projectionPoint
                , this.projectionLength
                , this.perspectiveCenter
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
        let spin = this.spin = {
                x: -this.rotSize
                , y:  this.rotSize
                , z: -this.rotSize
            }

        let axisStep = this.pointCurveConfig.axisStep ?? 1
        this.projectedCoins = this.points.map((source)=> this.projectPointBasis(source, axisStep))

        // this.projectedCoins.sort((a, b)=> a.p.z - b.p.z)

    }

    onMousedown(){
        this.performSpin = !this.performSpin
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

    getProjectedEggBezier(item, conf={}){
        let radius = conf.radius ?? item.source?.radius ?? 6
        let waist = conf.waist ?? 1
        let topHeight = conf.topHeight ?? 1
        let bottomHeight = conf.bottomHeight ?? 1
        let topBow = conf.topBow ?? .5522847498307936
        let bottomBow = conf.bottomBow ?? .5522847498307936
        let topInset = conf.topInset ?? 1
        let bottomInset = conf.bottomInset ?? 1
        let map = (u, v)=> this.mapPlaneLocalToScreen(item, u, v, radius)

        let right = map(waist, 0)
        let left = map(-waist, 0)

        // Two cubic curves: right->left (top), left->right (bottom).
        return {
            center: {x: item.p.x, y: item.p.y, z: item.p.z}
            , start: right
            , segments: [
                {
                    c1: map(waist * topInset, topHeight * topBow)
                    , c2: map(-waist * topInset, topHeight * topBow)
                    , end: left
                }
                , {
                    c1: map(-waist * bottomInset, -bottomHeight * bottomBow)
                    , c2: map(waist * bottomInset, -bottomHeight * bottomBow)
                    , end: right
                }
            ]
        }
    }

    pointToCurves(pointOrItem, conf={}){
        let item = (pointOrItem?.p && pointOrItem?.vx && pointOrItem?.vy)
            ? pointOrItem
            : this.projectPointBasis(pointOrItem, conf.axisStep ?? this.pointCurveConfig.axisStep ?? 1)

        let merged = Object.assign({}, this.pointCurveConfig, conf)
        return this.getProjectedEggBezier(item, merged)
    }

    draw(ctx){
        this.clear(ctx)
        if(this.performSpin){
            this.rotSize += .2
        }
        this.step()
        // let color = '#666'
        // this.points.pen.indicators(ctx, {color})
        // this.spunPoints.pen.indicators(ctx)
        let maxDepth = this.depth
        let deepColor = 200
        this.coinCurves = []
        this.projectedCoins.forEach((item)=>{
            let p = item.p
            let z = p.z
            let red = deepColor - ((z / maxDepth) * deepColor)
            // let colorBlue = "hsl(184 50% 40%)"
            // let colorRed = "hsl(0 66% 40%)"
            let color = `hsl(${red} 66% 35%)`

            // Render a projected egg/coin using explicit world-space cubic bezier points.
            let curve = this.pointToCurves(item)
            this.coinCurves.push({
                source: item.source
                , z
                , curve
            })

            ctx.moveTo(curve.start.x, curve.start.y)
            curve.segments.forEach((seg)=>{
                ctx.beginPath()
                ctx.bezierCurveTo(
                    seg.c1.x, seg.c1.y,
                    seg.c2.x, seg.c2.y,
                    seg.end.x, seg.end.y
                )
                ctx.strokeStyle = `hsl(${red} 70% 22%)`
                ctx.lineWidth = 1
                ctx.stroke()
            })
            ctx.closePath()
            ctx.fillStyle = color
            ctx.fill()

        })
    }
}


;stage = MainStage.go();