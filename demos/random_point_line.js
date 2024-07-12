
const canvas = document.getElementById('playspace');
const ctx = canvas.getContext('2d');
Point.mouse.listen(canvas)


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



;pendulum_main();