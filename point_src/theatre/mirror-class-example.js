
class MainStage extends Stage {
    canvas='playspace'

    // live=false
    live = true
    mounted(){
        this.createPoints()

        this.dis = new Dragging
        this.dis.initDragging(this)
        this.dis.addPoints(...this.points, this.origin, this.other)

        this.mirror = new Mirror(this.points)
        this.mirror.add(this.origin)
    }

    createPoints(){
        let _a = new Point({x:406, y:76, radius: 20})
        let _b = new Point({x:145, y:397, radius: 20})
        this.points = new PointList(_a,_b)
        this.origin = new Point({x: 156, y: 135, radius: 20})
        this.other = new Point({x: 150, y:150, radius: 20})
    }

    draw(ctx){
        this.clear(ctx)

        this.drawMirror(ctx)
        this.drawCircles(ctx)
        this.drawIris(ctx)
    }

    drawMirror(ctx) {
        /* Must be called at some point to update the mirror points. */
        this.mirror.step();
        /* Draw the optional contents of the mirror */
        this.mirror.draw(ctx);
        /* We can also use the reflect method for an immediate point: */
        this.mirror.reflect(this.other).pen.indicator(ctx, {color: '#AAA'})
    }

    drawCircles(ctx) {
        this.origin.pen.indicator(ctx, {color:'green'})
        this.other.pen.indicator(ctx, {color:'#555'})
    }

    drawIris(ctx) {
        /* The dynamic highlighter. */
        let p = this.dis.getPoint();
        if(p) {
            p.pen.circle(ctx)
        }
    }
}


;stage = MainStage.go();