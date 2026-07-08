/*
title: Drag Point
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/screenshot.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/bisector.js
    ../point_src/random.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/l.js
    ../point_src/protractor.js
    # ../point_src/text/alpha.js
    # ../point_src/text/label.js
    ../point_src/text/beta.js
    ../point_src/stage.js
 */
class MainStage extends Stage {
    canvas='playspace'

    // live=false
    live = true
    mounted(){
        console.log('drag-point')
        this.spot = this.center.copy()
        this.spot.radius = 300
        this.spot.rotation = random.int(360)
        this.dragging.addPoints(this.spot)
    }

    firstDraw(ctx) {
        ctx.strokeStyle = 'yellow'
        ctx.fillStyle = '#EEE'
        ctx.font = `400 16px inter`;
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
    }

    draw(ctx){
        this.clear(ctx)
        // this.fps.drawFPS(ctx)
        this.drawCircles(ctx)
        ctx.fillStyle = '#EEE'
        this.drawIris(ctx)
    }

    drawCircles(ctx) {
        this.spot.pen.fill(ctx, '#333')
        this.spot.pen.indicator(ctx, { color: '#111'})
    }

    drawIris(ctx) {
        /* The dynamic highlighter. */
        this.dragging.drawAll(ctx)

    }

}


;stage = MainStage.go();