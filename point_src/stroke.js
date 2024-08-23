// const drawPointLine = function(pointsArray, position) {
//     // To 'close' the old drawing.
//     ctx.beginPath();

//     let {x, y} = position
//     for(let i=0; i < pointsArray.length-1; i++) {
//         let segment = pointsArray[i]
//         ctx.lineTo(segment.x + x, segment.y + y);
//     }

//     ctx.strokeStyle = 'white'
//     ctx.stroke()
// }

const UNSET = {}


const quickStroke = function(color='green', lineWidth=UNSET, f) {
    ctx.strokeStyle = color
    if(lineWidth != UNSET) {
        ctx.lineWidth = lineWidth
    }

    f && f()

    ctx.stroke()
}



const quickStrokeWithCtx = function(ctx, color='green', lineWidth=UNSET, f) {
    ctx.strokeStyle = color
    if(lineWidth != UNSET) {
        ctx.lineWidth = lineWidth
    }

    f && f()

    ctx.stroke()
}
