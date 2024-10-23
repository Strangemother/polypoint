
// brushSize simply is the thikness of the brush stroke
let mouseX, mouseY;
let brushSize = 10;
let f = 0.5;
let spring = 0.4;
let friction = 0.45;
let v = 0.5;
let r = 0;
let vx = 0;
let vy = 0;
let splitNum = 100;
let diff = 2;

function draw(ctx, mouseIsPressed) {

  let strokeWeight = (v)=>ctx.lineWidth=v;
  let line = function(x1, y1, x2, y2){
    ctx.beginPath(); // Start a new path
    ctx.moveTo(x1, y1); // Move the pen to (30, 50)
    ctx.lineTo(x2, y2); // Draw a line to (150, 100)
    ctx.stroke(); // Render the path
  }
  if(mouseIsPressed) {
    if(!f) {
      f = true;
      x = mouseX;
      y = mouseY;
    }
    vx += ( mouseX - x ) * spring;
    vy += ( mouseY - y ) * spring;
    vx *= friction;
    vy *= friction;

    v += Math.sqrt( vx*vx + vy*vy ) - v;
    v *= 0.6;

    oldR = r;
    r = brushSize - v;

    for( let i = 0; i < splitNum; ++i ) {
      oldX = x;
      oldY = y;
      x += vx / splitNum;
      y += vy / splitNum;
      oldR += ( r - oldR ) / splitNum;
      if(oldR < 1) { oldR = 1; }

      strokeWeight( oldR+diff );  // AMEND: oldR -> oldR+diff
      line( x, y, oldX, oldY );
      strokeWeight( oldR );  // ADD
      line( x+diff*1.5, y+diff*2, oldX+diff*2, oldY+diff*2 );  // ADD
      line( x-diff, y-diff, oldX-diff, oldY-diff );  // ADD
    }

  } else if(f) {
    vx = vy = 0;
    f = false;
  }
}



class MainStage extends Stage {
    canvas='playspace'
    // live=false
    live = true
    mounted(){
    }

    draw(ctx){
        // this.clear(ctx)
        let pos = this.mouse.position
        draw(ctx, this.mouse.isDown(0))
        mouseX = pos.x
        mouseY = pos.y
    }
}


;stage = MainStage.go();