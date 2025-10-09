/*
---
title: 3D Sphere
categories: pseudo3D
files:
    head
    point
    pointlist
    mouse
    stage
    ../point_src/rotate.js
    stroke
    ../point_src/distances.js
    ../point_src/dragging.js
    ../theatre/objects/sphere.js

---


*/

window.onmessage = function(e) {
    // console.log(e)
    stage.perspectiveCenter.set(e.data)
};



class MainStage extends Stage {
    canvas='playspace'
    // live=false
    live = true
    mounted(){
        let depth = this.depth = 500
        let count = 500
        let size = 290
        /* Generate 100 points, within a 500px box, at origin 0,0 */
        this.funcs = {
            SpherePointsFib: ()=> generateSpherePointsFib(count, size)
            , LesserGeodesicSphere: ()=> generateLesserGeodesicSphere(150) , LatLongEquatorialFocusSphere: ()=> generateLatLongEquatorialFocusSphere(100, 200).points
            , LatLongSphereMesh: ()=> generateLatLongSphereMesh(500, 200).points
            , GeodesicSphereMesh: ()=> generateGeodesicSphereMesh(200, 200).points
            , GeodesicSphereByPointCount: ()=> generateGeodesicSphereByPointCount(200, 200)
            , GeodesicSpherePoints: ()=> generateGeodesicSpherePoints(3,200).points
            , SpherePointsLatLong: ()=> generateSpherePointsLatLong(20, 20, 250)
            , SphereTrianglesAsPoints: ()=> generateSphereTrianglesAsPoints(20, 20, 250)
            , SpherePointsFib: ()=> generateSpherePointsFib(count, size)
            , SpherePointsFibMesh:()=> generateFibonacciSphereMesh(400, 200).points
        }

        this.funcName = 'SpherePointsLatLong'
        // this.points = PointList.from(generateSpherePointsFib(count, size)).cast()
        // this.points = PointList.from(generateLesserGeodesicSphere(50)).cast()
        let func = this.funcs[this.funcName]
        this.points = PointList.from(func()).cast()
        // this.points = PointList.from(generateLatLongEquatorialFocusSphere(30, 100).points).cast()
        // this.points = PointList.from(generateLatLongSphereMesh(500, 200).points).cast()
        // this.points = PointList.from(generateGeodesicSphereMesh(200, 200).points).cast()
        // this.points = PointList.from(generateGeodesicSphereByPointCount(200, 200)).cast()
        // this.points = PointList.from(generateGeodesicSpherePoints(3,200).points).cast()
        // this.points = PointList.from(generateSpherePointsLatLong(20, 20, 250)).cast()
        // this.points = PointList.from(generateSphereTrianglesAsPoints(20, 20, 250)).cast()
        // this.points = PointList.from(generateSpherePointsFib(count, size)).cast()
        this.points.each.radius = 2
        // this.projectionPoint = this.points.center.copy()
        this.projectionLength = 400
        this.perspectiveCenter = this.center.copy()

        this.rotSize = 0
        this.performSpin = false
        this.zFix = true
        let stage = this;

        addControl('type', {
            field: 'select'
            , onchange(ev) {
                let v = ev.currentTarget.value
                // console.log('set easeNameY to', v)
                stage.funcName = v
                let func = stage.funcs[v]
                stage.points = PointList.from(func()).cast()

            }
            , options: Object.keys(this.funcs)
        })
    }


    step(){
        let spin = this.spin = {
                x: this.rotSize - 100
                , y:  this.rotSize
                , z: -this.rotSize
            }

        this.spunPoints = this.points.pseudo3d.orthogonal(
        // this.spunPoints = this.points.pseudo3d.perspective(
                  this.spin
                , this.projectionPoint
                , this.projectionLength
                , this.perspectiveCenter
            )
        let maxDepth = this.depth
        let deepColor = 1300
        this.spunPoints.forEach((p, i)=>{
            let z = p.z
            let red = deepColor - ((z / maxDepth) * deepColor)
            // let colorBlue = "hsl(184 50% 40%)"
            // let colorRed = "hsl(0 66% 40%)"
            let l = (red) * .04
            let color = `hsl(${red} 66% ${l}%)`
            p.color = color
        })
        this.zFix && this.spunPoints.sortByZ()
        // this.perspectiveCenter = this.spunPoints.copy().add(0, 0)


    }

    onMousedown(){
        this.performSpin = !this.performSpin
    }

    draw(ctx){
        this.clear(ctx)
        let sv = 0.02
        if(this.performSpin){
            sv = .2
        }
        this.rotSize += sv
        this.step()
        // let color = '#666'
        // this.points.pen.indicators(ctx, {color})
        // this.spunPoints.pen.indicators(ctx)
        let maxDepth = this.depth
        let deepColor = 200

        this.spunPoints.forEach((p, i)=>{
            let z = p.z
            let red = deepColor - ((z / maxDepth) * deepColor)
            let color = p.color
            if(i == 0) { color = 'red'}
            // let colorBlue = "hsl(184 50% 40%)"
            // let colorRed = "hsl(0 66% 40%)"
            // let color = `hsl(${red} 66% 35%)`
            p.pen.fill(ctx)
            // p.pen.fill(ctx, color)
        })
    }
}


;stage = MainStage.go();