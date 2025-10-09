/*
title: Tethered Controller Point
categories: binding
files:
    head
    point
    pointlist
    mouse
    stage
    dragging
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/tethers.js
    ../point_src/stage-clock.js
    stroke
---

*/
addButton('Add Point',{
    onclick(){
        stage.addNewPoint()
    }
})


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        // this.createPoints()
        // this.dragging.add(...this.points, ...this.controlPoints)
        this.point = new Point(200, 200, 100)
        this.lastDiff = this.point.radians
        this.point.rotationSet = (v) => {
            let p = this.points[0]
            let diff = radiansDiff2(this.point.radians, this.lastDiff)
            p.xy = originRotate(p, this.point, radiansToDegrees(diff))
            this.lastDiff = this.point.radians
        }
        this.points = new PointList
        this.dragging.add(this.point)
        this.addNewPoint()
        this.addNewPoint()
    }

    addNewPoint() {
        let pos = random.within(this.point, 1)
        let cp = new Point(pos)
        this.points.push(cp)
        this.dragging.add(cp)
    }

    draw(ctx){
        this.clear(ctx)
        let p = this.point
        p.pen.indicator(ctx, {color: '#336600'})
        this.points.pen.indicator(ctx, {color: '#336600'})
    }
}



;stage = MainStage.go();