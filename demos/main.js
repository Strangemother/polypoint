
const canvas = document.getElementById('playspace');
const ctx = canvas.getContext('2d');
Point.mouse.listen(canvas)

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


const drawPoints = function(pointsArray, position) {
    addMotion(pointsArray)
    drawPointLine(pointsArray, position)
}

const drawLine = function(line) {
    // Ensure the path restarts, ensuring the colors don't _bleed_ (from
    // last to first).
    ctx.beginPath();
    ctx.moveTo(line.a.x, line.a.y)
    ctx.lineTo(line.b.x, line.b.y)
}


const drawPointLine = function(pointsArray, position) {
    // To 'close' the old drawing.
    ctx.beginPath();

    let {x, y} = position
    for(let i=0; i < pointsArray.length-1; i++) {
        let segment = pointsArray[i]
        ctx.lineTo(segment.x + x, segment.y + y);
    }

    ctx.strokeStyle = 'white'
    ctx.stroke()
}


const toy = new Point(100, 100)
const b = point(100,100);

const polygonPoint = point(100, 100)
polygonPoint.radius = 30

const line = new Line(point(10, 10), toy)

const pl = PointList.generate.list(10, 20)
pl.setX(140)

const plRandom = PointList.generate.random(20, 500)
// wiggler.points = Point.pointArray(wiggler.segments, wiggler.length)


const UNSET = {}

const quickStroke = function(color='green', lineWidth=UNSET) {
    ctx.strokeStyle = color
    if(lineWidth != UNSET) {
        ctx.lineWidth = lineWidth
    }
    ctx.stroke()
}


var toyDistance = 60
var toyRotation = UP_DEG

const update = function() {

    ctx.beginPath()

    toy.project(toyDistance, toyRotation).draw.arc(ctx, 3);
    quickStroke('white', 1)

    pl.draw.horizonLine(ctx)

    quickStroke('white', 1)

    /* Use the same toy point for multiple draws. */
    toy.pen.circle(ctx)


    let np = new Point(projectFrom(toy))
    toy.pen.line(ctx, np)

    // toy.pen.line(ctx, Point.mouse.xy) // line from the point, to the mouse
    ctx.beginPath()

    /* When projecting from a point, we gain its initial rotation,
    projecting _forward_ (relative 0). */
    toy.project(toyDistance, toyRotation).draw.arc(ctx, 3);
    quickStroke('white', 1)

    drawRandomLine()
    drawPolygon()

    // renderDataLines()
    ctx.stroke()
    return
}



function projectFrom(origin, distance=undefined, rotation=undefined) {
    // Convert rotation angle from degrees to radians
    if(rotation === undefined) {
        rotation = origin.rotation
    }

    if(distance === undefined) {
        distance = origin.radius
    }

    const rotationInRadians = degToRad(rotation)

    // Calculate the new x and y coordinates
    const x = origin.x + distance * Math.cos(rotationInRadians);
    const y = origin.y + distance * Math.sin(rotationInRadians);

    return { x, y };
}


const drawRandomLine = function(){
    /* draw a randomly generated line path */

    /* Draw the horizon line - a straight project from A to B*/
    plRandom.draw.horizonLine(ctx)
    quickStroke('red')

    /* Draw each point as a line to its next sibling.*/
    plRandom.draw.pointLine(ctx)
    quickStroke('teal', 2)

    // ctx.beginPath();

    plRandom.draw.points(ctx, (item,f)=>{
        ctx.beginPath();
        f(item)
        quickStroke('pink', 2)
    })

    // quickStroke('pink', 2)

    // May bleed if not applied.
    ctx.closePath();
}


const drawPolygon = function(){

    /* set the position of the polygon point */
    polygonPoint.set(Point.mouse.position)

    /*Draw many polygons at the point*/
    polygonPoint.pen.ngon(ctx, 5, 90)
    polygonPoint.pen.circleGon(ctx, 10)
    polygonPoint.pen.circleGon(ctx, 20)
    polygonPoint.pen.circleGon(ctx, 150, .2)

    /* Apply the position of the polypoint manually.
    First get the offset mouse position,
    then draw a polygon. */
    // let offsetMouse = Point.mouse.position.add(-polygonPoint.radius)
    // polygonPoint.set(offsetMouse)
    // polyGen(ctx, 5, polygonPoint);
}


const renderDataLines = function(){

    for(let line of data.lines) {
        drawLine(line)
        ctx.strokeStyle = line.color
        ctx.lineWidth = line.width == undefined? 1: line.width
        ctx.stroke()
    }
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    update()
    requestAnimationFrame(draw);
}


let rect = canvas.getBoundingClientRect()
ctx.canvas.width  = rect.width;
ctx.canvas.height = rect.height;
draw()

