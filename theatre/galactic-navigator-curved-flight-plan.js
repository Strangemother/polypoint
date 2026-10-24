/*
title: Galactic Navigator — Curved Flight Plan
categories: geometry, astronomy, vector, navigation
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/stage.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/functions/clamp.js
    ../point_src/dragging.js
*/
class MainStage extends Stage {
 canvas='playspace';
 mounted(){this.t=0;this.zoom=1;this.panX=0;this.panY=0;this.keys={};window.addEventListener('keydown',e=>{this.keys[e.code]=true;if(e.code.startsWith('Arrow')||e.code==='Equal'||e.code==='Minus')e.preventDefault()});window.addEventListener('keyup',e=>{this.keys[e.code]=false});}
 draw(ctx){
 const w=this.canvas.width,h=this.canvas.height,t=this.t++/60;
 this.panX+=((this.keys.ArrowLeft?1:0)-(this.keys.ArrowRight?1:0))*2.5;
 this.panY+=((this.keys.ArrowUp?1:0)-(this.keys.ArrowDown?1:0))*2.5;
 if(this.keys.Equal||this.keys.NumpadAdd)this.zoom=Math.min(3,this.zoom*1.012);
 if(this.keys.Minus||this.keys.NumpadSubtract)this.zoom=Math.max(.55,this.zoom/1.012);
 ctx.fillStyle='#080d14';ctx.fillRect(0,0,w,h);
 const k=Math.min(w/950,h/640)*this.zoom;
 ctx.save();ctx.translate(w/2+this.panX,h/2+this.panY);ctx.scale(k,k);
 const nodes=[
 [-340,100,0,'RIGEL','#84a5b6',11],
 [-195,-75,45,'ORION WAYPOINT','#b4a69b',15],
 [-20,115,-35,'SOL','#d5bd8a',12],
 [146,-70,78,'OUTER BEACON','#91b2aa',18],
 [310,48,-42,'LOCAL SECTOR','#b4a0b9',25]
 ];
 const project=p=>[p[0]+p[2]*.36,p[1]-p[2]*.2];
 for(let i=0;i<160;i++){
  let x=((i*127.73)%947)-475,y=((i*283.19)%641)-320;
  ctx.fillStyle='#6d8993';ctx.globalAlpha=.16+(i%5)*.04;
  ctx.fillRect(x,y,1,1);
 }ctx.globalAlpha=1;
 ctx.strokeStyle='#1b303c';ctx.lineWidth=.8;
 for(let i=-4;i<=4;i++){ctx.beginPath();ctx.moveTo(-440,i*65);ctx.lineTo(440,i*65);ctx.stroke();}
 // Projected systems, faint orbit rings and local reference grids.
 for(let i=0;i<nodes.length;i++){
  const n=nodes[i],p=project(n);
  ctx.strokeStyle='#41545e';ctx.lineWidth=.8;
  ctx.beginPath();ctx.ellipse(p[0],p[1],n[5]+17,(n[5]+17)*.35,-.24,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();ctx.ellipse(p[0],p[1],n[5]+28,(n[5]+28)*.35,-.24,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle=n[4];ctx.beginPath();ctx.arc(p[0],p[1],n[5]*.45,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=n[4];ctx.beginPath();ctx.arc(p[0],p[1],n[5],0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#99afb6';ctx.font='11px monospace';ctx.fillText(String(i+1).padStart(2,'0')+'  '+n[3],p[0]+n[5]+12,p[1]-n[5]-8);
 }
 // Hand-shaped curved 3D-like navigation path with clearances around each system.
 const route=[
  [-405,157],[-345,129],[-301,68],[-270,40],
  [-225,3],[-200,12],[-140,-12],
  [-75,29],[-74,177],[20,181],
  [99,167],[91,-117],[175,-110],
  [247,-102],[242,115],[355,113]
 ];
 const path=new Path2D();path.moveTo(route[0][0],route[0][1]);
 for(let i=1;i+2<route.length;i+=3){
   path.bezierCurveTo(route[i][0],route[i][1],route[i+1][0],route[i+1][1],route[i+2][0],route[i+2][1]);
 }
 ctx.strokeStyle='#334d4f';ctx.lineWidth=8;ctx.stroke(path);
 ctx.strokeStyle='#b2d6c6';ctx.lineWidth=2.2;ctx.setLineDash([8,6]);ctx.lineDashOffset=-t*25;ctx.stroke(path);ctx.setLineDash([]);
 // Travelling navigation pulse follows sampled cubic segments.
 const segment=Math.floor((t*.22)%5),u=(t*.22)%1,ix=segment*3;
 function bez(a,b,c,d,v){const q=1-v;return q*q*q*a+3*q*q*v*b+3*q*v*v*c+v*v*v*d}
 const pos=[0,1].map(axis=>bez(route[ix][axis],route[ix+1][axis],route[ix+2][axis],route[ix+3][axis],u));
 ctx.fillStyle='#f0eac2';ctx.beginPath();ctx.arc(pos[0],pos[1],4,0,Math.PI*2);ctx.fill();
 ctx.restore();
 ctx.textAlign='left';ctx.font='14px monospace';ctx.fillStyle='#b8d5cd';ctx.fillText('NAVIGATION / CURVED TRANSIT PLAN',22,32);
 ctx.font='11px monospace';ctx.fillStyle='#849c9c';ctx.fillText('LOCAL STELLAR SPACE  ·  SCHEMATIC / NOT TO SCALE',22,53);
 ctx.fillText('ARROWS: PAN     +/-: ZOOM',22,h-20);
 ctx.textAlign='right';ctx.fillStyle='#a9c6ae';ctx.fillText('ROUTE CLEARANCE: NOMINAL',w-22,h-20);
 }
}
stage=MainStage.go();