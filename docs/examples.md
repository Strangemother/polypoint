
```js


class Line {
    constructor(p1, p2, length=100, color='red', width=1){
        // new Line([90, 130], [200, 300], 420)
        this.a = point(p1)
        this.b = point(p2)
        this.length = length
        this.color = color
        this.width = width
    }
}



/* A fixed point, as a function or new class call. */
const toy = new Point(100, 100)
const b = point(100,100);

/* A line from point to point. */
const line = new Line(point(10, 10), toy)

/* Generate a linear point list, 10 item, 20* random multiplier */
const pl = PointList.generate.list(10, 20)
/* set all points [X] value in the list to the literal Number. */
pl.setX(140)

/* Generate a list of points. 20 Random, within 500 of the origin. */
const randomLine = PointList.generate.random(20, 500)

const examples = function() {
    var toyDistance = 60
    var toyRotation = UP_DEG
    /* When projecting from a point, we gain its initial rotation,
    projecting _forward_ (relative 0). */
    toy.project(toyDistance, toyRotation).draw.arc(ctx, 3);
    toy.pen.line(ctx, Point.mouse.xy) // line from the point, to the mouse
    /* Use the same toy point for multiple draws. */
    toy.pen.circle(ctx)

    pl.draw.horizonLine(ctx)
}


```

# Polygon Point

```js

/* A single point with a radius. */
const polygonPoint = point(100, 100)
polygonPoint.radius = 30



/* Apply the position of the polypoint manually.
First get the offset mouse position,
then draw a polygon. */
let offsetMouse = Point.mouse.position.add(-polygonPoint.radius)
polygonPoint.set(offsetMouse)
polyGen(ctx, 5, polygonPoint);


const drawPolygon = function(){
    /* set the position of the polygon point */
    polygonPoint.set(Point.mouse.position)
    /*Draw many polygons at the point*/
    polygonPoint.pen.ngon(ctx, 5, 90)
    polygonPoint.pen.circleGon(ctx, 10)
    polygonPoint.pen.circleGon(ctx, 20)
    polygonPoint.pen.circleGon(ctx, 150, .2)

}
```

---

# Random Line


```js

const randomLine = PointList.generate.random(20, 500)

const drawRandomLine = function(){
    /* draw a randomly generated line path */

    /* Draw the horizon line - a straight project from A to B*/
    randomLine.draw.horizonLine(ctx)
    quickStroke('red')

    /* Draw each point as a line to its next sibling.*/
    randomLine.draw.pointLine(ctx)
    quickStroke('teal', 2)


    /* Draw each point; wrapping the _draw_ call_ with our own functionality.*/
    randomLine.draw.points(ctx, (item,f)=>{
        ctx.beginPath();
        f(item)
        quickStroke('pink', 2)
    })

    // May bleed if not applied.
    ctx.closePath();
}
```