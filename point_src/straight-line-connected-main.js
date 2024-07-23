
class Line {
    constructor(p1, p2, color='red', width=1){
        // new Line([90, 130], [200, 300], 420)
        this.a = point(p1)
        this.b = point(p2)
        this.color = color
        this.width = width
    }

    draw(ctx, color=undefined) {
        ctx.beginPath();

        let a = this.a;
        let b = this.b;
        ctx.moveTo(a[0], a[1])
        ctx.strokeStyle = color == undefined? this.color: color
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
                name: "a"
                , rotation: c.right
                , x: offset(), y: globalY
            })
            , new Point({
                name: "b"
                , rotation: c.left // RIGHT_DEG
                , x: offset(), y: globalY + 50
            })
        )

        this.points.setMany(20, 'radius');

        this.line = new Line([100, 200], [200, 200], 'green', 2)

    }


    draw(ctx){
        this.clear(ctx)

        // this.line.draw(ctx)
        this.drawPoints(ctx)
        // this.drawRandomLine(ctx)
        //

        /* Draw a line from center to center.*/
        let line = new Line(this.points[0], this.points[1], 'green', 2)
        line.draw(ctx, 'red')

        /* Draw a line from the point, projected from the center (by 1)*/
        let pLine = new Line(this.points[0].project(), this.points[1].project(), 'pink', 1)
        pLine.draw(ctx)

        this.points[0].rotation += .7
        this.points[1].rotation -= .5
    }

    /* Draw all the `this.points` as indicators.
    Currently this is two points.*/
    drawPoints(ctx) {

        for(let p in this.points) {
            let point = this.points[p]
            point.pen?.indicator(ctx, {color: 'green'})
        }

        this.points.draw.pointLine(ctx)
    }

    /* draw a randomly generated line path
    And draw a line from tip to tip */
    drawRandomLine(ctx){

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
