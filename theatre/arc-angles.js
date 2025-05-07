/*
---
title: Arc Angle
categories:
    arc
    angles
files:
    head
    stroke
    ../point_src/point-content.js
    pointlist
    point
    ../point_src/protractor.js
    mouse
    dragging
    ../point_src/functions/clamp.js
    stage
    ../point_src/angle.js
    ../point_src/text/label.js
 */

// aa = new Angle(20, 'tau')
// ab = new Angle(20).tau


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.a = new Point({x:200, y:200, radius: 100, rotation: 0})
        this.b = new Point({x:200, y:200, radius: 100, rotation: 270})
        this.dragging.addPoints(this.a, this.b)

    }

    draw(ctx){
        this.clear(ctx)
        let a = this.a;
        let b = this.b;
        // a.rotation += .3
        // b.rotation += .5

        let primaryColor = '#CCC'
        let secondaryColor = '#444'
        let size = 30


        /* Draw an arc from rotation of `a` to rotation `b` */
        a.pen.arc(ctx, b, primaryColor, size, 2, 0)
        a.pen.arc(ctx, b, secondaryColor, size-10, 2, 1)

        b.pen.arc(ctx, a, secondaryColor, size, 2, 0)

        a.pen.indicator(ctx)
        b.pen.indicator(ctx)
    }
}


;stage = MainStage.go();