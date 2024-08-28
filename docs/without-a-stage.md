# No Stage? No Problem.

The `Polypoint.Stage` and all the other tools work independently. As such you can use Polypoint tools on your existing canvas.

## Quick Example:

In this example we calculate the center of mass for a list of points.

```js

const canvas = document.getElementById('playspace');
const ctx = canvas.getContext('2d');
Point.mouse.listen(canvas)

var randomPoints;
var comPoint;
var weightedComPoint;
/* A basic setup for the small points. */
const rawPointConf = { circle: { color: 'orange', width: 1}}

/* ----------------------- canvas animation frame loop --------------------- */
const runExample = function(){
    generate();

    let rect = canvas.getBoundingClientRect()
    ctx.canvas.width  = rect.width;
    ctx.canvas.height = rect.height;

    draw()
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath()
    drawView()
    // May bleed if not applied.
    ctx.closePath();

    requestAnimationFrame(draw);
}

/* ------------------ Polypoint drawing tools ------------------------*/

const generate = function(pointCount=4){
    /* Generate a list. In this random... */
    randomPoints = PointList.generate.radius(pointCount, 100, point(200,200))
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


const drawView = function(){
    /* Use the pen to draw a simple circle at the Center of Mass.*/
    comPoint.pen.circle(ctx, undefined, 'teal', 3)
    /* Draw an indicator at the _weighted_ Center of Mass. */
    weightedComPoint.pen.indicator(ctx)
    /* Draw a circle at the origin points */
    randomPoints.pen.indicators(ctx, rawPointConf)

}


;runExample();
```