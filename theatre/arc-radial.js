/*
---
title: Radial Arc Drawing
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
    ../point_src/arc.js
    ../point_src/protractor.js
 */

// aa = new Angle(20, 'tau')
// ab = new Angle(20).tau


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.centerPoint = new Point({x:200, y:200, radius: 100, color: '#666'})
        this.fromPoint = new Point({x:100, y:300})
        this.toPoint = new Point({x:350, y:150})
        this.dragging.addPoints(this.centerPoint
                                , this.fromPoint
                                , this.toPoint)

    }

    draw(ctx){
        this.clear(ctx)
        // a.rotation += .3
        // b.rotation += .5
        ctx.fillStyle = '#555'
        ctx.strokeStyle = 'orange'

        let primaryColor = '#CCC'
        let secondaryColor = '#444'
        let size = 30

        /* Draw an arc from rotation of `a` to rotation `b` */
        // centerPoint.pen.arc(ctx, b, primaryColor, size, 2, 0)
        // let a = this.a;
        // let b = this.b;
        // a.pen.arc(ctx, b, secondaryColor, size-10, 2, 1)
        // b.pen.arc(ctx, a, secondaryColor, size, 2, 0)


        this.centerPoint.pen.indicator(ctx)
        // this.centerPoint.pen.line(ctx, undefined, 'red')
        this.fromPoint.pen.indicator(ctx, {color: 'red'})
        this.toPoint.pen.indicator(ctx)

        // this.drawA(ctx)
        // this.drawB(ctx)
        this.drawC(ctx)
        // this.drawD(ctx)
        // this.drawE(ctx)
        // this.drawF(ctx)
    }


    drawC(ctx){

        // let arcPlot = arcFromTo(this.centerPoint, this.fromPoint, this.toPoint)
        /* Get the arc angle drawn */
        let dis = Math.min(200, this.fromPoint.distanceTo(this.toPoint))
        let p2 = getRadiusPlot(this.fromPoint, this.toPoint, dis)
        if(!p2) {return}
        // Point.from(p2[1]).pen.indicator(ctx)
        let c = Point.from(p2[0])
        let c2 = Point.from(p2[1])
        c.radius = c2.radius = dis
        c.pen.circle(ctx, {color: "#333"})
        c2.pen.circle(ctx, {color: "#333"})

        let arcPlot = arcFromTo(c, this.fromPoint, this.toPoint)
        penArcPlot(arcPlot, ctx, 'orange')

        // let arcPlot2 = arcFromTo(c2, this.fromPoint, this.toPoint)
        // penArcPlot(arcPlot2, ctx, 'orange')

        let arcPlot2 = arcFromTo(c2, this.toPoint, this.fromPoint)
        penArcPlot(arcPlot2, ctx, 'orange')

    }

}


;stage = MainStage.go();