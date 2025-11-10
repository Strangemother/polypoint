/*
title: Bridged Loop Connection
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
                        [250 , 50, 20, 40]
                        , [250 , 170, 20, -90]
                        , [250 , 290, 20, -90]
                    ).cast()
        this.dragging.add(...this.points)
    }

    draw(ctx){
        ctx.fillStyle = '#444'
        this.clear(ctx)
        this.tick += 1
        let ps = this.points
        let tips = ps[0].split(2, Math.PI, Math.PI*.5)
        let tips1 = ps[1].split(2, Math.PI, Math.PI*.5)
        let tips2 = ps[2].split(2, Math.PI, Math.PI*.5)

        // ps[0].pen.line(ctx, tips[0])
        // tips[1].pen.line(ctx, ps[2])

        ;(new PointList(...tips, ...tips1, ...tips2)).pen.quadCurve(ctx, undefined,1)

        ctx.fill()
        tips.pen.indicator(ctx, 'green')
        tips1.pen.indicator(ctx, 'green')
        tips2.pen.indicator(ctx, 'green')
        ps.pen.indicator(ctx, 'green')
        // ps.pen.line(ctx, 'green')
        // ps.pen.quadCurve(ctx)
    }
}

stage = MainStage.go(/*{ loop: true }*/)
