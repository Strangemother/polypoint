/*
title: Follow
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/extras.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/point.js
    ../point_src/stage.js
    mouse
    dragging
    stroke
    ../point_src/random.js
    ../point_src/text/beta.js
---

 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.point = new Point({x: 250, y: 150 , radius: 100})
        this.point2 = new Point({x: 150, y: 150 , radius: 50})
        this.dragging.add(this.point,this.point2)
    }

    onMousedown(ev) {
        this.point.rotation = random.int(360)
        this.point2.rotation = random.int(360)
    }

    draw(ctx){
        this.clear(ctx)
        ctx.strokeStyle = ctx.fillStyle = '#ddd'
        ctx.font = '22px sans-serif'

        this.point.pen.indicator(ctx)
        this.point.text.string(ctx, 'text.string')

        this.point2.pen.indicator(ctx)
        this.point2.text.label(ctx, 'text.label', {x:10, y:10})

    }
}


stage = MainStage.go(/*{ loop: true }*/)
