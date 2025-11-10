/*
title: Tethered Polygon Shape
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
        this.dragging.add(this.point)
        this.addNewPoint()
        this.addNewPoint()
    }

    addNewPoint() {
        let pos = random.within(this.point, 1)
        let cp = this.point.tethers.add(pos)
        this.dragging.add(cp)
    }

    draw(ctx){
        this.clear(ctx)
        let p = this.point
        let ps = p.tethers.points
        if(this.clock.tick % 1 == 0) {
            p.tethers.step()
        }

        p.pen.indicator(ctx, {color: '#336600'})
        ps.forEach((tp)=>{
            p.pen.line(ctx, tp, '#880000', 2)
        });

        // p.tethers.points.pen.fill(ctx, '#33DDAA')
        ps.pen.indicator(ctx, '#33DDAA')
        ps.pen.quadCurve(ctx, {color: '#33DDAA', loop: true})
    }
}



;stage = MainStage.go();