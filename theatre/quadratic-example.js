/*
title: Quadratic Bezier Curve
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
        this.pointA = new Point(100, 100, 5)
        this.pointB = new Point(250, 250, 5)
        this.pointC = new Point(350, 120, 5)
        this.controlPointA = new Point(230, 150, 5)
        this.controlPointB = new Point(270, 400, 5)

        this.dragging.add(
                this.pointA
                , this.pointB
                , this.pointC
                , this.controlPointA
                , this.controlPointB
            )
    }

    draw(ctx){
        this.clear(ctx)
        let pa = this.pointA;
        let pb = this.pointB;
        let pc = this.pointC;
        let cpa = this.controlPointA;
        let cpb = this.controlPointB;

        let c = '#aa0077'

        pa.pen.fill(ctx, c)
        // pb.pen.fill(ctx, c)
        pc.pen.fill(ctx, c)

        cpa.pen.circle(ctx)
        cpb.pen.circle(ctx)

        ctx.strokeStyle = c;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.quadraticCurveTo(cpa.x, cpa.y, pb.x, pb.y);
        ctx.quadraticCurveTo(cpb.x, cpb.y, pc.x, pc.y);
        ctx.stroke();


    }

}


;stage = MainStage.go()