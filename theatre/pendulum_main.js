
const canvas = document.getElementById('playspace');
const ctx = canvas.getContext('2d');
Point.mouse.listen(canvas)


const pendulum_main = function(){

    let rect = canvas.getBoundingClientRect()
    ctx.canvas.width  = rect.width;
    ctx.canvas.height = rect.height;

    let line = setupPendulum()
    start(line)
    solve()

    draw()
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    update()
    requestAnimationFrame(draw);
}


var _solve = false;
var UC = 0
let solve = ()=> _solve = true;
const update = function() {
    UC++;
    if(randomLine) drawMyLine()
    // if(UC % 3 != 0){ return;}
    if (_solve) solveLine(randomLine)
    // if(randomLine) drawMyLine('white')
}

var DIV = 10000

var leftOffset;

var randomLine;
var length = 100;
// var DIV = 10000
// var gravity = 0.6 / DIV;
// var friction = 0.009 / DIV;
var DIV = 100
var gravity = .6 / DIV;
var friction = .009 / DIV;
var members = 4; // Model.members;

const setupPendulum = function (){
    leftOffset = canvas.width * .5;

    randomLine = PointList.generate.list(members, length)
    randomLine.setY(200)

    randomLine.setX((e,i,a)=>{
        e.x = leftOffset + (i*length)
    })

    randomLine.forEach((p)=>{
        p.vTheta = 0
        p.theta = -45 * Math.PI / 180;
    })

    // randomLine[0].isDrag = true
    // randomLine[1].x -= 50;
    // randomLine[1].y -= 50;

    // randomLine[3].x -= 50;
    // randomLine[3].y -= 50;
    return randomLine;
}



function start(pointList) {

    var i = 0;
    var n = 0;
    //
    var point;
    var theta = -45 * Math.PI / 180;

    pointList[0].isDrag = true;

    for (i = 0; i < pointList.length; i++) {
        // addChild(point);
        let point = pointList[i]
        // point.x = point.x + length * Math.cos(theta);
        // point.y = point.y + length * Math.sin(theta);
    }

    // addEventListener(Event.ENTER_FRAME, enterFrameListener,false,0,false);
}


const solveLine = function(pointList){
    let n = pointList.length;
    const gl = gravity / n;
    const gravity_direction = DOWN;

    for(let i = 1; i < n; i++) {
        let pre_point = pointList[i-1];
        let point = pointList[i];

        if (point.isDrag) {
            let theta = pre_point.atan2()
            point.x = pre_point.x + length * Math.cos(theta);
            point.y = pre_point.y + length * Math.sin(theta);
            point.vTheta = 0;
            continue
        }

        let theta = point.getTheta(pre_point, gravity_direction)
        // simple harmonic motion with the parent
        let aTheta = -1 * gl * Math.sin(theta);
        point.vTheta += aTheta - friction * point.vTheta;

        if(i < n - 1) {
            let next_point = pointList[i + 1];
            // next_theta = Math.atan2(next_point.y - point.y, next_point.x - point.x) - gravity_direction;
            let next_theta = next_point.getTheta(point, gravity_direction)
            aTheta = gl * Math.sin(next_theta - theta);
            point.vTheta += aTheta - friction * point.vTheta;
        }

        theta += point.vTheta + gravity_direction;
        point.x = pre_point.x + length * Math.cos(theta);
        point.y = pre_point.y + length * Math.sin(theta);
    }
}

const drawMyLine = function(color='teal'){
    /* draw a randomly generated line path */

    /* Draw the horizon line - a straight project from A to B*/
    // randomLine.draw.horizonLine(ctx)
    // quickStroke('red')

    /* Draw each point as a line to its next sibling.*/
    randomLine.draw.pointLine(ctx)
    quickStroke(color, 5)


    /* Draw each point; wrapping the _draw_ call_ with our own functionality.*/
    randomLine.pen.points(ctx, (item,f)=>{
        ctx.beginPath();
        f(item)
        quickStroke('pink', 3)
    })

    // quickStroke('red')
    // May bleed if not applied.
    ctx.closePath();
}



;pendulum_main();