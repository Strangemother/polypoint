/*
title: Tethered Controller Point
categories: binding
files:
    head
    point
    pointlist
    mouse
    stroke
    stage
    dragging
    ../point_src/random.js
    ../point_src/distances.js
    # ../point_src/tethers-xy.js
    ../point_src/tethers-vec.js
    ../point_src/stage-clock.js
    ../point_src/protractor.js
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
        const p = this.point = new Point(200, 200, 100)
        this.dragging.add(p)
        const c = this.addNewPoint()
        // this.addNewPoint()
        // this.point.rotationSet = function(){
        //     // let v = p.getTheta(c, -p.radians) % Math.PI2
        //     let v = calculateAngle180(p, c);
        //     // v = calculateInverseAngle180(p, c);
        //     // v = calculateAngle360(p, c)
        //     console.log(v)
        // }

    }

    addNewPoint() {
        let pos = random.within(this.point, 1)
        let cp = this.point.tethers.add(pos)
        this.dragging.add(cp)
        return cp
    }

    draw(ctx){
        this.clear(ctx)
        let p = this.point
        if(this.clock.tick % 1 == 0) {
            p.tethers.step()
        }

        p.pen.indicator(ctx, {color: '#336600'})

        p.tethers.points.forEach((tp)=>{
            p.pen.line(ctx, tp, '#880000', 2)
        });

        p.tethers.points.pen.fill(ctx, '#33DDAA')
        // p.tethers.points.pen.line(ctx,{color: '#33DDAA'})
        // p.tethers.points.pen.(ctx,{color: '#33DDAA'})
    }
}



;stage = MainStage.go();