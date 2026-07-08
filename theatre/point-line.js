/*
title: Point to Line Projection
*/

class Line {
    constructor(p1, p2, color='red', width=1){
        // new Line([90, 130], [200, 300], 420)
        this.a = point(p1)
        this.b = point(p2)
        this.color = color
        this.width = width
    }

    draw(ctx) {
        ctx.beginPath();

        let a = this.a;
        let b = this.b;
        ctx.moveTo(a[0], a[1])
        ctx.strokeStyle = this.color
        ctx.lineWidth = this.width == undefined? 1: this.width
        ctx.lineTo(b[0], b[1])

        ctx.stroke()
    }
}



const randomPoints = PointList.generate.random(4, 200)


const UNSET = {}


const quickStroke = function(ctx, color='green', lineWidth=UNSET) {
    ctx.strokeStyle = color
    if(lineWidth != UNSET) {
        ctx.lineWidth = lineWidth
    }
    ctx.stroke()
}


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        let cumX = 0
            , cumOffset = 120
            , globalY = 100
            , offset = ()=> cumX+=cumOffset
            , c = this.compass
            ;

        this.points = new PointList(
            new Point({
                name: "up"
                , rotation: c.up // UP_DEG
                , x: offset(), y: globalY
            })
            , new Point({
                name: "right"
                , rotation: c.right // RIGHT_DEG
                , x: offset(), y: globalY
            })
            , new Point({
                name: "down"
                , rotation: c.down // DOWN_DEG
                , x: offset(), y: globalY
            })
            , new Point({
                name: "left"
                , rotation: c.left // LEFT_DEG
                , x: offset(), y: globalY
            })
            , new Point({
                name: "spinner"
                , x: offset(), y: globalY
            })
        )

        this.points.setMany(20, 'radius');

        this.line = new Line([100, 200], [200, 200], 'green', 2)

    }


    draw(ctx){
        this.clear(ctx)

        this.line.draw(ctx)
        this.drawPoints(ctx)
        this.drawRandomLine(ctx)
    }

    drawPoints(ctx) {
        this.points.last().rotation += 2
        for(let p in this.points) {
            this.points[p].pen.indicator(ctx)
        }

    }

    drawRandomLine(ctx){
        /* draw a randomly generated line path */

        /* Draw the horizon line - a straight project from A to B*/
        ctx.beginPath();
        randomPoints.draw.horizonLine(ctx)
        quickStroke(ctx, 'red')

        /* Draw each point as a line to its next sibling.*/
        randomPoints.draw.pointLine(ctx)
        quickStroke(ctx, 'teal', 2)
    }

}

stage = MainStage.go(/*{ loop: true }*/)
