

/* Discover the intersection of two straight _lines_, the returned point
will be the intersection of those lines.

A line is a list of two points [{x:10, y:10}, {x:50, y:50}]

        lineA = new PointList(
                new Point({x:406, y:76, radius: 20})
                , new Point({x:145, y:397, radius: 20})
            )

        lineB = new PointList(
                new Point({x:206, y:176, radius: 20})
                , new Point({x:245, y:297, radius: 20})
            )

        checkLinesIntersection(lineA, lineB)

We can project (at a length) from line a _through_ line b, essentially as a
ray beam for a defined distance.

    checkLinesIntersection(lineA, lineB, 400)

When ray projecting, the _lineB_ is essentially a _direction_ rather than just
a collision.
*/

class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.lineA = new PointList(
                new Point({x:406, y:76, radius: 20})
                , new Point({x:145, y:397, radius: 20})
            )

        this.lineB = new PointList(
                new Point({x:206, y:176, radius: 20})
                , new Point({x:245, y:297, radius: 20})
            )

        this.dragging.addPoints(...this.lineA, ...this.lineB)

        let l = new Label(this.ctx, {
            text: 'Milkshake before breakfast.'
            , fontSize: 14
            // , fontName: 'barlow'
            // , fontName: 'Arial'
            // , fillStyle: 'green'
        })
        l.position = new Point(100, 100)
        l.position.rotation = 0 // l.position.radians % Math.PI
        this.l = l

    }

    draw(ctx){
        this.clear(ctx)

        this.lineA.pen.line(ctx)
        this.lineB.pen.line(ctx)

        let int = checkLinesIntersection(this.lineA, this.lineB)
        if(int) {

            let iPoint = (new Point).copy(int).update({radius: 30})
            // iPoint.radius = 30
            iPoint.pen.indicator(ctx)
        }

        this.l.text = `Denominator: ${denomText}`
        this.l.draw(ctx)
        this.dragging.drawIris(ctx)
    }
}


;stage = MainStage.go();