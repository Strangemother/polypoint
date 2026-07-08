/*
title: Coupled Lines
category: binding
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
    ../point_src/curve-extras.js
---

*/
class MainStage extends Stage {
    canvas='playspace'
    // live=false
    live = true

    mounted(){
        this.pa = new Point(150, 150, 100, 90)

        this.ma = new Point(300, 400, 100)
        this.mb = new Point(300, 400, 100)

        this.pb = new Point(500, 600, 100, 270)

        let lpoints = [this.pa, this.ma]
        let lpoints2 = [this.mb, this.pb]
        this.line = new BezierCurve(...lpoints)
        this.line2 = new BezierCurve(...lpoints2)

        this.projection = this.ma.project()
        this.projection2 = this.mb.project()

        this.lineStroke = new Stroke({
            color: 'green'
            , width: 5
            , dash: [7, 4]
        })

        this.dragging.add(this.ma, this.mb,
                          this.pa, this.pb,
                          this.projection, this.projection2)
    }

    coupling() {
        this.ma.lookAt(this.projection)
        this.mb.rotation = this.ma.rotation + 180
    }

    draw(ctx){
        this.clear(ctx)
        this.coupling()
        let pos = this.mouse.position
        pos.pen.circle(ctx)

        this.ma.pen.indicator(ctx)
        this.mb.pen.indicator(ctx)

        this.pa.pen.indicator(ctx)
        this.pb.pen.indicator(ctx)

        this.projection.pen.fill(ctx, '#33DDAA')

        let lineStroke = this.lineStroke
        lineStroke.set(ctx)

        this.line.render(ctx)
        this.line2.render(ctx)
        lineStroke.unset(ctx)

    }
}

;stage = MainStage.go();