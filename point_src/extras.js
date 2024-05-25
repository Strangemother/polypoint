const drawLine = function(line) {
    // Ensure the path restarts, ensuring the colors don't _bleed_ (from
    // last to first).
    ctx.beginPath();
    ctx.moveTo(line.a.x, line.a.y)
    ctx.lineTo(line.b.x, line.b.y)
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



const approx_distance = function(dx,dy ) {

   if ( dx < 0 ) dx = -dx;
   if ( dy < 0 ) dy = -dy;

    let min = dy;
    let max = dx;
    if(dx < dy) {
        min = dx;
        max = dy;
   }

   let approx = ( max * 1007 ) + ( min * 441 );
   if ( max < ( min << 4 )) {
      approx -= ( max * 40 );
   }

   // add 512 for proper rounding
   return (( approx + 512 ) >> 10 );
}



const approx_distance2 = function(dx,dy ) {
   let min, max;

   if ( dx < 0 ) dx = -dx;
   if ( dy < 0 ) dy = -dy;

   if ( dx < dy )
   {
      min = dx;
      max = dy;
   } else {
      min = dy;
      max = dx;
   }

   // coefficients equivalent to ( 123/128 * max ) and ( 51/128 * min )
   return ((( max << 8 ) + ( max << 3 ) - ( max << 4 ) - ( max << 1 ) +
            ( min << 7 ) - ( min << 5 ) + ( min << 3 ) - ( min << 1 )) >> 8 );
}
