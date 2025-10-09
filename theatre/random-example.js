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
    stroke
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/functions/range.js
    ../point_src/tethers.js
    ../point_src/stage-clock.js
---

*/
addButton('Add Random',{
    onclick(){
        range(100).forEach(()=>{
            stage.addNewPoint()
        })
    }
})

addButton('Add Guassian',{
    onclick(){
        // stage.addNewPoint()
        range(100).forEach(()=>{
            stage.addGaussianNewPoint()
        })
    }
})


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.point = this.center.copy().update({radius: 100})
        this.points = new PointList()
        this.dragging.add(this.point)
        this.addGaussianNewPoint()
        this.addGaussianNewPoint()
    }

    addNewPoint() {
        let p = new Point(random.within(this.point, .5))
        p.radius = 3
        this.points.push(p)
        // this.dragging.add(p)
    }

    addGaussianNewPoint() {
        let r = this.point.radius
        let p = this.point.copy().update({radius: 3})
        p.x += random.gaussian(0, r*.5, 0, .5)
        p.y += random.gaussian(0, r*.5, 0, .5)
        this.points.push(p)
        // this.dragging.add(p)
    }

    draw(ctx){
        this.clear(ctx)
        let p = this.point
        p.pen.indicator(ctx, {color: '#336600'})
        this.points.pen.fill(ctx, {color: '#336600'})
    }
}



;stage = MainStage.go();