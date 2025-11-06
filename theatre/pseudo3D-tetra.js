/*
---
title: 3D Tetrahedron
categories: pseudo3D
files:
    head
    stage
    point
    pointlist
    mouse
    ../point_src/rotate.js
    stroke
    ../point_src/distances.js
    ../point_src/dragging.js
    ../theatre/objects/tetra.js

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
        let depth = this.depth = 900
        let count = 500
        let size = 290
        // this.points = PointList.from(generateRadialTetrahedronMesh(500, 200).points).cast()
        this.points = PointList.from(generateFlatTetrahedronMesh(500, 400).points).cast()
        // this.points = PointList.from(generateSquarePyramidMesh(300, 500).points).cast()

        this.points.each.radius = 2
        // this.projectionPoint = this.points.center.copy()
        this.projectionLength = 800
        this.perspectiveCenter = this.center.copy()

        this.rotSize = 0
        this.performSpin = false
        this.zFix = true
        let stage = this;
    }


    step(){
        let spin = this.spin = {
                x: this.rotSize - 100
                , y:  this.rotSize
                , z: -this.rotSize
            }

        this.spunPoints = this.points.pseudo3d.perspective(
                  this.spin
                , this.projectionPoint
                , this.projectionLength
                , this.perspectiveCenter
            )
        let maxDepth = this.depth
        let deepColor = 600
        this.zFix && this.spunPoints.sortByZ()
        this.spunPoints.forEach((p, i)=>{
            let z = p.z
            let red = deepColor - ((z / maxDepth) * deepColor)
            // let colorBlue = "hsl(184 50% 40%)"
            // let colorRed = "hsl(0 66% 40%)"
            let color = `hsl(${red} 66% 35%)`
            p.color = color
        })
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
        let deepColor = 900

        this.spunPoints.forEach((p, i)=>{
            let z = p.z
            let red = deepColor - ((z / maxDepth) * deepColor)
            let color = p.color
            if(i == 0) { color = 'red'}
            // let colorBlue = "hsl(184 50% 40%)"
            // let colorRed = "hsl(0 66% 40%)"
            // let color = `hsl(${red} 66% 35%)`
            p.pen.fill(ctx, color)
        })
    }
}


;stage = MainStage.go();