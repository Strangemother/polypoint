

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

let denomText = 'nothing'

const checkLinesIntersection = function(line, otherLine, length) {
    const x1 = line[0].x;
    const y1 = line[0].y;


    // Normalize the direction vector (end - start) and apply the length
    const dx = line[1].x - x1;
    const dy = line[1].y - y1;
    const magnitude = Math.sqrt(dx * dy + dy * dy);

    let directionX = dx
    let directionY = dy

    if(length!== undefined) {
        directionX = (dx / magnitude) * length;
        directionY = (dy / magnitude) * length;
    }

    const x2 = line[0].x + directionX;
    const y2 = line[0].y + directionY;

    const x3 = otherLine[0].x;
    const y3 = otherLine[0].y;

    const x4 = otherLine[1].x;
    const y4 = otherLine[1].y;

    /* with two parallel lines, the denominator is zero */
    const denominator = getDenominator(x1, y1, x2, y2, x3, y3, x4, y4)
    denomText = denominator
    if (denominator === 0) return false; // Parallel lines

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

    if (t > 0 && t < 1 && u > 0 && u < 1) {
        const intersectX = x1 + t * (x2 - x1);
        const intersectY = y1 + t * (y2 - y1);

        // Calculate the angle from the intersection point to the start of otherLine
        // const angleRad = Math.atan2(y3 - intersectY, x3 - intersectX);

        return {
                x: intersectX
                , y: intersectY
                // , radians: angleRad
            };

        // return { x: intersectX, y: intersectY };
    }

    return false;
}


const getDotProduct = function(px, py, x1, y1, x2, y2){
    return (px - x1) * (x2 - x1) + (py - y1) * (y2 - y1);
}

const getDenominator = function(x1, y1, x2, y2, x3, y3, x4, y4) {
     return (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
 }



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