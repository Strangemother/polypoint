/*
title: Wibble Golf
files:
    head
    stage
    point
    mouse
    dragging
    pointlist
---
Top-down mouse-controlled miniature golf with invisible slopes.
*/
class Golf extends Stage {
  canvas='playspace';
  mounted(){
    this.gameCanvas=document.getElementById('playspace');
    this.gameCanvas.width=900;
    this.gameCanvas.height=600;
    this.gameCanvas.style.maxWidth='100%';
    this.gameCanvas.style.height='auto';
    this.ball={x:210,y:300,vx:0,vy:0};this.hole={x:645,y:300};
    this.rocks=[{x:360,y:245,r:28},{x:500,y:368,r:30}];
    this.mouse=null;this.strokes=0;this.won=false;this.ready=true;
    this.gameCanvas.addEventListener('pointermove',e=>{
      const r=this.gameCanvas.getBoundingClientRect(),x=(e.clientX-r.left)*this.gameCanvas.width/r.width,y=(e.clientY-r.top)*this.gameCanvas.height/r.height,t=performance.now();
      if(this.mouse && !this.won){
        const dx=x-this.mouse.x,dy=y-this.mouse.y,d2=dx*dx+dy*dy,elapsed=t-this.mouse.t;
        if(d2>0 && elapsed<200){
          const u=Math.max(0,Math.min(1,((this.ball.x-this.mouse.x)*dx+(this.ball.y-this.mouse.y)*dy)/d2));
          const sep=Math.hypot(this.mouse.x+dx*u-this.ball.x,this.mouse.y+dy*u-this.ball.y);
          if(sep<19 && this.ready && elapsed>0){
            let power=Math.min(17,Math.hypot(dx,dy)/Math.max(8,elapsed)*4.3);
            this.ball.vx+=dx/Math.sqrt(d2)*power;this.ball.vy+=dy/Math.sqrt(d2)*power;
            this.strokes++;this.ready=false;
          }
          if(sep>35)this.ready=true;
        }
      }
      this.mouse={x,y,t};
    });
    this.gameCanvas.addEventListener('pointerleave',()=>{this.mouse=null;this.ready=true});
    this.last=performance.now();
  }
    
  shape(t){return {x:430+315*(Math.cos(t)-0.19*Math.cos(2*t)),y:305+174*Math.sin(t)}}
  inside(x,y){let inside=false,p=this.shape(0);for(let i=1;i<=180;i++){let q=this.shape(i*Math.PI*2/180);if((p.y>y)!==(q.y>y)&&x<(q.x-p.x)*(y-p.y)/(q.y-p.y)+p.x)inside=!inside;p=q}return inside}
  height(x,y){return 10*Math.sin(x/79)*Math.cos(y/85)+8*Math.cos((x+y)/110)}
  update(dt){
    const b=this.ball,h=this.height.bind(this);
    b.vx-=(h(b.x+2,b.y)-h(b.x-2,b.y))*0.025*dt;
    b.vy-=(h(b.x,b.y+2)-h(b.x,b.y-2))*0.025*dt;
    b.vx*=Math.pow(.982,dt);b.vy*=Math.pow(.982,dt);
    let x=b.x+b.vx*dt,y=b.y+b.vy*dt;
    if(!this.inside(x,y)){b.vx*=-.6;b.vy*=-.6;x=b.x+b.vx*dt;y=b.y+b.vy*dt;if(!this.inside(x,y)){x=b.x;y=b.y}}
    for(const o of this.rocks){let dx=x-o.x,dy=y-o.y,d=Math.hypot(dx,dy);if(d<o.r+10){let ux=dx/(d||1),uy=dy/(d||1);x=o.x+ux*(o.r+10);y=o.y+uy*(o.r+10);let v=b.vx*ux+b.vy*uy;if(v<0){b.vx-=1.7*v*ux;b.vy-=1.7*v*uy}}}
    b.x=x;b.y=y;
    if(Math.hypot(x-this.hole.x,y-this.hole.y)<13 && Math.hypot(b.vx,b.vy)<2.5){this.won=true;b.vx=0;b.vy=0}
  }
  draw(ctx){
    let dt=Math.min(2,(performance.now()-this.last)/16.67||1);this.last=performance.now();
    let w=this.gameCanvas.width,h=this.gameCanvas.height;
    ctx.fillStyle='#152925';ctx.fillRect(0,0,w,h);
    ctx.beginPath();for(let i=0;i<=220;i++){let p=this.shape(i*Math.PI*2/220);if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y)}ctx.closePath();
    ctx.fillStyle='#62ad70';ctx.fill();ctx.save();ctx.clip();
    for(let y=110;y<510;y+=13)for(let x=70;x<810;x+=13){let z=this.height(x,y);ctx.fillStyle=z>0?'rgba(208,255,182,.11)':'rgba(15,60,50,.09)';ctx.fillRect(x,y,11,11)}
    if(!this.won)for(let i=0;i<3;i++)this.update(dt/3);
    ctx.restore();ctx.strokeStyle='#d7dda0';ctx.lineWidth=7;ctx.stroke();
    for(let o of this.rocks){ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,Math.PI*2);ctx.fillStyle='#346b5a';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#b1caa3';ctx.stroke()}
    ctx.beginPath();ctx.arc(this.hole.x,this.hole.y,15,0,Math.PI*2);ctx.fillStyle='#162c24';ctx.fill();
    ctx.beginPath();ctx.moveTo(this.hole.x+8,this.hole.y);ctx.lineTo(this.hole.x+8,this.hole.y-53);ctx.strokeStyle='#fff5cc';ctx.lineWidth=3;ctx.stroke();
    ctx.fillStyle='#ee9e54';ctx.beginPath();ctx.moveTo(this.hole.x+8,this.hole.y-53);ctx.lineTo(this.hole.x+37,this.hole.y-43);ctx.lineTo(this.hole.x+8,this.hole.y-35);ctx.fill();
    if(!this.won){ctx.beginPath();ctx.arc(this.ball.x,this.ball.y,10,0,Math.PI*2);ctx.fillStyle='#fff9dc';ctx.fill()}
    ctx.fillStyle='#fff5d3';ctx.font='bold 24px sans-serif';ctx.fillText(this.won?'HOLED IN '+this.strokes+'!':'WIBBLE GOLF • '+this.strokes+' strokes',24,38);
    ctx.font='16px sans-serif';ctx.fillText('Move the mouse into the ball to BONK. No clicks.',24,65);
  }
}


stage = Golf.go();
