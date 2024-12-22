/*
title: Egg 2
src_dir: ../point_src/
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/stage-clock.js
    ../point_src/extras.js
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/functions/clamp.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/curve-extras.js
    ../point_src/split.js

---

 */
class MainStage extends Stage {
    canvas='playspace'
    live = true

    mounted(){
        this.generate()
        this.dragging.add(...this.points)
        this.lineStroke = new Stroke({
            color: '#fff'
            , width: 2
            , dash: [7, 4]
        })

        this.events.wake()
    }

    onMouseUp(){
        this.generate()
    }
    generate() {

        /* The general radius of the flower. */
        let radius = random.int(10, 200)
        /* A count of petals. */
        let count = random.int(3, 10)
        /* The size of petals (Their point radius) */
        let size = random.int(20, 200)
        /* We copy the center point to save keystrokes. */
        let p = this.point = this.center.copy().update({radius})

        /* Split on a point, returns many points around the radius. */
        this.points = p.split(count)
        this.points.each.radius = size

        let lines = this.lines = []
        let length = this.points.length;

        /* Generate many curves. connecting pairs. */
        for (var i = 0; i < length; i++) {
            let nextValue = i + 1;
            if(nextValue == length) {
                nextValue = 0 // wrap around.
            }
            let line = new BezierCurve(this.points[i], this.points[nextValue])
            lines.push(line)
        }

    }

    draw(ctx){
        this.clear(ctx)
        this.points.pen.indicator(ctx, {color: '#336600'})

        let lineStroke = this.lineStroke
        lineStroke.set(ctx)

        this.lines.forEach((l)=>{
            l.render(ctx);
        });

        lineStroke.unset(ctx)

    }
}

;stage = MainStage.go();