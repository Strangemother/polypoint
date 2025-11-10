/*
title: Vector Point Object
files:
    ../point_src/random.js
    ../point_src/tethers.js

Apply _vector Arrows_ as from the point center, to the _tip_.

    vp = new VectorPoint(100,200)
    vp.addNewPoint()
    vp.render(ctx)
 */
class VectorPoint extends Point {

    addNewPoint(pos=random.within(this, 1)) {
        // let pos = random.within(this, 1)
        let cp = this.tethers.add(pos)
        return cp
    }

    render(ctx, style={color:'#880000', width: 2}){
        let p = this

        // if(this.clock.tick % 1 == 0) {
            this.tethers.step()
        // }

        this.pen.indicator(ctx, {color: '#336600'})
        this.tethers.points.forEach((tp)=>{
            this.pen.line(ctx, tp, style.color, style.width)
        });

        this.renderTip(ctx, style)
        this.renderText(ctx)
    }

    renderTip(ctx, style){
        let cp = this.getTip()
        // let cp = this.tethers.points[0]
        let angle = this.directionTo(cp)
        // p.tethers.points[0].radians
        cp.pen.ngon(ctx, 3, cp.radius, true, style.color, style.width, angle)

        ctx.fillStyle = style.color
        ctx.fill()

    }

    getTip() {
        return this.tethers.points[0]
    }

    getComputed() {
        let cp = this.getTip()
        let t2d = this.distance2D(cp)
        // t2d = [t2d.x/10, t2d.y/10]
        return t2d;
    }

    setComputed(pos, relative=true) {
        let cp = this.getTip()
        let t2d
        if(relative) {
            t2d = (new Point(pos))
        } else {
            t2d = (new Point(pos)).multiply(10)
        }
        // console.log(t2d.xy)
        // t2d = [t2d.x * 10, t2d.y * 10]
        cp.controlPointsDistance = t2d
        return t2d;
    }

    renderText(ctx) {
        ctx.fillStyle = '#DDD'
        let t2d = this.getComputed()
        let t2ds = `x=${t2d.x} y=${t2d.y}`
        this.text.label(ctx, t2ds, new Point([0, -10]))
    }
}
