/*
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/mirror.js
    ../point_src/stage.js

 */
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
        let _b = new Point({x:350, y:300, radius: 20})
        let _c = new Point({x:245, y:500, radius: 20})
        // let _d = new Point({x:270, y:550, radius: 20})
        this.points = new PointList(_a,_b, _c)
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
        // this.mirror.reflect(this.other).pen.indicator(ctx, {color: '#AAA'})
        this.mirror.reflect(this.other).pen.indicators(ctx, {color: '#AAA'})
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