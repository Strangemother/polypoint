/*
title: Bridged Line Connection
categories: basic
    dragging
files:
    head
    point
    pointlist
    stage
    mouse
    dragging
    stroke
    ../point_src/constrain-distance.js
    ../point_src/split.js
---

*/


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.points = new PointList(
                        [250 , 50, 20]
                        , [250 , 170, 20, -90]
                        , [250 , 290, 20]
                    ).cast()
        this.dragging.add(...this.points)
    }

    draw(ctx){
        this.clear(ctx)
        this.tick += 1
        let ps = this.points
        let tips = ps[1].split(2, Math.PI, Math.PI*.5)

        // ps[0].pen.line(ctx, tips[0])
        // tips[1].pen.line(ctx, ps[2])

        ;(new PointList(ps[0], ...tips, ps[2])).pen.quadCurve(ctx, undefined,)

        tips.pen.indicator(ctx, 'green')
        ps.pen.indicator(ctx, 'green')

        // ps.pen.line(ctx, 'green')
        // ps.pen.quadCurve(ctx)
    }
}

stage = MainStage.go(/*{ loop: true }*/)
