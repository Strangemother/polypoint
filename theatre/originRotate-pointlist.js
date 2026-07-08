/*
title: PointList Origin Rotation
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
        this.points = new PointList
        this.point = new Point(200, 200, 100)

        // this.point.rotationSet = (v) => {
        //     this.points.handleRotate(this.point)
        // }

        this.dragging.add(this.point)
        this.addNewPoint()
        this.addNewPoint()
    }

    addNewPoint() {
        let pos = random.within(this.point, 1)
        let cp = new Point(pos)
        this.points.push(cp)
        this.dragging.add(cp)
        return cp
    }

    draw(ctx){
        this.clear(ctx)

        this.points.handleRotate(this.point)

        this.point.pen.indicator(ctx, {color: '#336600'})
        this.points.pen.indicator(ctx, {color: '#336600'})
    }
}



;stage = MainStage.go();