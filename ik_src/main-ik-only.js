
const canvas = document.getElementById('playspace');
const ctx = canvas.getContext('2d');


const getLastMousePos = function(){
    return autoMouse.getMousePos(canvas)
}



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


class AutoMouse {

    constructor(parentClass) {
        this.parentClass = parentClass
        this.mouseCache = {x: 0, y: 0}
    }

    getMousePos(canvas) {
        var rect = this.getBoundingClientRect();
        let mouseCache = this.mouseCache
        return {
            x: mouseCache.x - rect.left,
            y: mouseCache.y - rect.top
        };
    }
    getBoundingClientRect(canvas) {
        if(canvas === undefined) {
            canvas = this.canvas;
        }
        return canvas.getBoundingClientRect();
    }

    listen(canvas, eventName='mousemove') {
        this.canvas = canvas
        canvas.addEventListener(eventName, event => {
            let bound = this.getBoundingClientRect();
            let x = event.clientX - bound.left - canvas.clientLeft;
            let y = event.clientY - bound.top - canvas.clientTop;
            this.mouseCache = {x,y}
        });
        return this;
    }

}


// const point = function(p, b) {
//     if(Array.isArray(p)) {
//         return { x: p[0], y:p[1]}
//     }

//     if(b !== undefined) {
//         return {x: p, y: b}
//     }

//     return p
// }


const pointArray = function(count=5, distance=10) {
    let res = []
    let f = (i) => point(0, distance*i);
    if(typeof(distance) == 'function') {
        f = distance
    }

    for(let i = 0; i<=count-1; i++){
        let p = f(i)
        res.push(p)
    }

    return res
}


const autoMouse = (new AutoMouse(Point)).listen(canvas)
Point.mouse = autoMouse
Point.pointArray = pointArray


const data = {
    lines: [
        {
            a: {x:50, y: 100}
            , b: {x:200, y: 160}
            , length: 400
            , color: 'yellow'
            , width: 3
        }
        , new Line([90, 130], [200, 300], 420)
        , new Line([290, 130], [200, 360], 320, 'green')
    ]
}


const drawPoints = function(pointsArray, position) {
    addMotion(pointsArray)
    drawPointLine(pointsArray, position)
}

const addMotion = function(pointsArray) {
    let width = wiggler.sineWidth
        , speed = wiggler.speed
        , delta = data.delta

    for(let i=0; i <= pointsArray.length-1; i++) {
        let p = pointsArray[i]
        // negative to swim _up_
        p.x = Math.sin(delta*speed + -i) * width
    }
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

var _list;

_list = createSegmentList(7, 50);
// console.log('head point', _list.head.point0)

function drawSegments(ctx) {
    // console.log('head point segments A', _list.head.point0)
    var count = 0;
    let mouse = getLastMousePos()
    _list.drag(new Point(mouse.x, mouse.y));
    // console.log('head point *segments', _list.head.point0)

    // To 'close' the old drawing.
    //
    ctx.beginPath();

    // ctx.clear();
    let headPoint = _list.head.point0;
    ctx.moveTo(headPoint.x, headPoint.y);

    var segment = _list.head;
    var i = 0;
    let points = []
    while(segment != null) {
        // if(isNaN(segment.point1.x)) {
        //     debugger;
        //     console.log(segment.point1.x, segment.point1.y)
        // }
        let p1 = segment.point1
        points.push(p1)
        // p1.lookAt(_list.head.point0)
        // p1.draw.circle(ctx)
        // ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p1.x, p1.y);
        segment = segment.next
        i++;
        //ctx.lineStyle(4, colors[count++ % colors.length]);
    }
    // debugger
    ctx.strokeStyle = 'white'
    ctx.stroke()
    // for (var segment = _list.head; segment != null; ) {
    // }
    //
    let last;
    for(let point of points) {
        point.pen.indicator(ctx)
        last?.lookAt(point)
        last = point
    }
}


data.delta = 0


const update = function() {
    data.delta += 1

    // drawPoints(wiggler.points, wiggler.position)

    ctx.lineWidth = 1
    ctx.stroke()

    // console.log('head point (update)', _list.head.point0)
    drawSegments(ctx)
    ctx.lineWidth = 2
    ctx.stroke()
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

