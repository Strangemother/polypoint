/*
title: Random Point Line Generator
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/stage.js
 */
const canvas = document.getElementById('playspace');
const ctx = canvas.getContext('2d');
// Point.mouse.listen(canvas)


const pendulum_main = function(){
    let rect = canvas.getBoundingClientRect()
    ctx.canvas.width  = rect.width;
    ctx.canvas.height = rect.height;
    draw()
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    update()
    requestAnimationFrame(draw);
}

const update = function() {
    drawRandomLine()
}


const UNSET = {}


const quickStroke = function(color='green', lineWidth=UNSET) {
    ctx.strokeStyle = color
    if(lineWidth != UNSET) {
        ctx.lineWidth = lineWidth
    }
    ctx.stroke()
}

const randomLine = PointList.generate.random(20, 500)

const drawRandomLine = function(){
    /* draw a randomly generated line path */

    /* Draw the horizon line - a straight project from A to B*/
    ctx.beginPath();
    randomLine.draw.horizonLine(ctx)
    quickStroke('red')

    /* Draw each point as a line to its next sibling.*/
    randomLine.draw.pointLine(ctx)
    quickStroke('teal', 2)


    /* Draw each point; wrapping the _draw_ call_ with our own functionality.*/
    // randomLine.draw.pointLine(ctx)
    // randomLine.draw.points(ctx, (item,f)=>{
    //     ctx.beginPath();
    //     f(item)
    //     quickStroke('pink', 2)
    // })
    // quickStroke('pink', 2)

    // May bleed if not applied.
    ctx.closePath();
}



;pendulum_main();