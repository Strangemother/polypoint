/*
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/extras.js
    ../point_src/setunset.js
    ../point_src/stroke.js

 */
const canvas = document.getElementById('playspace');
const ctx = canvas.getContext('2d');
Point.mouse.listen(canvas)

var randomPoints;
var comPoint;
var weightedComPoint;
/* A basic setup for the small points. */
const rawPointConf = { circle: { color: 'orange', width: 1}}

const generate = function(pointCount=4){

    /* Generate a list. In this random... */
    randomPoints = PointList.generate.radius(pointCount, 100, point(200,200))

    /* Alter the positions of all the points,
    around a radius of 100, at a position. */
    // randomPoints = PointList.generate.random(pointCount)
    // randomPoints.shape.radius(100, point(200,200))

    /* Customise the points, randomising the mass and rotation. */
    randomPoints.forEach(p => {
            let mass = Math.random() * 10
            p.mass = mass
            p.rotation = Math.random() * 360
            p.radius = Math.max(5, mass)
        })

    /* Call upon the list "center of mass" function */
    comPoint = randomPoints.centerOfMass()
    /* In this case we cater for mass and rotation additions */
    weightedComPoint = randomPoints.centerOfMass('deep')
}


const update = function() {
    ctx.beginPath()
    drawView()
}


generate();


const drawView = function(){
    /* Use the pen to draw a simple circle at the Center of Mass.*/
    comPoint.pen.circle(ctx, undefined, 'teal', 3)

    // quickStroke('white', 1, ()=>comPoint.draw.circle(ctx)

    /* Draw an indicator at the _weighted_ Center of Mass. */
    weightedComPoint.pen.indicator(ctx)

    /* Draw a circle at the origin points */
    randomPoints.pen.indicators(ctx, rawPointConf)

    /* Render a line through all the points. When we "draw" (not pen), the
    next action should be a fill or stroke. */
    // randomPoints.draw.pointLine(ctx)
    // quickStroke('yellow', 1)

    // May bleed if not applied.
    ctx.closePath();
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

