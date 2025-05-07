/*
---
title: Arc Angle
category: angles
    arcs
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
    ../point_src/curve-extras.js
 */

aa = new Angle(20, 'tau')
// ab = new Angle(20).tau


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.a = new Point({x:200, y:200, radius: 20, rotation: 0})
        this.b = new Point({x:100, y:200, radius: 20, rotation: 270})
        this.c = new Point({x:200, y:300, radius: 20, rotation: 282})
        this.d = new Point({x:130, y:130, radius: 20, rotation: 282})

        this.lineA = new Line(this.a, this.b)
        this.lineB = new Line(this.c, this.d)

        this.dragging.addPoints(this.a, this.b, this.c, this.d)

    }

    draw(ctx){
        this.clear(ctx)
        let a = this.a;
        let b = this.b;
        let c = this.c;
        let d = this.d;

        let primaryColor = '#CCC'
        let secondaryColor = '#444'
        let size = 30


        a.pen.indicator(ctx)
        b.pen.indicator(ctx, {color: 'red'})
        c.pen.indicator(ctx, {color: 'red'})
        d.pen.indicator(ctx)

        /* Draw an arc from rotation of `a` to rotation `b` */
        a.pen.arc(ctx, b, primaryColor, size, 2, 0)
        // a.pen.arc(ctx, b, secondaryColor, size, 2, 1)

        this.lineA.render(ctx)
        this.lineB.render(ctx)
    }
}


;stage = MainStage.go();