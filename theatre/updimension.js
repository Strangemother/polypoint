/*
title: Up Dimension
categories: minimal
files:
    head
    point
    pointlist
    ../point_src/pointlistpen.js
    ../point_src/events.js
    mouse
    stage
    dragging
    stroke
    ../point_src/random.js
    ../point_src/rectangle.js
    ../point_src/rotate.js
---

Up Dimension converts the 2d Plot into a 3D plot
using the radius as a camera distance
*/

function upDimensionPoint(point, projectionCenter, projectionLength, worldRadius) {
    let safeProjectedRadius = Math.max(point.radius, .0001)
    let safeWorldRadius = Math.max(worldRadius, .0001)
    let factor = safeProjectedRadius / safeWorldRadius

    point.x = projectionCenter.x + ((point.x - projectionCenter.x) / factor)
    point.y = projectionCenter.y + ((point.y - projectionCenter.y) / factor)
    point.z = projectionLength * ((1 / factor) - 1)
    point.radius = safeWorldRadius
    return point
}

addButton('Plot', {
    onclick(){
        stage.plot()
    }
})

addButton('shuffle', {
    onclick(){
        stage.shuffle()
    }
})


addButton('Up Dimension', {
    onclick(){
        stage.upDimension()
    }
})

class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        this.plot()
        this.spunPoints = undefined
        this.rotSize = 0
    }

    plot(){
        this.points = PointList.generate.grid(48, 8, 100)
        let maxSize = 25
        let minSize = 5
        this.points.each.radius = ()=> random.int(minSize,maxSize)
        // this.points.each.z = () => -900 + Math.random() * 1000 + 500
        this.projectionPoint = this.points.center.copy()
        this.projectionLength = 700
        this.worldRadius = 10

        this.originPoints = this.points.copy(true)

        let maxDepth = maxSize / minSize
        /* Edit the originPoint colors given the base set z placements. */
        this.originPoints.forEach((p, i)=>{
            let z = this.points[i].radius
            let light = parseInt((z / maxDepth) * 10)
            let color = `hsl(200 66% ${light}%)`
            p.color = color
        })

        this.points.forEach(p=> upDimensionPoint(p, this.projectionPoint, this.projectionLength, this.worldRadius))

        this.perspectiveCenter = this.projectionPoint.copy()
        // random.shuffle(this.points, 2)
        this.dragging.set(...this.points)
    }

    shuffle(){
        random.shuffle(this.points, 2)
    }

    draw(ctx){
        this.clear(ctx)
        this.originPoints.forEach(p=>p.pen.fill(ctx, p.color))
        // this.originPoints.pen.fill(ctx)
        // this.originPoints.pen.fill(ctx, {color:'#666'})
        if(this.spunPoints != undefined){
            this.spunPoints.pen.fill(ctx, {color:'purple'})
        }
        this.rotSize += 0.1
        this.upDimension()
    }

    upDimension(){
        let projectionPoint = this.projectionPoint
        let perspectiveCenter = this.perspectiveCenter
        let projectionLength = this.projectionLength
        let worldRadius = this.worldRadius
        // let spin = this.spin

        let spin = this.spin = {
                x: 0
                , y:  this.rotSize
                , z: 0
            }
        let ps = this.points//.copy(true)
        // ps.forEach(p=> upDimensionPoint(p, projectionPoint, projectionLength, worldRadius))
        // let spunPoints = pseudo3DRotatePerspective(ps, projectionPoint, projectionLength)
        let spunPoints = ps.pseudo3d.perspective(
                  spin
                , projectionPoint
                , projectionLength
                , perspectiveCenter
            )
        this.spunPoints = spunPoints.map(p=>new Point(p))
    }

}

stage = MainStage.go(/*{ loop: true }*/)

