/*
title: Jupiter Vector Planet
categories: 3d, astronomy, animation
files:
    head
    point
    pointlist
    stage
---
Hollow Jupiter with vector winds, a particle Great Red Spot, and four orbiting moons.
*/
let seed=41821;
function rnd(){seed=(Math.imul(seed,1664525)+1013904223)|0;return (seed>>>0)/4294967296;}
class MainStage extends Stage {
 canvas='playspace'
 mounted(){
  this.t=0;this.pitch=.30;this.yaw=0;this.zoom=1;this.dx=0;this.dy=0;
  this.spot=Array.from({length:650},()=>({r:Math.sqrt(rnd()),a:rnd()*6.283,s:.004+rnd()*.003}));
  this.moons=[
   {name:'Io',r:1.55,s:.011,a:.3,c:'#efc98a',size:2.3},
   {name:'Europa',r:2.1,s:.007,a:1.7,c:'#e2ddc8',size:2.1},
   {name:'Ganymede',r:2.75,s:.0045,a:3.2,c:'#bcb5a5',size:3.1},
   {name:'Callisto',r:3.55,s:.0025,a:5.0,c:'#918579',size:2.8}
  ];
  this.minors=Array.from({length:28},(_,i)=>({r:2.8+rnd()*1.4,a:rnd()*6.283,s:(.0008+rnd()*.0017)*(i%3===0?-1:1),incl:(rnd()-.5)*2.7,node:rnd()*6.283}));
  const el=document.getElementById('playspace');
  if(el){
   el.style.touchAction='none';let prev=null;
   el.addEventListener('pointerdown',e=>{prev={x:e.clientX,y:e.clientY,id:e.pointerId};el.setPointerCapture(e.pointerId);});
   el.addEventListener('pointermove',e=>{if(!prev||prev.id!==e.pointerId)return;this.yaw+=(e.clientX-prev.x)*.008;this.pitch=Math.max(-1.55,Math.min(1.55,this.pitch+(e.clientY-prev.y)*.008));prev.x=e.clientX;prev.y=e.clientY;});
   const end=e=>{if(prev&&prev.id===e.pointerId)prev=null;};
   el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
   el.addEventListener('wheel',e=>{e.preventDefault();this.zoom=Math.max(.4,Math.min(2.7,this.zoom*Math.exp(-e.deltaY*.001)));},{passive:false});
  }
 }
 draw(ctx){
  this.clear(ctx);this.t++;
  const w=ctx.canvas.width,h=ctx.canvas.height,cx=w/2+this.dx,cy=h*.49+this.dy,R=Math.min(w*.125,h*.17)*this.zoom;
  const cp=Math.cos(this.pitch),sp=Math.sin(this.pitch),cyaw=Math.cos(this.yaw),syaw=Math.sin(this.yaw);
  const project=(x,y,z)=>{
   const xx=x*cyaw+z*syaw,zz=-x*syaw+z*cyaw;
   return {x:cx+xx*R,y:cy-(y*cp-zz*sp)*R,z:y*sp+zz*cp};
  };
  const globe=(lat,lon)=>{
   const c=Math.cos(lat),a=lon+this.t*.0007;
   return project(c*Math.sin(a),Math.sin(lat),c*Math.cos(a));
  };
  ctx.save();
  for(const m of this.moons){
   ctx.strokeStyle='rgba(169,180,190,.11)';ctx.lineWidth=.6;ctx.beginPath();
   for(let j=0;j<=160;j++){const a=j*Math.PI*2/160,p=project(m.r*Math.cos(a),0,m.r*Math.sin(a));if(j===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}
   ctx.stroke();
  }
  const moon=(m,front)=>{const a=m.a+this.t*m.s,p=project(m.r*Math.cos(a),0,m.r*Math.sin(a));if((p.z>=0)!==front)return;if(!front&&(p.x-cx)**2+(p.y-cy)**2<R*R)return;ctx.fillStyle=m.c;ctx.globalAlpha=front?1:.6;ctx.beginPath();ctx.arc(p.x,p.y,m.size*Math.max(.6,R/120),0,6.283);ctx.fill();};
  const tiny=front=>{for(const m of this.minors){
   const a=m.a+this.t*m.s,x=m.r*Math.cos(a),z=m.r*Math.sin(a),c=Math.cos(m.incl),n=m.node;
   const p=project(x*Math.cos(n)-z*c*Math.sin(n),z*Math.sin(m.incl),x*Math.sin(n)+z*c*Math.cos(n));
   if((p.z>=0)!==front)continue;
   if(!front&&(p.x-cx)**2+(p.y-cy)**2<R*R)continue;
   ctx.globalAlpha=front?.78:.4;ctx.fillStyle='#a4abb4';
   ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.5,R/145),0,6.283);ctx.fill();
  }ctx.globalAlpha=1;};
  tiny(false);this.moons.forEach(m=>moon(m,false));
  ctx.globalAlpha=1;ctx.strokeStyle='rgba(220,193,166,.8)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,R,0,6.283);ctx.stroke();
  for(let k=-9;k<=9;k++){
   const lat=k*.126;ctx.strokeStyle=k%3===0?'rgba(211,149,113,.57)':'rgba(232,204,168,.33)';ctx.lineWidth=.8;ctx.beginPath();let on=false;
   for(let j=0;j<=220;j++){
    const lon=-Math.PI+j*Math.PI/110,p=globe(lat+.012*Math.sin(7*lon+k+this.t*.004),lon);
    if(p.z<0){on=false;continue;}
    if(!on){ctx.moveTo(p.x,p.y);on=true;}else ctx.lineTo(p.x,p.y);
   }ctx.stroke();
  }
  for(const q of this.spot){
   const a=q.a+this.t*q.s*(1.2-q.r),p=globe(-.35+.16*q.r*Math.sin(a),-.57+.28*q.r*Math.cos(a));
   if(p.z<0)continue;
   ctx.globalAlpha=.3+.6*p.z;ctx.fillStyle=q.r<.55?'#e3a087':'#b95c4b';
   ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.5,R/175),0,6.283);ctx.fill();
  }
  tiny(true);this.moons.forEach(m=>moon(m,true));
  ctx.globalAlpha=1;ctx.fillStyle='#d8bfaa';ctx.font='12px sans-serif';ctx.textAlign='center';ctx.fillText('JUPITER  •  FOUR GALILEAN MOONS',cx,Math.min(h-12,cy+R*1.5));ctx.restore();
 }
}
;stage=MainStage.go();