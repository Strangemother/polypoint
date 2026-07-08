/*
---
title: Square N-Gon Bounding Box
categories: rectangles
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/protractor.js
    mouse
    dragging
    ../point_src/functions/clamp.js
    ../point_src/stage.js
    ../point_src/angle.js
    ../point_src/text/label.js
 */


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.a = new Point({x:200, y:200, radius: 100, rotation: -90})
        this.b = new Point({x:200, y:300, radius: 100, rotation: -90})
        this.c = new Point({x:400, y:400, radius: 100, rotation: -90})
        this.d = new Point({x:300, y:400, radius: 100, rotation: -90})
        this.e = new Point({x:400, y:400, radius: 100, rotation: -90})
        this.f = new Point({x:400, y:400, radius: 100, rotation: -90})

        this.dragging.add(
            this.a,
            this.b,
            this.c,
            this.d,
            this.e,
            this.f,
            )
        // this.a.rotation -= 20
    }

    draw(ctx){
        this.clear(ctx)
        let a = this.a
        let b = this.b
        let c = this.c
        let d = this.d
        let e = this.e
        let f = this.f

        // a.rotation = b.rotation = c.rotation = d.rotation = e.rotation = f.rotation -= .1

        // a.pen.ngon(ctx, 4, a.radius * 1.4, true, '#eee', 2, degToRad(a.rotation))
        // a.pen.circleGon(ctx, 100, .01, true)
        // a.pen.arc(ctx, this.b, 'red', 100, 2)

        // a.pen.circle(ctx, undefined, '#333', 1)
        a.pen.indicator(ctx, {color: '#333'})
        /* An ngon can be projected and rotated.*/
        a.pen.ngon(ctx, 4, a.radius, true, '#33AAEE', 2, degToRad(a.rotation))

        ctx.strokeStyle = 'yellow'

        b.pen.indicator(ctx, {color: '#333'})

        /* A plain box */
        b.pen.box(ctx)

        c.pen.indicator(ctx, {color: '#333'})

        c.pen.box(ctx, undefined, undefined, undefined, a.radians)

        // d.pen.indicator(ctx, {color: '#333'})
        // d.pen.rect(ctx, undefined, undefined, '#880000', 2)

        // e.pen.indicator(ctx, {color: '#333'})
        // e.pen.rect(ctx, undefined, undefined, '#880000', 2, {
        //                 x: (e.radius) * -.5
        //                 , y: (e.radius) * -.5
        //             })

        // f.pen.indicator(ctx, {color: '#333'})

        // f.pen.rect(ctx, e.radius, e.radius * .5, '#880000', 2, {
        //                 x: e.radius * -.5
        //                 , y: e.radius * -.25
        //             })

        // d.pen.line(ctx, undefined, 'red')
        // a.pen.indicator(ctx)
        // ctx.fill()
    }
}


;stage = MainStage.go();