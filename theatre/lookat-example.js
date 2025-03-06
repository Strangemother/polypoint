/*
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/distances.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/extras.js
    ../point_src/setunset.js
    ../point_src/stroke.js

 */
const canvas = document.getElementById('playspace');
const ctx = canvas.getContext('2d');
Point.mouse.mount(canvas)


const lookerPoint = point(200, 200)
lookerPoint.radius = 100

const update = function() {
    ctx.beginPath()

    drawView()
}


const drawView = function(){

    // Draw a circle at the origin point.
    lookerPoint.pen.circle(ctx)
    quickStroke('green', 2)

    /* Then project the point; default radius, rotation; and draw a circle. */
    let targetPosition = Point.mouse.position;
    let distanceToMouse = lookerPoint.distanceTo(targetPosition)
    /* Clamp the object. */
    let distance = Math.min(distanceToMouse, lookerPoint.radius);
    // let distance = Math.max(distanceToMouse, lookerPoint.radius);
    /* Alterntively project to the distance of the mouse. */
    const projectedPoint = lookerPoint.project(distance)

    /* Draw from the projected point back to the origin. */
    projectedPoint.pen.line(ctx, lookerPoint)
    quickStroke('red', 1)

    /* And draw a circle at the tip of projection. */
    projectedPoint.pen.circle(ctx)
    quickStroke('yellow', 1)

    // lookatRaw();
    // lookatBuiltin()
    lookatFunc()
}

const lookatBuiltin = function() {
    let targetPosition = Point.mouse.position;
    lookerPoint.radians = lookerPoint.getTheta(targetPosition, Math.PI)
}

const lookatFunc = function() {
    let targetPosition = Point.mouse.position;
    lookerPoint.lookAt(targetPosition)
}

const lookatRaw = function() {
    let targetPosition = Point.mouse.position;
    // Calculate the differences in x and y coordinates
    const deltaX = targetPosition.x - lookerPoint.x;
    const deltaY = targetPosition.y - lookerPoint.y;

    // Calculate the angle in radians
    const angleRadians = Math.atan2(deltaY, deltaX);
    lookerPoint.radians = angleRadians

    // Convert the angle to degrees
    // const angleDegrees = angleRadians * (180 / Math.PI);
    // lookerPoint.rotation = angleDegrees


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

