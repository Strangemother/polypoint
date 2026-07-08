/*
title: Flood fill
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
    ../point_src/tethers-vec.js
    ../point_src/stage-clock.js
    stroke
---


Flood fill a PointList. In this case a range of _tethered_ points.
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
        let pos = this.center.copy()
        this.point = new Point(pos.x, pos.y, 100)
        this.dragging.add(this.point)
        this.addNewPoint(pos.x + 80,pos.y + 40)
        this.addNewPoint(pos.x,pos.y - 90)
        this.addNewPoint(pos.x - 80,pos.y + 50)
    }

    addNewPoint(...pv) {
        let pos = (pv.length > 0)? new Point(...pv): random.within(this.point, 1)
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

        // ps.pen.flood(ctx, 'purple', 'line')
        ps.pen.flood(ctx, 'purple', 'quadCurve', true)
        ps.pen.quadCurve(ctx, {color: '#5511AA', loop: true, lineWidth:3})
        // ps.pen.stroke(ctx, '#DDD')
        // ctx.fill()

        ps.pen.indicator(ctx, '#33DDAA')
    }
}



;stage = MainStage.go();