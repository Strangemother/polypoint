/*
title: Text Simple Example
categories: text
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
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
        this.pointA = new Point(200, 300, 40, 170)
        this.pointB = new Point(200, 400, 20, 0)
        this.pointC = new Point(200, 400, 20, 0)
        this.dragging.add(this.pointA, this.pointB, this.pointC)
    }

    draw(ctx){
        this.clear(ctx)

        let p = this.pointA;
        let pB = this.pointB;
        let pC = this.pointC;

        let fontSize = p.radius * .5

        ctx.fillStyle = '#EEE'
        ctx.font = `400 ${fontSize}px inter`;
        ctx.textAlign = 'left' // center
        ctx.textBaseline = 'middle'

        p.rotation += .5

        let pad = fontSize
        let x = p.radius + pad

        p.text.fill(ctx, "Fill Label", {x, y: 0})

        /* A label, with offset. */
        p.text.label(ctx, "label Label", {x, y: 0, radians: 0})


        p.pen.indicator(ctx, undefined, 'red')

        ctx.textAlign = 'center'
        ctx.font = `400 14px sans-serif`;

        pB.rotation -= .5

        pB.pen.circle(ctx, undefined, 'red')
        pB.text.offsetString(ctx, "offsetString", {x:0, y: 0, radians: 0})

        ctx.textAlign = 'right'
        pC.pen.circle(ctx, undefined, 'red')
        pC.text.offsetString(ctx, "offsetString", {x:-pC.radius - pad, y: 0, radians: 0})

        // pC.rotation -= .5
        ctx.textAlign = 'left'
        pC.text.offsetString(ctx, "offsetString", {x:pC.radius + pad, y: 0, radians: 0})
    }

}


;stage = MainStage.go()