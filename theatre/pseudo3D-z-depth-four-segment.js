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

    }

    step(){
        let spin = this.spin = {
                x: 0
                , y:  this.rotSize
                , z: 0
            }

        let axisStep = 1
        this.projectedCoins = this.points.map((source)=>{
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
        })

        this.projectedCoins.sort((a, b)=> a.p.z - b.p.z)

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

    getProjectedCoinBezier(item, radius){
        // Bezier circle constant (egg/circle style from 4 cubic arcs).
        let k = .5522847498307936
        let map = (u, v)=> this.mapPlaneLocalToScreen(item, u, v, radius)

        let a0 = map(1, 0)
        let a1 = map(0, 1)
        let a2 = map(-1, 0)
        let a3 = map(0, -1)

        return {
            start: a0
            , segments: [
                {c1: map(1, k), c2: map(k, 1), end: a1}
                , {c1: map(-k, 1), c2: map(-1, k), end: a2}
                , {c1: map(-1, -k), c2: map(-k, -1), end: a3}
                , {c1: map(k, -1), c2: map(1, -k), end: a0}
            ]
        }
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

            // Render a projected coin using explicit world-space cubic bezier points.
            let baseRadius = item.source.radius == undefined ? 6 : item.source.radius
            let curve = this.getProjectedCoinBezier(item, baseRadius)
            this.coinCurves.push({
                source: item.source
                , z
                , curve
            })

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
            ctx.fillStyle = color
            ctx.fill()

            ctx.strokeStyle = `hsl(${red} 70% 22%)`
            ctx.lineWidth = 1
            ctx.stroke()
        })
    }
}


;stage = MainStage.go();