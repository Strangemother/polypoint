
const canvas = document.getElementById('playspace');
const ctx = canvas.getContext('2d');

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

const point = function(p) {
    if(Array.isArray(p)) {
        return { x: p[0], y:p[1]}
    }
    return p
}

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


const update = function() {

    for(let line of data.lines) {
        drawLine(line)
        ctx.strokeStyle = line.color
        ctx.lineWidth = line.width == undefined? 1: line.width
        ctx.stroke()
    }


}

const drawLine = function(line) {
    const result = getCatenaryCurve(line.a, line.b, line.length)

    // Ensure the path restarts, ensuring the colors don't _bleed_ (from
    // last to first).
    ctx.beginPath();

    ctx.moveTo(result.start[0], result.start[1])

    for (let i = 0; i < result.curves.length; i++) {
      ctx.quadraticCurveTo(
        result.curves[i][0], // cpx
        result.curves[i][1], // cpy
        result.curves[i][2], // x
        result.curves[i][3], // y
      )
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