/*
categories: collisions
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    stroke
    ../point_src/point.js
    ../point_src/stage.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/functions/clamp.js
    ../point_src/dragging.js
    ../point_src/text/beta.js


*/
let rotationPoint = new Point(300, 300)


class MainStage extends Stage {
    canvas = 'playspace'
    rot = 0

    mounted(){
        this.points = new PointList(
                  [200, 300, 10, 170]
                , [200, 400, 10, 0]
                , [200, 400, 10, 0]
                , [240, 200, 10, 0]
            ).cast()
        this.dragging.add(...this.points)
    }

    firstDraw(ctx) {
        ctx.fillStyle = '#EEE'
        ctx.font = `400 16px inter`;
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
    }

    draw(ctx){
        this.clear(ctx)

        let ps = this.points;

        ps.pen.indicators(ctx)


        // p.lerp(pB).text.fill(ctx, "Fill Label")
        // p.lerp(pB).text.string(ctx, "String Label")
        let tp = ps[0].midpoint(ps[1])
        tp.lookAt(ps[1])
        tp.text.label(ctx, "Label Label")

        ps[0].pen.line(ctx, ps[1])
        ps[2].pen.line(ctx, ps[3])
        let tp2 = ps[2].midpoint(ps[3])
        tp2.text.label(ctx, "Label Label")
        /* A label, with offset. */
        ps[0].text.label(ctx, "label Label")

        ps[2].midpoint(ps[3], .3).text.string(ctx, "String Label")

    }

}


;stage = MainStage.go()