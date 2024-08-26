class MainStage extends Stage {
    canvas='playspace'

    // live=false
    live = true
    mounted(){
        this.spot = this.center.copy()
        this.spot.radius = 50
        this.dragging.addPoints(this.spot)
    }

    draw(ctx){
        this.clear(ctx)
        // this.fps.drawFPS(ctx)
        this.drawCircles(ctx)
        this.drawIris(ctx)
    }

    drawCircles(ctx) {
        this.spot.pen.fill(ctx, '#660000')
        this.spot.pen.indicator(ctx, { color: '#330000'})
    }

    drawIris(ctx) {
        /* The dynamic highlighter. */
        let p = this.dragging.getPoint();
        if(p) {
            p.pen.circle(ctx)
        }
    }

    // onDragMove(ev) {
    //     this.dis.applyXY(ev.x, ev.y)
    // }
}


;stage = MainStage.go();