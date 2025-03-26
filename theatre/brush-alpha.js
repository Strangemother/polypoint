/*
title: Raw Brush
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/extras.js
    ../point_src/random.js
    ../point_src/functions/clamp.js
    ../point_src/distances.js
    ../point_src/gradient.js
---

*/
;(()=>{

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

function brushDraw(ctx, mouseIsPressed) {

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
        let c = this.center.copy().update({
                radius: this.center.radius + 40
                , color:"hsl(299deg 62% 44%)"
            })

        let g = (new Gradient).linear(this.center)
        g.addStops({
            0: "hsl(299deg 62% 44%)",
            1: "hsl(244deg 71% 56%)"
        })
        let grad = g.linear()
        this.ctx.strokeStyle = grad// 'green'
    }

    draw(ctx){
        // this.clear(ctx)
        let pos = this.mouse.position
        brushDraw(ctx, this.mouse.isDown(0))
        mouseX = pos.x
        mouseY = pos.y
    }
}


;stage = MainStage.go();

})()
