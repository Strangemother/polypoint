/*
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/point-content.js
    pointlist
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/extras.js
    ../point_src/setunset.js
    ../point_src/stroke.js


 */
const canvas = document.getElementById('playspace');
const ctx = canvas.getContext('2d');
Point.mouse.mount(canvas)


// var t = 0;
// let spinSpeed = 2
let pointSpread = 55 /* Distance between points */
let rowCount = 10 /* How many items per row within the grid */

const pointList = PointList.generate.list(100, 0)

/* To set the position of the grid generator, we can just edit the
first point. */
pointList[0].set(50, 50)
/* Then reshape internally */
pointList.shape.grid(pointSpread, rowCount)

pointList.forEach(p=>{
    p.radius=10
    p.rotation = Math.random() * 360
})

const update = function() {
    ctx.beginPath()
    drawGrid()
}

const drawGrid = function(){

    /* set the position of the polygon point */
    // pointList[0].set(Point.mouse.position)
    // pointList.draw.pointLine(ctx)
    quickStroke('red', 1)
    // t = (t + 1) % 360

    let mousePoint = Point.mouse.position
    /* Draw each point; wrapping the _draw_ call_ with our own functionality.*/
    pointList.pen.points(ctx, (item,f)=>{
        ctx.beginPath();

        // item._rotationDegrees = item.UP + (t * spinSpeed) % 360
        // item.rotation += spinSpeed
        item.lookAt(mousePoint)

        f(item)
        item.project().draw.lineTo(ctx, item)
        // item.project().draw.line(ctx, 1);
        quickStroke('pink', 1)
    })

    // pointList[0].pen.ngon(ctx, 5, 90)
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

