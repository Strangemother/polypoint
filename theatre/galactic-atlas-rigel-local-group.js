/*
title: Galactic Atlas — Rigel to the Local Group
categories: astronomy, vector, interactive
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
 mounted(){
  this.t=0;this.zoom=1;this.offsetX=0;this.offsetY=0;
  this.keys={};
  window.addEventListener('keydown',e=>{this.keys[e.code]=true;if(e.code.startsWith('Arrow')||e.code==='Equal'||e.code==='Minus')e.preventDefault()});
  window.addEventListener('keyup',e=>this.keys[e.code]=false);
  this.nodes=[
   {x:-300,y:110,name:'RIGEL',sub:'ORION · BLUE SUPERGIANT',r:10,c:'#85dfff',orb:3},
   {x:-175,y:40,name:'BETELGEUSE',sub:'ORION',r:7,c:'#ff806a',orb:2},
   {x:-60,y:115,name:'SOL',sub:'SOLAR SYSTEM',r:9,c:'#ffe79b',orb:4},
   {x:65,y:10,name:'SIRIUS',sub:'CANIS MAJOR',r:7,c:'#b9efff',orb:1},
   {x:180,y:-92,name:'PROXIMA CEN',sub:'CENTAURUS',r:6,c:'#ff9b89',orb:1},
   {x:280,y:30,name:'MILKY WAY',sub:'HOST GALAXY',r:12,c:'#86ffcc',orb:3},
   {x:335,y:-175,name:'ANDROMEDA',sub:'LOCAL GROUP',r:11,c:'#deafff',orb:2}
  ];
  this.edges=[[0,1],[0,2],[1,2],[2,3],[3,4],[2,5],[4,5],[5,6]];
 }
 draw(ctx){
  const w=this.canvas.width,h=this.canvas.height,t=this.t++/60;
  this.offsetX+=((this.keys.ArrowLeft?1:0)-(this.keys.ArrowRight?1:0))*3;
  this.offsetY+=((this.keys.ArrowUp?1:0)-(this.keys.ArrowDown?1:0))*3;
  if(this.keys.Equal||this.keys.NumpadAdd)this.zoom=Math.min(2.2,this.zoom*1.016);
  if(this.keys.Minus||this.keys.NumpadSubtract)this.zoom=Math.max(.5,this.zoom/1.016);
  ctx.fillStyle='#030810';ctx.fillRect(0,0,w,h);
  for(let i=0;i<125;i++){
   let x=((i*79.73+13)%997)/997*w, y=((i*137.29+7)%701)/701*h;
   ctx.fillStyle=i%6?'#365b67':'#80b4bc';ctx.globalAlpha=.35+.2*Math.sin(t+i);
   ctx.fillRect(x,y,i%5===0?1.6:1,1);
  }
  ctx.globalAlpha=1;
  const s=Math.min(w/900,h/600)*this.zoom;
  ctx.save();ctx.translate(w/2+this.offsetX,h/2+this.offsetY);ctx.scale(s,s);
  ctx.strokeStyle='#183740';ctx.lineWidth=.75;
  for(let x=-600;x<=600;x+=50){ctx.beginPath();ctx.moveTo(x,-450);ctx.lineTo(x,450);ctx.stroke();}
  for(let y=-450;y<=450;y+=50){ctx.beginPath();ctx.moveTo(-600,y);ctx.lineTo(600,y);ctx.stroke();}
  ctx.strokeStyle='#39b3a1';ctx.lineWidth=1.2;
  for(const [a,b] of this.edges){
   const p=this.nodes[a],q=this.nodes[b];
   ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
   const u=(t*.13+a*.17)%1;
   ctx.fillStyle='#c8ffe8';ctx.beginPath();ctx.arc(p.x+(q.x-p.x)*u,p.y+(q.y-p.y)*u,2.1,0,Math.PI*2);ctx.fill();
  }
  this.nodes.forEach((n,i)=>{
   const pulse=.7+.3*Math.sin(t*2+i);
   ctx.strokeStyle=n.c;ctx.fillStyle=n.c;ctx.shadowColor=n.c;ctx.shadowBlur=9;
   ctx.beginPath();ctx.arc(n.x,n.y,n.r*pulse,0,2*Math.PI);ctx.fill();ctx.shadowBlur=0;
   for(let j=0;j<n.orb;j++){
    const rr=n.r+12+j*8;
    ctx.strokeStyle=j%2?'#406b82':'#689497';ctx.lineWidth=.8;
    ctx.beginPath();ctx.ellipse(n.x,n.y,rr,rr*.43,-.4,0,Math.PI*2);ctx.stroke();
    let theta=t*(.27+j*.09)+(i+j)*2.1;
    const px=n.x+rr*Math.cos(theta),py=n.y+rr*.43*Math.sin(theta);
    ctx.fillStyle='#a2f5ed';ctx.beginPath();ctx.arc(px,py,2.3,0,Math.PI*2);ctx.fill();
   }
   ctx.strokeStyle=n.c;ctx.beginPath();ctx.moveTo(n.x+8,n.y-8);ctx.lineTo(n.x+28,n.y-27);ctx.lineTo(n.x+42,n.y-27);ctx.stroke();
   ctx.font='bold 10px monospace';ctx.textAlign='left';ctx.fillStyle=n.c;ctx.fillText(n.name,n.x+46,n.y-29);
   ctx.font='8px monospace';ctx.fillStyle='#8ca6b4';ctx.fillText(n.sub,n.x+46,n.y-17);
  });
  ctx.restore();
  ctx.textAlign='left';ctx.fillStyle='#a7efd8';ctx.font='14px monospace';
  ctx.fillText('GALACTIC ATLAS // NAVIGATION VECTOR',23,29);
  ctx.font='11px monospace';ctx.fillStyle='#74a3ad';ctx.fillText('RIGEL → LOCAL GROUP  |  SCHEMATIC · NOT TO SCALE',23,50);
  ctx.fillText('ARROWS PAN   +/- ZOOM',23,h-21);
  ctx.textAlign='right';ctx.fillStyle='#b9de91';ctx.fillText('SECTOR 001 // MOSTLY HARMLESS',w-23,h-21);
 }
}
stage=MainStage.go();