/*
title: Filled Flower Shape
src_dir: ../point_src/
categories: curve
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
    ../point_src/gradient.js
    ../point_src/jiggle.js

---

*/


class MainStage extends Stage {
    canvas='playspace'
    live = true

    mounted(){
        this.point = this.center.copy()
        this.generate()
        this.dragging.add(this.point)
        this.lineStroke = new Stroke({
            color: '#fff'
            , width: 2
            , dash: [7, 4]
        })

        this.events.wake()
    }

    onEmptyDown(){
        this.generate()
    }

    generate() {

        /* The general radius of the flower. */
        let radius = random.int(5, 80)
        /* A count of petals. */
        let count = random.int(5, 20)
        /* The size of petals (Their point radius) */
        let size = radius * 3 // random.int(100, 200)
        /* We copy the center point to save keystrokes. */
        let p = this.point.update({radius})

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
            line.doTips = false;
            lines.push(line)
        }

        this.grad = this.setupGradient(this.point,size)
    }

    setupGradient(p, size) {
        var g = new Gradient(null, 'Linear', [p.add(size * .5), p.subtract(size * .5)])
        g.addStops({
            0: "hsl(244deg 71% 56%)"
            , 1: "hsl(299deg 62% 44%)"
        })
        return g
    }

    draw(ctx){
        this.clear(ctx)
        // this.points.pen.indicator(ctx, {color: '#336600'})
        ctx.fillStyle = this.grad.getObject(ctx)

        let lineStroke = this.lineStroke
        lineStroke.set(ctx)

        /* In this case we don't use the l.render(ctx).
        Instead we do the .perform(ctx) method to manally
        open and close the path.

        This ensures we draw one vector object, rather than
        many smaller paths. */
        this.lines[0].start(ctx)
        this.lines.forEach((l)=>{
            // l.start(ctx);
            l.perform(ctx);
        });

        ctx.fill()

        this.lines[this.lines.length-1].close(ctx)
        lineStroke.unset(ctx)

        /* The center point. */
        this.point.pen.fill(ctx, 'orange')


    }
}

// ;stage = MainStage.go();
;stage = MainStage.announce();
