/*
    title: Stroke Style Examples
    categories: strokes
    files:
        ../point_src/logging/logger.js
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

 */
class MainStage extends Stage {
    canvas='playspace'
    // live=false
    live = true

    mounted(){
        this.pa = new Point(150, 150, 100, 90)

        this.lineStroke = new Stroke({
            color: 'green'
            , width: 5
            , dash: [7, 4]
            , march: .3
        })

    }

    draw(ctx){
        this.clear(ctx)
        let pos = this.mouse.position
        pos.pen.circle(ctx)

        let lineStroke = this.lineStroke

        lineStroke.step()
        lineStroke.set(ctx)
        this.pa.pen.indicator(ctx)
        lineStroke.unset(ctx)

    }
}

;stage = MainStage.go();