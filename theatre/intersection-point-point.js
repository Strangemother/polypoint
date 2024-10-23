

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


function quantizeNumber(value, quantize=1) {
  const quantizedValue = Math.round(value / quantize) * quantize;
  return quantizedValue;
}



class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.pointA = new Point({x:200,y:200, radius:90})
        this.pointB = new Point({x:390,y:240, radius:130})
        this.dragging.addPoints(this.pointA, this.pointB)
        this.events.wake()

    }

    draw(ctx){
        this.clear(ctx)

        this.pointA.pen.indicator(ctx)
        this.pointB.pen.indicator(ctx, {color: this.pointB.color})

        let i2 = getCircleCircleIntersections(this.pointA, this.pointB)
        if(i2.length > 0) {

            i2.forEach((xy)=>{
                let iPoint = (new Point).copy(xy).update({radius: 5})
                // iPoint.radius = 30
                iPoint.pen.fill(ctx, '#CC00BB')
            })
        }
    }
}


;stage = MainStage.go();