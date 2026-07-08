/*
title: Quadratic Curve Drawing
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/extras.js
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/functions/clamp.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/split.js
    ../point_src/curve-extras.js



 */
class MainStage extends Stage {
    canvas='playspace'
    // live=false
    live = true
    mounted(){
        // this.pa = new Point(150, 150, 100, 90)

        this.ma = new Point(300, 400, 100)
        this.mb = new Point(600, 400, 100)

        let lpoints = [this.ma, this.mb]

        this.line = new QuadraticCurve(...lpoints)
        this.projection = this.ma.project()

        this.lineStroke = new Stroke({
            color: 'green'
            , width: 5
            , dash: [7, 4]
        })

        this.strokes.create('line', {
            color: 'green'
            , width: 5
            , dash: [7, 4]
        })

        this.dragging.add(this.ma, this.mb, this.projection)
    }

    coupling() {
        this.ma.lookAt(this.projection)
        this.ma.radius = this.ma.distanceTo(this.projection)
        // this.mb.rotation = this.ma.rotation + 180
    }

    updateTip() {
        let { dx, dy } = get_bezier_derivative(this.ma
                                    , this.projection
                                    , this.mb, this.mb, .9)
        this.mb.radians = Math.atan2(dy, dx);
    }

    draw(ctx){
        this.clear(ctx)
        this.coupling()
        let pos = this.mouse.position
        pos.pen.circle(ctx)

        this.ma.pen.indicator(ctx)
        this.mb.pen.indicator(ctx)

        this.projection.pen.fill(ctx, '#33DDAA')

        let lineStroke = this.lineStroke
        // // lineStroke.set(ctx)
        // this.strokes.set('line')
        // this.line.render(ctx)
        // this.strokes.unset('line')
        // // lineStroke.unset(ctx)

        // let off = this.strokes.line()
        // this.line.render(ctx)
        // off()

        this.strokes.line(()=>this.line.render(ctx))

    }
}

;stage = MainStage.go();